
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(req: Request) {
    try {
        const { items } = await req.json(); // items: { slug: string, priority: number }[]
        
        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const albumsDir = path.join(process.cwd(), 'src/content/albums');

        for (const item of items) {
            const slug = item.slug;
            const priority = item.priority;
            
            // Find the file (support potential casing issues, though usually lowercase)
            let dirPath = path.join(albumsDir, slug);
            if (!fs.existsSync(dirPath)) {
                // Try to find case-insensitive
                const dirs = fs.readdirSync(albumsDir);
                const match = dirs.find(d => d.toLowerCase() === slug.toLowerCase());
                if (match) {
                    dirPath = path.join(albumsDir, match);
                } else {
                    console.warn(`Album not found for reordering: ${slug}`);
                    continue;
                }
            }

            const filePath = path.join(dirPath, 'index.mdoc');
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);

                // Update priority
                data.priority = priority;

                // Stringify back
                // Note: gray-matter stringify might change formatting slightly, but it's usually fine.
                // We need to ensure we don't lose other fields.
                const newFileContent = matter.stringify(content, data);
                
                fs.writeFileSync(filePath, newFileContent);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering albums:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
