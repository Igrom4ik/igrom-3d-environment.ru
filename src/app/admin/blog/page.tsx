import { getBlogPosts } from "@/utils/blog-reader";
import BlogManager from "./BlogManager";

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
    const posts = await getBlogPosts();
    
    return <BlogManager initialPosts={posts} />;
}
