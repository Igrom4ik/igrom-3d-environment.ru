import { NextRequest, NextResponse } from 'next/server';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../../../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);

export async function generateStaticParams() {
    const slugs = await reader.collections.telegramPosts.list();
    return slugs.map(slug => ({ slug }));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    try {
        const post = await reader.collections.telegramPosts.read(slug);
        const settings = await reader.singletons.telegramSettings.read();
        
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({
            content: post.content,
            chatId: settings?.chatId || ''
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
    }
}
