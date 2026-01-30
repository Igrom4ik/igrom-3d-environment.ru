
import { ContentService } from './src/core/content/ContentService';

async function test() {
    try {
        console.log("Testing ContentService for Telegram Posts...");
        const posts = await ContentService.getAllTelegramPosts();
        console.log(`Found ${posts.length} posts.`);
        
        if (posts.length > 0) {
            console.log("First post:", posts[0]);
            
            const slug = posts[0].slug;
            console.log(`Fetching specific post: ${slug}`);
            const post = await ContentService.getTelegramPost(slug);
            console.log("Post data:", post);
        } else {
            console.log("No posts found to test detail fetch.");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
