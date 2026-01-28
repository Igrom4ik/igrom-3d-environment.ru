import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
  try {
    const albums = await reader.collections.albums.all();
    if (albums.length > 0) {
        return albums;
    }
    
    // Fallback: Read from filesystem
    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    if (!fs.existsSync(albumsDir)) return [];
    
    const dirs = fs.readdirSync(albumsDir).filter(file => 
        fs.statSync(path.join(albumsDir, file)).isDirectory()
    );
    
    const fallbackAlbums = dirs.map(slug => {
        const indexPath = path.join(albumsDir, slug, 'index.mdoc');
        if (fs.existsSync(indexPath)) {
            const fileContent = fs.readFileSync(indexPath, 'utf-8');
            const { data } = matter(fileContent);
            return {
                slug,
                entry: {
                    title: data.title || slug,
                    description: () => Promise.resolve([]), // Placeholder for list view
                    images: data.images || [],
                    categorization: data.categorization,
                    publishing: data.publishing
                }
            };
        }
        return null;
    }).filter(a => a !== null);

    return fallbackAlbums as any;
  } catch (error) {
    console.error("Failed to read albums:", error);
    return [];
  }
}

export async function getAlbum(slug: string) {
  try {
    // 1. Try Keystatic reader first
    const album = await reader.collections.albums.read(slug);
    if (album) {
        return album;
    }
    
    // 2. Fallback: Read from filesystem directly
    // Try both the exact slug and a lowercase version
    const slugsToTry = [slug, slug.toLowerCase()];
    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    
    for (const s of slugsToTry) {
        const indexPath = path.join(albumsDir, s, 'index.mdoc');
        if (fs.existsSync(indexPath)) {
            const fileContent = fs.readFileSync(indexPath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            // Mock Keystatic AST for description
            const descriptionAST = [
                {
                    type: 'paragraph',
                    children: [{ text: content || '' }]
                }
            ];

            return {
                title: data.title || s,
                description: () => Promise.resolve(descriptionAST),
                images: data.images || [],
                categorization: data.categorization || {},
                publishing: data.publishing || {}
            } as any;
        }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to read album ${slug}:`, error);
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
