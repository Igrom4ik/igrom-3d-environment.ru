import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  images: string[];
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

    const metadata: Metadata = {
      title: data.title || "",
      subtitle: data.subtitle || "",
      publishedAt: data.publishedAt instanceof Date 
        ? data.publishedAt.toISOString() 
        : String(data.publishedAt || new Date().toISOString()),
      summary: data.summary || "",
      image: data.image || "",
      images: data.images || [],
      tag: data.tag || [],
      team: data.team || [],
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
      images: [],
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
