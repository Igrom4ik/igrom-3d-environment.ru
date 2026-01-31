import { getBlogPosts, getTrashPosts } from "@/utils/blog-reader";
import BlogManager from "./BlogManager";

export default async function BlogAdminPage() {
    const [posts, trashPosts] = await Promise.all([
        getBlogPosts(),
        getTrashPosts()
    ]);
    
    return <BlogManager initialPosts={posts} initialTrashPosts={trashPosts} />;
}
