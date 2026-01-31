import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { 
            originalSlug, 
            slug, 
            title, 
            summary, 
            content, 
            tag, 
            image,
            publishedAt,
            hidden
        } = data;

        if (!slug || !title) {
            return NextResponse.json({ error: 'Slug and Title are required' }, { status: 400 });
        }

        const postsDir = path.join(process.cwd(), 'src/app/(site)/blog/posts');
        
        // Ensure directory exists
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }

        // Handle rename if originalSlug exists and is different
        if (originalSlug && originalSlug !== slug) {
            const oldPath = path.join(postsDir, originalSlug);
            const newPath = path.join(postsDir, slug);
            
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }
        }

        // Create folder structure for Keystatic compatibility (slug/index.mdoc)
        const postFolder = path.join(postsDir, slug);
        if (!fs.existsSync(postFolder)) {
            fs.mkdirSync(postFolder, { recursive: true });
        }

        const filePath = path.join(postFolder, 'index.mdoc');

        // Prepare frontmatter
        const frontmatter = {
            title,
            summary,
            tag,
            image,
            publishedAt,
            hidden
        };

        // Create file content using gray-matter stringify or manual
        const fileContent = matter.stringify(content || '', frontmatter);

        fs.writeFileSync(filePath, fileContent);

        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
