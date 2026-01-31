import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function getBlogPosts() {
    console.log('getBlogPosts: Starting...');
    const postsDir = path.join(process.cwd(), 'src/app/(site)/blog/posts');
    
    if (!fs.existsSync(postsDir)) {
        console.log('getBlogPosts: Directory not found:', postsDir);
        return [];
    }

    let entries;
    try {
        entries = fs.readdirSync(postsDir);
        console.log('getBlogPosts: Found entries:', entries);
    } catch (e) {
        console.error('getBlogPosts: Error reading directory:', e);
        return [];
    }
    
    const posts = entries.map(entryName => {
        try {
            const entryPath = path.join(postsDir, entryName);
            const stats = fs.statSync(entryPath);
            let slug = entryName;
            let fileContent = '';

            // Handle folder-based posts (index.mdoc) or flat files
            if (stats.isDirectory()) {
                const indexPath = path.join(entryPath, 'index.mdoc');
                if (fs.existsSync(indexPath)) {
                    fileContent = fs.readFileSync(indexPath, 'utf-8');
                } else {
                    console.warn(`getBlogPosts: No index.mdoc in ${entryName}`);
                    return null;
                }
            } else if (stats.isFile() && entryName.endsWith('.mdoc')) {
                slug = entryName.replace('.mdoc', '');
                fileContent = fs.readFileSync(entryPath, 'utf-8');
            } else {
                return null;
            }

            const { data, content } = matter(fileContent);
            return {
                slug,
                content, // Include content for editing
                entry: {
                    title: data.title || slug,
                    publishedAt: data.publishedAt || null,
                    summary: data.summary || '',
                    image: data.image || null,
                    tag: data.tag || '',
                }
            };
        } catch (e) {
            console.error(`getBlogPosts: Error processing ${entryName}:`, e);
            return null;
        }
    }).filter(post => post !== null);

    // Sort by date descending
    posts.sort((a, b) => {
        const dateA = new Date(a!.entry.publishedAt || 0).getTime();
        const dateB = new Date(b!.entry.publishedAt || 0).getTime();
        return dateB - dateA;
    });

    console.log(`getBlogPosts: Returning ${posts.length} posts`);
    return posts;
}
