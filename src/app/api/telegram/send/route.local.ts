import { type NextRequest, NextResponse } from 'next/server';
import telegramifyMarkdown from 'telegramify-markdown';
import fs from 'node:fs';
import path from 'node:path';

// Helper to resolve local path
function getLocalFile(url: string): { blob: Blob, filename: string } | null {
    if (!url.startsWith('/')) return null;
    try {
        const publicPath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(publicPath)) {
            const buffer = fs.readFileSync(publicPath);
            const ext = path.extname(publicPath).toLowerCase();
            let type = 'application/octet-stream';
            if (['.jpg', '.jpeg'].includes(ext)) type = 'image/jpeg';
            if (ext === '.png') type = 'image/png';
            if (ext === '.gif') type = 'image/gif';
            if (ext === '.webp') type = 'image/webp';
            if (ext === '.pdf') type = 'application/pdf';
            
            return {
                blob: new Blob([buffer], { type }),
                filename: path.basename(publicPath)
            };
        }
    } catch (e) {
        console.error('Error resolving local file:', url, e);
    }
    return null;
}

// Helper to send request to Telegram
async function sendToTelegram(token: string, method: string, formData: FormData) {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        body: formData
    });
    return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { content, chatId, image, title, summary, slug } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://igrom-3d-environment.ru';

    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
    }

    if (!content || !chatId) {
      return NextResponse.json({ error: 'Missing content or chatId' }, { status: 400 });
    }

    // Split content by inline images first
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    let lastIndex = 0;
    let match = imgRegex.exec(content);
    const parts: { type: 'text' | 'image', content: string, alt?: string, url?: string }[] = [];

    while (match !== null) {
        const [fullMatch, alt, url] = match;
        const textBefore = content.slice(lastIndex, match.index);
        
        if (textBefore.trim()) {
            parts.push({ type: 'text', content: textBefore });
        }
        
        parts.push({ type: 'image', content: fullMatch, alt, url });
        lastIndex = imgRegex.lastIndex;
        match = imgRegex.exec(content);
    }

    const remainingText = content.slice(lastIndex);
    if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
    }

    // --- Processing ---

    // Logic:
    // Message 1 (Header): Cover Image + Caption (Title + Summary + Date + Logo + Link)
    // Message 2+ (Body): Content Parts (Text, Images)
    
    // 1. Construct Header Caption
    // Title
    let headerCaption = `**${title || 'New Post'}**\n`;
    
    // Date (Simple today's date or from metadata if passed - using today for now or we could fetch it)
    const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    headerCaption += `📅 ${dateStr}\n\n`;

    // Summary
    if (summary) {
        headerCaption += `${summary}\n\n`;
    }
    
    // Link to original
    if (slug) {
         const link = `${baseURL}/blog/${slug}`;
         headerCaption += `[Читать оригинал](${link})`;
    }

    // Logo / Branding (Optional text footer or just relying on Cover Image)
    // User mentioned "Logo of blog". If there is no cover image, maybe we attach logo?
    // Or if there is a cover image, we just rely on that.
    // Let's assume user wants the logo text or hashtag? Or maybe a small footer.
    headerCaption += '\n\n#blog #igrom';

    const mdHeader = telegramifyMarkdown(headerCaption, 'escape');

    // Send Header Message
    if (image) {
        // Send as Photo (Cover)
        const formData = new FormData();
        formData.append('chat_id', chatId);
        const localFile = getLocalFile(image);
        
        if (localFile) {
            formData.append('photo', localFile.blob, localFile.filename);
        } else {
            formData.append('photo', image);
        }
        
        formData.append('caption', mdHeader);
        formData.append('parse_mode', 'MarkdownV2');
        
        const res = await sendToTelegram(token, 'sendPhoto', formData);
        if (!res.ok) console.error('Failed to send header photo:', res);
    } else {
        // Send as Text if no image
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('text', mdHeader);
        formData.append('parse_mode', 'MarkdownV2');
        formData.append('disable_web_page_preview', 'false'); // Allow preview for the main link
        
        const res = await sendToTelegram(token, 'sendMessage', formData);
        if (!res.ok) console.error('Failed to send header text:', res);
    }

    // 2. Send Body Content
    // Iterate through parts
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part.type === 'text') {
            const md = telegramifyMarkdown(part.content, 'escape');
            if (md.trim()) {
                const fd = new FormData();
                fd.append('chat_id', chatId);
                fd.append('text', md);
                fd.append('parse_mode', 'MarkdownV2');
                fd.append('disable_web_page_preview', 'true');
                await sendToTelegram(token, 'sendMessage', fd);
            }
        } else if (part.type === 'image') {
            const { alt, url } = part;
            if (!url) continue;

            const localFile = getLocalFile(url);
            if (localFile) {
                const fd = new FormData();
                fd.append('chat_id', chatId);
                fd.append('photo', localFile.blob, localFile.filename);
                if (alt) fd.append('caption', telegramifyMarkdown(alt, 'escape'));
                fd.append('parse_mode', 'MarkdownV2');
                await sendToTelegram(token, 'sendPhoto', fd);
            } else {
                 if (url.startsWith('http')) {
                    const fd = new FormData();
                    fd.append('chat_id', chatId);
                    fd.append('photo', url);
                    if (alt) fd.append('caption', telegramifyMarkdown(alt, 'escape'));
                    fd.append('parse_mode', 'MarkdownV2');
                    await sendToTelegram(token, 'sendPhoto', fd);
                 } else {
                     const fd = new FormData();
                     fd.append('chat_id', chatId);
                     fd.append('text', `🖼 ${alt || 'Image'}`);
                     await sendToTelegram(token, 'sendMessage', fd);
                 }
            }
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Telegram Send Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
