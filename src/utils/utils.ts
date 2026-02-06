import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata, MediaItem, TeamMember } from "@/types";
import { getImageUrl, getPublicUrl } from "@/lib/assets";

export const getQueryParam = (
  param: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
};

import { notFound } from "next/navigation";

export type ImageValue = {
  file: string;
  folder?: string;
};

export function resolveAssetPath(
  value: ImageValue,
  projectFolder: string
): string {
  const file = value.file;
  if (!file) return "";

  if (file.startsWith("/")) return getPublicUrl(file);

  const folder = (value.folder ?? projectFolder ?? "").replace(/^\/+|\/+$/g, "");
  if (!folder) return getPublicUrl(`/${file}`);

  return getPublicUrl(`/${folder}/${file}`);
}

export function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return { metadata: {} as Metadata, content: "" };
  }

  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(rawContent);

    const projectFolder = data.projectFolder || "";

    // Handle legacy images array and Keystatic object format
    let images = (data.images || []).map((img: any) => {
      if (typeof img === 'string') {
        return getImageUrl(img);
      }
      // Handle Keystatic image object
      if (img?.value?.src && typeof img.value.src === 'string') {
         const src = img.value.src;
         return getImageUrl(src);
      }
      // Handle new format
      if (img?.value?.file && typeof img.value.file === 'string' && projectFolder) {
         return resolveAssetPath({ file: img.value.file, folder: img.value.folder }, projectFolder);
      }
      return "";
    }).filter((img: string) => img !== "");

    // Handle new media blocks
    const media: MediaItem[] = data.media || [];
    if (media.length > 0) {
      if (images.length === 0) {
        images = media
          .filter((m) => m.discriminant === "image")
          .map((m) => {
            const img = m.value.image || "";
            return getImageUrl(img);
          });

        const galleryImages = media
          .filter((m) => m.discriminant === "gallery")
          .flatMap((m) => m.value.images || [])
          .map((img: string) =>
            getImageUrl(img),
          );

        images = [...images, ...galleryImages];
      }
    }

    // Handle cover image
    let cover = data.cover
      ? getImageUrl(data.cover)
      : "";

    // Fallback: if no cover, use first image
    if (!cover && images.length > 0) {
      cover = images[0];
    }

    const metadata: Metadata = {
      title: data.title || "",
      subtitle: data.subtitle || "",
      publishedAt:
        data.publishedAt instanceof Date
          ? data.publishedAt.toISOString()
          : String(data.publishedAt || new Date().toISOString()),
      summary: data.summary || "",
      projectFolder: projectFolder,
      image: data.image
        ? getImageUrl(data.image)
        : "",
      cover: cover,
      images: images,
      media: media,
      software: data.software || [],
      artstation: data.artstation || "",
      tag: data.tag || [],
      tags: data.tags || [],
      team: (data.team || []).map((member: TeamMember) => ({
        name: member.name,
        role: member.role,
        avatar: getImageUrl(member.avatar),
        linkedIn: member.linkedIn,
      })),
      priority: data.priority ?? 999,
      link: data.link || "",
      hidden: data.hidden || false,
    };

    return { metadata, content };
  } catch (error) {
    console.error(`Error reading MDX file: ${filePath}`, error);
    return { metadata: {} as Metadata, content: "" };
  }
}

export function getPosts(dirParts: string[]) {
  const dirPath = path.join(process.cwd(), ...dirParts);
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries
    .map((entry) => {
      let slug = entry.name;
      let filePath = '';

      if (entry.isDirectory()) {
        const dirPathSlug = path.join(dirPath, slug);
        // Check for index.mdx or index.mdoc
        if (fs.existsSync(path.join(dirPathSlug, "index.mdx"))) {
            filePath = path.join(dirPathSlug, "index.mdx");
        } else if (fs.existsSync(path.join(dirPathSlug, "index.mdoc"))) {
            filePath = path.join(dirPathSlug, "index.mdoc");
        }
      } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.mdoc'))) {
         slug = entry.name.replace(/\.md(x|oc)$/, '');
         filePath = path.join(dirPath, entry.name);
      }

      if (!filePath || !fs.existsSync(filePath)) {
        return null;
      }
      
      const { metadata, content } = readMDXFile(filePath);
      
      // If title is missing, it's likely an invalid or empty read
      if (!metadata.title) return null;

      return {
        slug,
        metadata,
        content,
      };
    })
    .filter((post): post is { slug: string; metadata: Metadata; content: string } => post !== null && !post.metadata.hidden)
    .sort((a, b) => (a.metadata.priority ?? 999) - (b.metadata.priority ?? 999));
}
