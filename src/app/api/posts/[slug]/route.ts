import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/utils/utils';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
    if (posts.length === 0) {
      return [{ slug: 'placeholder-post' }];
    }
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams for api/posts:", error);
    return [{ slug: 'placeholder-post' }];
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    // Using existing utility that reads from disk
    // This ensures we get the latest saved content
    const posts = getPosts(["src", "app", "(site)", "blog", "posts"]);
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
