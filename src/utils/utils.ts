/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

export type Metadata = {
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  image?: string;
  cover?: string;
  images: string[];
  // biome-ignore lint/suspicious/noExplicitAny: metadata media
  media?: any[];
  software?: string[];
  artstation?: string;
  tag?: string;
  team: Team[];
  link?: string;
};

import { notFound } from "next/navigation";

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return [];
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

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
    const media = data.media || [];
    if (media.length > 0) {
      // If media exists, we can extract images for backward compatibility if needed,
      // or just rely on the new components to handle media.
      // For the grid view, we might want to populate 'images' from media if it's empty
      if (images.length === 0) {
        images = media
          // biome-ignore lint/suspicious/noExplicitAny: metadata media
          .filter((m: any) => m.discriminator === "image")
          // biome-ignore lint/suspicious/noExplicitAny: metadata media
          .map((m: any) => {
            const img = m.value.image;
            return img.startsWith("/") ? `${basePath}${img}` : img;
          });
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

    // Fallback: if no cover and no images, but media has video/other, maybe try to get something?
    // For now, let's stick to images.

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
      // biome-ignore lint/suspicious/noExplicitAny: metadata team
      team: (data.team || []).map((member: any) => ({
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
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getPosts(customPath = ["", "", "", ""]) {
  const postsDir = path.join(process.cwd(), ...customPath);
  return getMDXData(postsDir);
}
