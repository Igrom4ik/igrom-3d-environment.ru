import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../keystatic.config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { AlbumSchema, Album, PostSchema, Post } from '../validation/schemas';
import yaml from 'js-yaml';

const reader = createReader(process.cwd(), keystaticConfig);
const ALBUMS_DIR = path.join(process.cwd(), 'src/content/albums');
const POSTS_DIR = path.join(process.cwd(), 'src/app/(site)/blog/posts');
const PROJECTS_DIR = path.join(process.cwd(), 'src/app/(site)/work/projects');
const TELEGRAM_POSTS_DIR = path.join(process.cwd(), 'src/content/telegram-posts');
import { ProjectSchema, Project } from '../validation/schemas';

// --- Types ---
interface CacheEntry<T> {
  data: T;
  lastModified: number;
}

// In-memory cache store
const cache = {
  albums: new Map<string, CacheEntry<Album>>(),
  posts: new Map<string, CacheEntry<Post>>(),
  projects: new Map<string, CacheEntry<Project>>(),
  telegramPosts: new Map<string, CacheEntry<any>>(),
};

export class ContentService {
  // --- Albums ---

  static async getAlbum(slug: string): Promise<Album | null> {
    // 0. Check Cache (only for FS fallback effectively, or if we decide to cache Keystatic too)
    // Keystatic Reader might handle its own caching? 
    // For now, we mainly want to cache the expensive FS operations + matter parsing.
    
    // NOTE: We don't easily know file path here to check mtime BEFORE reading.
    // So we might need to modify logic to resolve path first.
    
    try {
      // 1. Try Keystatic Reader
      const album = await reader.collections.albums.read(slug);
      if (album) {
        const description = typeof album.description === 'function' 
            ? await album.description() 
            : album.description;
        return { ...album, description } as unknown as Album;
      }
    } catch (error) {
      console.warn(`[ContentService] Keystatic read failed for album: ${slug}`, error);
    }

    // 2. Fallback: File System
    return this.getAlbumFromFs(slug);
  }

  // Specialized method for the Custom Admin UI which needs raw Markdown string
  static async getAlbumRaw(slug: string): Promise<Album & { rawContent: string } | null> {
     return this.getAlbumFromFs(slug);
  }

  static async getAllAlbums(): Promise<{ slug: string; entry: Album }[]> {
    try {
      const albums = await reader.collections.albums.all();
      if (albums.length > 0) {
        return albums.map(a => ({ slug: a.slug, entry: a.entry as unknown as Album }));
      }
    } catch (error) {
      console.warn("[ContentService] Keystatic list failed", error);
    }

    // Fallback: File System
    return this.getAllAlbumsFromFs();
  }

  static async saveAlbum(slug: string, data: any): Promise<void> {
    // Ensure directory exists
    const albumDir = path.join(ALBUMS_DIR, slug);
    if (!fs.existsSync(albumDir)) {
      fs.mkdirSync(albumDir, { recursive: true });
    }

    const filePath = path.join(albumDir, 'index.mdoc');

    // Separate content (description) from frontmatter
    const { description, ...frontmatter } = data;
    
    // If description is AST (from Keystatic editor), we might need to serialize it back to markdown string?
    // OR if we are saving from the admin API which receives JSON.
    // The previous save API used `convertToMdoc` which just dumped content.
    // We assume `description` passed here is the markdown string content if coming from raw editor,
    // or we might need to handle AST if saving from Keystatic UI (but Keystatic UI handles its own saving).
    // The custom API seems to be for a custom editor?
    
    // For now, following the pattern in route.local.ts:
    const yamlString = yaml.dump(frontmatter, { lineWidth: -1 });
    const fileContent = `---\n${yamlString}---\n${(description as string) || ''}\n`;

    fs.writeFileSync(filePath, fileContent, 'utf8');
  }

  // --- Posts ---

  static async getPost(slug: string): Promise<Post | null> {
    try {
        const post = await reader.collections.posts.read(slug);
        if (post) {
            const content = typeof post.content === 'function' ? await post.content() : post.content;
            return { ...post, content } as unknown as Post;
        }
    } catch (e) {
        console.warn(`[ContentService] Keystatic read failed for post: ${slug}`, e);
    }
    return this.getPostFromFs(slug);
  }

