import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/content/telegram-posts');

export async function GET() {
  try {
    if (!fs.existsSync(POSTS_DIR)) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const entries = fs.readdirSync(POSTS_DIR);
    const posts = entries.map((entryName) => {
        const entryPath = path.join(POSTS_DIR, entryName);
        const stats = fs.statSync(entryPath);
        let slug = entryName;
        let fileContent = '';

        if (stats.isDirectory()) {
            const indexPath = path.join(entryPath, 'index.mdoc');
            if (fs.existsSync(indexPath)) {
                fileContent = fs.readFileSync(indexPath, 'utf-8');
            }
        } else if (entryName.endsWith('.mdoc')) {
            slug = entryName.replace('.mdoc', '');
            fileContent = fs.readFileSync(entryPath, 'utf-8');
        }

        if (!fileContent) return null;

        const { data } = matter(fileContent);
        return {
            slug,
            title: data.title || slug,
            publishedAt: data.publishedAt || null,
        };
    }).filter(p => p !== null);

    // Sort by date desc
    posts.sort((a, b) => {
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error reading telegram posts:', error);
    return NextResponse.json({ error: 'Failed to read posts' }, { status: 500 });
  }
}
