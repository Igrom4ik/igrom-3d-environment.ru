
import { type NextRequest, NextResponse } from 'next/server';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Determine upload directory based on query param or file extension
    const type = req.nextUrl.searchParams.get('type') || 'misc'; // 'marmoset', 'image', 'video'
    
    let subfolder = 'misc';
    if (type === 'marmoset' || filename.endsWith('.mview')) subfolder = 'marmoset';
    else if (type === 'image' || filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) subfolder = 'images/uploads';
    else if (type === 'video' || filename.match(/\.(mp4|webm)$/i)) subfolder = 'images/uploads'; // videos often go with images or separate
    
    const uploadDir = path.join(process.cwd(), 'public', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    // Create write stream
    const fileStream = fs.createWriteStream(filePath);

    // Pipe the request body (which is a ReadableStream) to the file write stream
    if (req.body) {
        // Convert Web Stream to Node Stream
        // @ts-expect-error Readable.fromWeb expects a specific Web Stream type but Next.js body is compatible
        const nodeStream = Readable.fromWeb(req.body);
        await pump(nodeStream, fileStream);
    } else {
        return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    // Return the public path
    // Fix: ensure forward slashes
    const publicPath = `/${subfolder.replace(/\\/g, '/')}/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
