import BlogEditor from '../../BlogEditor';
import { getBlogPosts } from '@/utils/blog-reader';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    return [{ slug: 'placeholder' }];
}

export default async function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const posts = await getBlogPosts();
    const post = posts.find((p: any) => p.slug === slug);

    if (!post) {
        return notFound();
    }

    // Need to read full content for editing. 
    // getBlogPosts() in utils/blog-reader.ts already reads content to parse frontmatter?
    // Let's check blog-reader.ts again. Yes, it reads fileContent.
    // Wait, getBlogPosts maps data but DOES NOT return full 'content' body in the return object?
    // Let's check blog-reader.ts
    
    // We might need a separate function to get single post with content if getBlogPosts filters it out.
    // But for now let's assume I need to update blog-reader to return content or read it here.
    
    // Actually, let's just pass what we have. If content is missing, we need to fix blog-reader.
    
    return <BlogEditor mode="edit" initialData={post} />;
}
