import fs from 'fs';
import path from 'path';

const SITE_SETTINGS_FILE = path.join(process.cwd(), 'site-settings.json');

export interface SiteSettings {
  ogTitle: string;
  ogSiteName: string;
  ogDescription: string;
  ogType: string;
  ogUrl: string;
  ogImage: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  ogTitle: "Mikitar — личный сайт 3D‑художника",
  ogSiteName: "igrom-3d-environment.ru",
  ogDescription: "Мой личный сайт и портфолио 3D‑окружения и моделей.",
  ogType: "website",
  ogUrl: "https://igrom-3d-environment.ru/",
  ogImage: "https://igrom-3d-environment.ru/images/og/avatar.jpg"
};

export function getSiteSettings(): SiteSettings {
  if (!fs.existsSync(SITE_SETTINGS_FILE)) {
    return DEFAULT_SETTINGS;
  }
  try {
    const data = fs.readFileSync(SITE_SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to read site settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  try {
    fs.writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save site settings:', error);
    return false;
  }
}
