import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata, MediaItem, TeamMember } from "@/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const getQueryParam = (
  param: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
};

import { notFound } from "next/navigation";

function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return { metadata: {} as Metadata, content: "" };
  }

  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(rawContent);

    // Handle legacy images array
    let images = (data.images || []).map((img: string) =>
      img.startsWith("/") ? `${basePath}${img}` : img,
    );

    // Handle new media blocks
    const media: MediaItem[] = data.media || [];
    if (media.length > 0) {
      if (images.length === 0) {
        images = media
          .filter((m) => m.discriminant === "image")
          .map((m) => {
            const img = m.value.image || "";
            return img.startsWith("/") ? `${basePath}${img}` : img;
          });

        const galleryImages = media
          .filter((m) => m.discriminant === "gallery")
          .flatMap((m) => m.value.images || [])
          .map((img: string) =>
            img.startsWith("/") ? `${basePath}${img}` : img,
          );

        images = [...images, ...galleryImages];
      }
    }

    // Handle cover image
    let cover = data.cover
      ? data.cover.startsWith("/")
        ? `${basePath}${data.cover}`
        : data.cover
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
      image: data.image
        ? data.image.startsWith("/")
          ? `${basePath}${data.image}`
          : data.image
        : "",
      cover: cover,
      images: images,
      media: media,
      software: data.software || [],
      artstation: data.artstation || "",
      tag: data.tag || [],
      team: (data.team || []).map((member: TeamMember) => ({
        name: member.name,
        role: member.role,
        avatar: member.avatar.startsWith("/")
          ? `${basePath}${member.avatar}`
          : member.avatar,
        linkedIn: member.linkedIn,
      })),
      link: data.link || "",
    };

    return { metadata, content };
  } catch (error) {
    console.error(`Error reading MDX file: ${filePath}`, error);
    // Return safe default metadata to prevent crashes
    const safeMetadata: Metadata = {
      title: "Error loading post",
      subtitle: "",
      publishedAt: new Date().toISOString(),
      summary: "There was an error loading this post.",
      image: "",
      cover: "",
      images: [],
      media: [],
      tag: "",
      team: [],
      link: "",
    };
    return { metadata: safeMetadata, content: "" };
  }
}

function getMDXData(dir: string) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const slug = entry.name;
      const dirPath = path.join(dir, slug);
      
      // Check for index.mdx or index.mdoc
      let filePath = path.join(dirPath, "index.mdx");
      if (!fs.existsSync(filePath)) {
        filePath = path.join(dirPath, "index.mdoc");
      }
      
      if (!fs.existsSync(filePath)) {
        // Fallback for flat files if mixed structure exists (unlikely given current setup but safe)
        return null;
      }

      const { metadata, content } = readMDXFile(filePath);

      return {
        metadata,
        slug,
        content,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null);
}

export function getPosts(customPath = ["", "", "", ""]) {
  const postsDir = path.join(process.cwd(), ...customPath);
  return getMDXData(postsDir);
}
