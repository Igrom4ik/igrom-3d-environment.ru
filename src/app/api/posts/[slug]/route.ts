import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/utils/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
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