  static async getAllPosts(): Promise<{ slug: string; entry: Post }[]> {
       try {
           const posts = await reader.collections.posts.all();
           if (posts.length > 0) return posts.map(p => ({ slug: p.slug, entry: p.entry as unknown as Post }));
       } catch (e) { console.warn("[ContentService] Keystatic list posts failed", e); }
       return this.getAllPostsFromFs();
   }

   // --- Projects ---

   static async getProject(slug: string): Promise<Project | null> {
       try {
           const project = await reader.collections.projects.read(slug);
           if (project) {
               const content = typeof project.content === 'function' ? await project.content() : project.content;
               return { ...project, content } as unknown as Project;
           }
       } catch (e) { console.warn(`[ContentService] Keystatic read failed for project: ${slug}`, e); }
       return this.getProjectFromFs(slug);
   }

   static async getAllProjects(): Promise<{ slug: string; entry: Project }[]> {
       try {
           const projects = await reader.collections.projects.all();
           if (projects.length > 0) return projects.map(p => ({ slug: p.slug, entry: p.entry as unknown as Project }));
       } catch (e) { console.warn("[ContentService] Keystatic list projects failed", e); }
       return this.getAllProjectsFromFs();
   }

   // --- Telegram Posts ---

   static async getTelegramPost(slug: string): Promise<any | null> {
       try {
           const post = await reader.collections.telegramPosts.read(slug);
           if (post) return post;
       } catch (e) { console.warn(`[ContentService] Keystatic read failed for telegram post: ${slug}`, e); }
       return this.getTelegramPostFromFs(slug);
   }

   static async getAllTelegramPosts(): Promise<{ slug: string; entry: any }[]> {
       try {
           const posts = await reader.collections.telegramPosts.all();
           if (posts.length > 0) return posts.map(p => ({ slug: p.slug, entry: p.entry }));
       } catch (e) { console.warn("[ContentService] Keystatic list telegram posts failed", e); }
       return this.getAllTelegramPostsFromFs();
   }

   static async getTelegramPostRaw(slug: string): Promise<any | null> {
       return this.getTelegramPostFromFs(slug);
   }
 
   // --- Helpers ---

  private static getCached<T>(
      map: Map<string, CacheEntry<T>>,
      key: string,
      filePath: string,
      readFn: () => T
  ): T | null {
      // Security: Path Traversal Protection
      const resolvedPath = path.resolve(filePath);
      const rootDir = process.cwd(); // Or use a more specific content root
      
      // Ensure the resolved path starts with the project root
      // In production, we might want to restrict to src/content specifically
      if (!resolvedPath.startsWith(rootDir)) {
          console.warn(`[ContentService] Blocked path traversal attempt: ${filePath}`);
          return null;
      }

      if (!fs.existsSync(resolvedPath)) return null;

      const stats = fs.statSync(resolvedPath);
      const mtime = stats.mtimeMs;

      const cached = map.get(key);
      if (cached && cached.lastModified === mtime) {
          return cached.data;
      }

      // Read fresh
      const data = readFn();
      map.set(key, { data, lastModified: mtime });
      return data;
  }

  private static getAlbumFromFs(slug: string): (Album & { rawContent: string }) | null {
    // Determine path first
    const indexPath = path.join(ALBUMS_DIR, slug, 'index.mdoc');
    const legacyPath = path.join(ALBUMS_DIR, `${slug}.mdoc`);
    
    let targetPath = null;
    if (fs.existsSync(indexPath)) targetPath = indexPath;
    else if (fs.existsSync(legacyPath)) targetPath = legacyPath;

    if (!targetPath) return null;

    // Use Cache
    return this.getCached(cache.albums, slug, targetPath, () => 
        this.readMdoc(targetPath!, slug)
    ) as (Album & { rawContent: string });
  }

  private static getAllAlbumsFromFs(): { slug: string; entry: Album }[] {
    if (!fs.existsSync(ALBUMS_DIR)) return [];
    
    const items = fs.readdirSync(ALBUMS_DIR);
    const results: { slug: string; entry: Album }[] = [];

    for (const item of items) {
      const fullPath = path.join(ALBUMS_DIR, item);
      const stat = fs.statSync(fullPath);
      
      let album: Album | null = null;

      if (stat.isDirectory()) {
        album = this.getAlbumFromFs(item);
      } else if (item.endsWith('.mdoc')) {
        album = this.getAlbumFromFs(item.replace('.mdoc', ''));
      }

      if (album) {
        results.push({ slug: item.replace('.mdoc', ''), entry: album });
      }
    }

    return results;
  }

