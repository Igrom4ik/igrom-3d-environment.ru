import { getBlogPosts, getTrashPosts } from "@/utils/blog-reader";
import BlogManager from "./BlogManager";

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
    const [posts, trashPosts] = await Promise.all([
        getBlogPosts(),
        getTrashPosts()
    ]);
    
    return <BlogManager initialPosts={posts} initialTrashPosts={trashPosts} />;
}
