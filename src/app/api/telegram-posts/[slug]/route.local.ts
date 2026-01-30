import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '../../../../core/content/ContentService';

export const dynamicParams = true;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Use ContentService to fetch the telegram post
    // We use getTelegramPostRaw to get the raw Markdown content string, 
    // because the standard reader returns an AST which is not suitable for the Telegram sender regex.
    const post = await ContentService.getTelegramPostRaw(slug);

    if (!post) {
      return NextResponse.json({ error: 'Telegram Post not found' }, { status: 404 });
    }

    // Transform to match the structure expected by TelegramPublishButton
    // The button expects: content, metadata.title, metadata.summary (optional), metadata.cover (optional)
    
    // The post object returned by ContentService.getTelegramPost likely has flat structure + content
    // based on ContentService implementation: return { ...data, content: content };

    return NextResponse.json({
        content: post.content,
        metadata: {
            title: post.title,
            publishedAt: post.publishedAt,
            // Telegram posts might not have summary/cover in the same way, but we map what we have
            summary: post.summary || '', 
            cover: post.image || '', // Check schema if image field exists
        }
    });
  } catch (error) {
    console.error('Error fetching telegram post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
