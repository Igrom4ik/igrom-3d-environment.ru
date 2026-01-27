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

export async function getBlogSettings() {
  try {
    return await reader.singletons.blog.read();
  } catch (error) {
    console.error("Failed to read blog settings:", error);
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
