import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { log } from './logger';

const reader = createReader(process.cwd(), keystaticConfig);

export async function getSettings() {
  try {
    const settings = await reader.singletons.settings.read();
    return settings;
  } catch (error) {
    console.error("Failed to read settings:", error);
    return null;
  }
}

export async function getHomeSettings() {
  try {
    return await reader.singletons.home.read();
  } catch (error) {
    console.error("Failed to read home settings:", error);
    return null;
  }
}

export async function getDesignSettings() {
  try {
    return await reader.singletons.design.read();
  } catch (error) {
    console.error("Failed to read design settings:", error);
    return null;
  }
}

export async function getWorkSettings() {
  try {
    return await reader.singletons.work.read();
  } catch (error) {
    console.error("Failed to read work settings:", error);
    return null;
  }
}

export async function getGallerySettings() {
  try {
    return await reader.singletons.gallery.read();
  } catch (error) {
    console.error("Failed to read gallery settings:", error);
    return null;
  }
}

export async function getTelegramSettings() {
  try {
    return await reader.singletons.telegramSettings.read();
  } catch (error) {
    console.error("Failed to read telegram settings:", error);
    return null;
  }
}

export async function getAlbums() {
  log("getAlbums called");
  let albums: any[] = [];
  
  try {
    albums = await reader.collections.albums.all();
    
    // Sort by priority (ascending: 0, 10, 20...)
    albums.sort((a, b) => {
        const priorityA = a.entry.priority || 0;
        const priorityB = b.entry.priority || 0;
        return priorityA - priorityB;
    });

    log("Keystatic albums count:", albums.length);
  } catch (error: any) {
    log("Keystatic reader failed:", error.message || String(error));
    // Continue to fallback
  }

  // Always run fallback to catch flat files that Keystatic might miss in mixed mode
  // if (albums.length > 0) {
  //    return albums;
  // }
  
  try {
    // Fallback: Read from filesystem
    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    log("Fallback: Checking directory:", albumsDir);
    if (!fs.existsSync(albumsDir)) {
        log("ERROR: Directory does not exist:", albumsDir);
        return [];
    }
    
    const entries = fs.readdirSync(albumsDir);
    
    const fallbackAlbums = entries.map(entryName => {
        const entryPath = path.join(albumsDir, entryName);
        const stats = fs.statSync(entryPath);
        let slug = entryName;
        let fileContent = '';

        if (stats.isDirectory()) {
            const indexPath = path.join(entryPath, 'index.mdoc');
            if (fs.existsSync(indexPath)) {
                fileContent = fs.readFileSync(indexPath, 'utf-8');
            } else {
                log(`No index.mdoc found for directory: ${entryName}`);
                return null;
            }
        } else if (stats.isFile() && entryName.endsWith('.mdoc')) {
            slug = entryName.replace('.mdoc', '');
            fileContent = fs.readFileSync(entryPath, 'utf-8');
        } else {
            return null;
        }

        try {
            const { data } = matter(fileContent);
            log(`Successfully parsed fallback for: ${slug}`);
            return {
                slug,
                entry: {
                    title: data.title || slug,
                    description: () => Promise.resolve([]),
                    images: data.images || [],
                    categorization: data.categorization,
                    publishing: data.publishing,
                    priority: data.priority,
                    hidden: data.hidden || false
                }
            };
        } catch (e) {
            log(`Error parsing frontmatter for ${slug}:`, e);
            return null;
        }
    }).filter(a => a !== null);

    // Sort fallback albums by priority
    fallbackAlbums.sort((a, b) => {
        const priorityA = (a as any).entry.priority || 0;
        const priorityB = (b as any).entry.priority || 0;
        return priorityA - priorityB;
    });

    log("Total fallback albums found:", fallbackAlbums.length);
    return fallbackAlbums as any;
  } catch (error: any) {
    log("ERROR in getAlbums:", error.message || String(error));
    if (error.stack) log("Stack:", error.stack);
    return [];
  }
}

export async function getAlbum(slug: string) {
  log(`getAlbum called with slug: ${slug}`);
  try {
    // 1. Try Keystatic reader first
    const album = await reader.collections.albums.read(slug);
    if (album) {
        log(`Successfully read album via Keystatic: ${slug}`);
        return album;
    }
    log(`Keystatic could not find album: ${slug}. Trying fallback...`);
    
    // 2. Fallback: Read from filesystem directly
    // Try both the exact slug and a lowercase version
    const slugsToTry = [slug, slug.toLowerCase()];
    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    
    for (const s of slugsToTry) {
        // Check for directory with index.mdoc
        const indexPath = path.join(albumsDir, s, 'index.mdoc');
        // Check for flat .mdoc file
        const mdocPath = path.join(albumsDir, `${s}.mdoc`);
        
        let filePath = '';
        if (fs.existsSync(indexPath)) {
            filePath = indexPath;
        } else if (fs.existsSync(mdocPath)) {
            filePath = mdocPath;
        }

        if (filePath) {
            log(`Found file at: ${filePath}`);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            // Mock Keystatic AST for description
            const descriptionAST = [
                {
                    type: 'paragraph',
                    children: [{ text: content || '' }]
                }
            ];

            log(`Successfully parsed album data for: ${s}`);
            return {
                title: data.title || s,
                description: () => Promise.resolve(descriptionAST),
                images: data.images || [],
                categorization: data.categorization || {},
                publishing: data.publishing || {},
                hidden: data.hidden || false
            } as any;
        }
    }
    
    log(`All lookups failed for slug: ${slug}`);
    return null;
  } catch (error) {
    log(`ERROR in getAlbum for ${slug}:`, error);
    return null;
  }
}

export function getPosts(pathArr: string[]) {
    // Helper to get posts for other collections if needed
    // The original code used a custom getPosts helper, likely from utils.ts
    // Wait, getPosts is imported from @/utils/utils in page.tsx
    // This file is reader.ts, usually for Keystatic reader.
    return []; 
}
