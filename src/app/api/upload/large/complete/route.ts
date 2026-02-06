
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { uploadId, totalChunks } = await req.json();

        if (!uploadId || totalChunks === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp', uploadId);
        
        if (!fs.existsSync(tempDir)) {
            return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
        }

        // Read metadata
        const metadataPath = path.join(tempDir, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
             return NextResponse.json({ error: 'Metadata not found' }, { status: 404 });
        }
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const { filename, type } = metadata;

        // Determine final path
        let subfolder = 'misc';
        if (type === 'marmoset' || filename.endsWith('.mview')) subfolder = 'marmoset';
        else if (type === 'image' || filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) subfolder = 'images/uploads';
        else if (type === 'video' || filename.match(/\.(mp4|webm)$/i)) subfolder = 'images/uploads';

        const finalDir = path.join(process.cwd(), 'public', subfolder);
        if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }

        const finalPath = path.join(finalDir, filename);
        const writeStream = fs.createWriteStream(finalPath);

        // Concatenate chunks
        for (let i = 0; i < totalChunks; i++) {
            const chunkPath = path.join(tempDir, i.toString());
            if (!fs.existsSync(chunkPath)) {
                writeStream.close();
                return NextResponse.json({ error: `Missing chunk ${i}` }, { status: 400 });
            }
            
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);
        }

        writeStream.end();

        // Cleanup temp dir
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Cleanup error:', e);
        }

        const publicPath = `/${subfolder.replace(/\\/g, '/')}/${filename}`;
        return NextResponse.json({ success: true, path: publicPath });

    } catch (error) {
        console.error('Complete upload error:', error);
        return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
    }
}
