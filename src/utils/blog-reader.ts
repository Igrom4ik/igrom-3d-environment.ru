import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Helper function to read posts from a specific directory
async function readPostsFromDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    let entries;
    try {
        entries = fs.readdirSync(dirPath);
    } catch (e) {
        console.error(`Error reading directory ${dirPath}:`, e);
        return [];
    }
    
    const posts = entries.map(entryName => {
        try {
            const entryPath = path.join(dirPath, entryName);
            const stats = fs.statSync(entryPath);
            let slug = entryName;
            let fileContent = '';

            // Handle folder-based posts (index.mdoc) or flat files
            if (stats.isDirectory()) {
                const indexPath = path.join(entryPath, 'index.mdoc');
                if (fs.existsSync(indexPath)) {
                    fileContent = fs.readFileSync(indexPath, 'utf-8');
                } else {
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
                content,
                entry: {
                    title: data.title || slug,
                    publishedAt: data.publishedAt || null,
                    summary: data.summary || '',
                    image: data.image || null,
                    tag: data.tag || '',
                    hidden: data.hidden || false,
                }
            };
        } catch (e) {
            console.error(`Error processing ${entryName}:`, e);
            return null;
        }
    }).filter(post => post !== null);

    return posts;
}

export async function getBlogPosts() {
    const postsDir = path.join(process.cwd(), 'src/app/(site)/blog/posts');
    const posts = await readPostsFromDir(postsDir);
    
    // Sort by date descending
    posts.sort((a, b) => {
        const dateA = new Date(a!.entry.publishedAt || 0).getTime();
        const dateB = new Date(b!.entry.publishedAt || 0).getTime();
        return dateB - dateA;
    });

    return posts;
}

export async function getTrashPosts() {
    const trashDir = path.join(process.cwd(), 'src/app/(site)/blog/_trash');
    const posts = await readPostsFromDir(trashDir);
    
    // Sort by date descending
    posts.sort((a, b) => {
        const dateA = new Date(a!.entry.publishedAt || 0).getTime();
        const dateB = new Date(b!.entry.publishedAt || 0).getTime();
        return dateB - dateA;
    });

    return posts;
}
