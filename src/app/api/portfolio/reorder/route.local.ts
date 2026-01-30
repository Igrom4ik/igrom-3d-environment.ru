
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
            let targetFile = null;

            // Check for folder with index.mdoc
            if (fs.existsSync(dirPath) && fs.existsSync(path.join(dirPath, 'index.mdoc'))) {
                targetFile = path.join(dirPath, 'index.mdoc');
            } 
            // Check for flat .mdoc file
            else if (fs.existsSync(path.join(albumsDir, `${slug}.mdoc`))) {
                targetFile = path.join(albumsDir, `${slug}.mdoc`);
            }
            // Check for case-insensitive folder match
            else if (!fs.existsSync(dirPath)) {
                const dirs = fs.readdirSync(albumsDir);
                const match = dirs.find(d => d.toLowerCase() === slug.toLowerCase());
                if (match) {
                    const matchPath = path.join(albumsDir, match);
                    if (fs.existsSync(path.join(matchPath, 'index.mdoc'))) {
                        targetFile = path.join(matchPath, 'index.mdoc');
                    }
                }
            }

            if (targetFile) {
                const fileContent = fs.readFileSync(targetFile, 'utf-8');
                const { data, content } = matter(fileContent);

                // Update priority
                data.priority = priority;

                // Stringify back
                const newFileContent = matter.stringify(content, data);
                
                fs.writeFileSync(targetFile, newFileContent);
            } else {
                console.warn(`Album not found for reordering: ${slug}`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering albums:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
