import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { slugs } = await request.json();

        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return NextResponse.json({ error: 'No slugs provided' }, { status: 400 });
        }

        const postsDir = path.join(process.cwd(), 'src/app/(site)/blog/posts');
        const deleted = [];
        const errors = [];

        for (const slug of slugs) {
            // Sanitize slug
            if (!/^[a-zA-Z0-9\-_а-яА-ЯёЁ]+$/.test(slug)) {
                errors.push(`Invalid slug: ${slug}`);
                continue;
            }

            const folderPath = path.join(postsDir, slug);
            
            try {
                // Check if directory exists
                await fs.access(folderPath);
                // Delete directory recursively
                await fs.rm(folderPath, { recursive: true, force: true });
                deleted.push(slug);
            } catch (err: any) {
                // If directory doesn't exist, check for flat file
                const filePath = path.join(postsDir, `${slug}.mdoc`);
                try {
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    deleted.push(slug);
                } catch (e) {
                    errors.push(`Post not found: ${slug}`);
                }
            }
        }

        return NextResponse.json({ success: true, deleted, errors });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
