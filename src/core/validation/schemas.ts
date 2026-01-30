import { z } from 'zod';

// Helper for Keystatic Document field (simplified)
const DocumentSchema = z.any(); // In strict mode we might want z.array(z.object({...}))

// Shared Schemas
const ImageSchema = z.string().or(z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
})).optional();

const VideoSchema = z.object({
  src: z.string(),
  autoPlay: z.boolean().optional(),
  muted: z.boolean().optional(),
  loop: z.boolean().optional(),
  caption: z.string().optional(),
});

const YouTubeSchema = z.object({
  url: z.string(),
});

const SketchfabSchema = z.object({
  url: z.string(),
});

const MarmosetSchema = z.object({
  src: z.string().or(z.object({ filename: z.string() })).optional(),
  manualPath: z.string().optional(),
  alt: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  autoStart: z.boolean().optional(),
});

// --- Album Schema (from src/content/albums) ---
export const AlbumMediaBlockSchema = z.object({
  discriminant: z.enum(['image', 'video', 'youtube', 'sketchfab', 'marmoset', 'pano']),
  value: z.any(), // Specific validation can be added based on discriminant
});

export const AlbumSchema = z.object({
  title: z.string(),
  description: DocumentSchema,
  categorization: z.object({
    medium: z.array(z.string()).optional(),
    software: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  images: z.array(AlbumMediaBlockSchema).optional(),
  publishing: z.object({
    date: z.string().or(z.date()).optional(),
    artstation: z.string().url().optional().or(z.literal('')),
    cover: ImageSchema,
  }).optional(),
});

export type Album = z.infer<typeof AlbumSchema>;

// --- Project Schema (from src/app/(site)/work/projects) ---
export const ProjectMediaBlockSchema = z.object({
  discriminant: z.enum(['gallery', 'image', 'video', 'youtube', 'sketchfab', 'marmoset', 'pano', 'compare']),
  value: z.any(),
});

export const ProjectSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  publishedAt: z.string().or(z.date()).optional(),
  cover: ImageSchema,
  software: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  artstation: z.string().url().optional().or(z.literal('')),
  media: z.array(ProjectMediaBlockSchema).optional(),
  content: DocumentSchema,
});

export type Project = z.infer<typeof ProjectSchema>;

// --- Post Schema (from src/app/(site)/blog/posts) ---
export const PostSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  publishedAt: z.string().or(z.date()).optional(),
  tag: z.string().optional(),
  summary: z.string().optional(),
  image: ImageSchema,
  content: DocumentSchema,
});

export type Post = z.infer<typeof PostSchema>;

// Generic Content wrapper
export const ContentItemSchema = z.object({
  slug: z.string(),
  entry: z.any(), // The actual content data (Album, Project, etc.)
});
