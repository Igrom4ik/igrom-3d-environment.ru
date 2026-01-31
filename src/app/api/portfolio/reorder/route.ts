
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
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
            
            const dirPath = path.join(albumsDir, slug);
            let targetFile = null;

            // Check for folder with index.mdoc
            try {
                const indexPath = path.join(dirPath, 'index.mdoc');
                await fs.access(indexPath);
                targetFile = indexPath;
            } catch {
                // Check for flat .mdoc file
                try {
                    const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
                    await fs.access(mdocPath);
                    targetFile = mdocPath;
                } catch {
                    // Try case-insensitive folder match
                    try {
                        const dirs = await fs.readdir(albumsDir);
                        const match = dirs.find(d => d.toLowerCase() === slug.toLowerCase());
                        if (match) {
                            const matchPath = path.join(albumsDir, match);
                            const matchIndexPath = path.join(matchPath, 'index.mdoc');
                            await fs.access(matchIndexPath);
                            targetFile = matchIndexPath;
                        }
                    } catch (e) {
                        console.warn(`Failed to read albums directory or find match for ${slug}:`, e);
                    }
                }
            }

            if (targetFile) {
                try {
                    const fileContent = await fs.readFile(targetFile, 'utf-8');
                    const { data, content } = matter(fileContent);

                    // Update priority
                    data.priority = priority;

                    // Stringify back
                    const newFileContent = matter.stringify(content, data);
                    await fs.writeFile(targetFile, newFileContent);
                } catch (e) {
                    console.error(`Failed to update file for ${slug}:`, e);
                }
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
