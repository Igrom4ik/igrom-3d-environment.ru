import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'src/content/telegram-posts');

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Possible paths (Keystatic can store as file or directory)
    const dirPath = path.join(POSTS_DIR, slug);
    const filePath = path.join(POSTS_DIR, `${slug}.mdoc`);
    const filePathMd = path.join(POSTS_DIR, `${slug}.md`);

    let deleted = false;

    // Check directory first
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        deleted = true;
    } 
    // Check file
    else if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
    }
    // Check md file
    else if (fs.existsSync(filePathMd)) {
        fs.unlinkSync(filePathMd);
        deleted = true;
    }

    if (!deleted) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
