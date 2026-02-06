
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Readable } from 'stream';

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const uploadId = formData.get('uploadId') as string;
        const chunkIndex = formData.get('chunkIndex') as string;
        const file = formData.get('chunk') as File;

        if (!uploadId || !chunkIndex || !file) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp', uploadId);

        if (!fs.existsSync(tempDir)) {
            return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
        }

        const chunkPath = path.join(tempDir, chunkIndex);
        
        // Convert Web Stream to Node Stream and save
        const fileStream = fs.createWriteStream(chunkPath);
        // @ts-expect-error Readable.fromWeb matches
        const nodeStream = Readable.fromWeb(file.stream());
        await pump(nodeStream, fileStream);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Chunk upload error:', error);
        return NextResponse.json({ error: 'Failed to upload chunk' }, { status: 500 });
    }
}