  private static readMdoc(filePath: string, slug: string): Album & { rawContent: string } {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Mock Keystatic AST for description/content if it's a string
    // This ensures consumers receiving "Document" type don't crash
    const descriptionAST = [
      {
        type: 'paragraph',
        children: [{ text: content || '' }]
      }
    ];

    return {
      title: data.title || slug,
      description: descriptionAST, // Providing AST shape
      categorization: data.categorization,
      images: data.images,
      publishing: data.publishing,
      rawContent: content, // Provide raw content
      ...data // Spread other fields
    } as unknown as Album & { rawContent: string };
  }

  private static getPostFromFs(slug: string): Post | null {
      const dirPath = path.join(POSTS_DIR, slug);
      let filePath = path.join(dirPath, 'index.mdoc');
      if (!fs.existsSync(filePath)) {
          filePath = path.join(dirPath, 'index.mdx');
      }
      if (!fs.existsSync(filePath)) return null;

      return this.getCached(cache.posts, slug, filePath, () => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        
        // Return raw content string for MDX rendering
        return {
            title: data.title || slug,
            slug: slug,
            publishedAt: data.publishedAt,
            tag: data.tag,
            summary: data.summary,
            image: data.image,
            content: content, 
            ...data
        } as unknown as Post;
      });
   }

  private static getAllPostsFromFs(): { slug: string; entry: Post }[] {
       if (!fs.existsSync(POSTS_DIR)) return [];
       const items = fs.readdirSync(POSTS_DIR);
       const results: { slug: string; entry: Post }[] = [];
       for (const item of items) {
           const fullPath = path.join(POSTS_DIR, item);
           if (fs.statSync(fullPath).isDirectory()) {
               const post = this.getPostFromFs(item);
               if (post) results.push({ slug: item, entry: post });
           }
       }
       return results;
   }

   private static getProjectFromFs(slug: string): Project | null {
       const dirPath = path.join(PROJECTS_DIR, slug);
       // Projects likely follow similar structure: index.mdx or index.mdoc
       let filePath = path.join(dirPath, 'index.mdx');
       if (!fs.existsSync(filePath)) {
           filePath = path.join(dirPath, 'index.mdoc');
       }
       if (!fs.existsSync(filePath)) return null;

       return this.getCached(cache.projects, slug, filePath, () => {
           const fileContent = fs.readFileSync(filePath, 'utf-8');
           const { data, content } = matter(fileContent);
           
           const contentAST = [ { type: 'paragraph', children: [{ text: content || '' }] } ];

           return {
               title: data.title || slug,
               summary: data.summary,
               publishedAt: data.publishedAt,
               cover: data.cover,
               software: data.software,
               tags: data.tags,
               artstation: data.artstation,
               media: data.media,
               content: contentAST,
               ...data
           } as unknown as Project;
       });
   }

   private static getAllProjectsFromFs(): { slug: string; entry: Project }[] {
        if (!fs.existsSync(PROJECTS_DIR)) return [];
        const items = fs.readdirSync(PROJECTS_DIR);
        const results: { slug: string; entry: Project }[] = [];
        for (const item of items) {
            const fullPath = path.join(PROJECTS_DIR, item);
            if (fs.statSync(fullPath).isDirectory()) {
                const project = this.getProjectFromFs(item);
                if (project) results.push({ slug: item, entry: project });
            }
        }
        return results;
    }

    private static getTelegramPostFromFs(slug: string): any | null {
        let filePath = path.join(TELEGRAM_POSTS_DIR, `${slug}.mdoc`);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(TELEGRAM_POSTS_DIR, `${slug}.md`);
        }
        if (!fs.existsSync(filePath)) return null;

        return this.getCached(cache.telegramPosts, slug, filePath, () => {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            return {
                ...data,
                content: content
            };
        });
    }

    private static getAllTelegramPostsFromFs(): { slug: string; entry: any }[] {
        if (!fs.existsSync(TELEGRAM_POSTS_DIR)) return [];
        const items = fs.readdirSync(TELEGRAM_POSTS_DIR);
        const results: { slug: string; entry: any }[] = [];
        for (const item of items) {
            if (item.endsWith('.mdoc') || item.endsWith('.md')) {
                const slug = item.replace(/\.(mdoc|md)$/, '');
                const post = this.getTelegramPostFromFs(slug);
                if (post) results.push({ slug, entry: post });
            }
        }
        return results;
    }
  }
