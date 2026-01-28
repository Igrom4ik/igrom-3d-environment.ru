import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

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
    console.log(`[getAlbums] Found ${albums.length} albums:`, albums.map(a => a.slug));
    return albums;
  } catch (error) {
    console.error("Failed to read albums:", error);
    return [];
  }
}

export async function getAlbum(slug: string) {
  try {
    console.log(`[getAlbum] detailed lookup for slug: '${slug}'`);
    const album = await reader.collections.albums.read(slug);
    if (album) {
        console.log(`[getAlbum] Found via read(${slug})`);
        return album;
    }
    
    console.log(`[getAlbum] Not found via read(${slug}), trying all() fallback`);
    const all = await reader.collections.albums.all();
    console.log(`[getAlbum] Available slugs:`, all.map(a => a.slug));
    
    const found = all.find(a => a.slug === slug)?.entry;
    if (found) {
        console.log(`[getAlbum] Found via fallback search`);
    } else {
        console.log(`[getAlbum] Not found via fallback search`);
    }
    return found || null;
  } catch (error) {
    console.error(`Failed to read album ${slug}:`, error);
    return null;
  }
}
