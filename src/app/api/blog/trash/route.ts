import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'src/app/(site)/blog/posts');
const TRASH_DIR = path.join(process.cwd(), 'src/app/(site)/blog/_trash');

// Ensure trash directory exists
if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR, { recursive: true });
}

export async function POST(request: Request) {
    try {
        const { slugs, action } = await request.json(); // action: 'trash' | 'restore'

        if (!slugs || !Array.isArray(slugs)) {
            return NextResponse.json({ error: 'Invalid slugs' }, { status: 400 });
        }

        const results = [];
        const errors = [];

        for (const slug of slugs) {
            const sourceDir = action === 'trash' ? POSTS_DIR : TRASH_DIR;
            const targetDir = action === 'trash' ? TRASH_DIR : POSTS_DIR;
            
            const sourcePath = path.join(sourceDir, slug);
            const targetPath = path.join(targetDir, slug);

            // Handle flat file .mdoc
            const sourceFile = path.join(sourceDir, `${slug}.mdoc`);
            const targetFile = path.join(targetDir, `${slug}.mdoc`);

            try {
                if (fs.existsSync(sourcePath)) {
                    // It's a directory
                    if (fs.existsSync(targetPath)) {
                        errors.push(`Target already exists: ${slug}`);
                        continue;
                    }
                    fs.renameSync(sourcePath, targetPath);
                    results.push(slug);
                } else if (fs.existsSync(sourceFile)) {
                    // It's a file
                    if (fs.existsSync(targetFile)) {
                        errors.push(`Target already exists: ${slug}`);
                        continue;
                    }
                    fs.renameSync(sourceFile, targetFile);
                    results.push(slug);
                } else {
                    errors.push(`Not found: ${slug}`);
                }
            } catch (e: any) {
                errors.push(`Error moving ${slug}: ${e.message}`);
            }
        }

        return NextResponse.json({ success: true, results, errors });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
