
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { filename, type } = await req.json();

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        const uploadId = randomUUID();
        const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp', uploadId);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Store metadata if needed (e.g. filename, type) in a JSON file
        fs.writeFileSync(path.join(tempDir, 'metadata.json'), JSON.stringify({
            filename,
            type,
            createdAt: Date.now()
        }));

        return NextResponse.json({ uploadId });
    } catch (error) {
        console.error('Init upload error:', error);
        return NextResponse.json({ error: 'Failed to initialize upload' }, { status: 500 });
    }
}
