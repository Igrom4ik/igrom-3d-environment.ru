
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Readable } from 'stream';

const pump = promisify(pipeline);
const UPLOAD_TEMP_DIR = path.join(process.cwd(), 'public', 'uploads', 'temp');
const FINAL_MARMOSET_DIR = path.join(process.cwd(), 'public', 'marmoset');
const FINAL_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_TEMP_DIR)) fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
if (!fs.existsSync(FINAL_MARMOSET_DIR)) fs.mkdirSync(FINAL_MARMOSET_DIR, { recursive: true });
if (!fs.existsSync(FINAL_IMAGES_DIR)) fs.mkdirSync(FINAL_IMAGES_DIR, { recursive: true });

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';

        // Handle Multipart (Chunk Upload)
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const uploadId = formData.get('uploadId') as string;
            const chunkIndex = formData.get('chunkIndex') as string;
            const chunk = formData.get('chunk') as File;

            if (!uploadId || !chunkIndex || !chunk) {
                return NextResponse.json({ error: 'Missing chunk data' }, { status: 400 });
            }

            const tempDir = path.join(UPLOAD_TEMP_DIR, uploadId);
            if (!fs.existsSync(tempDir)) {
                return NextResponse.json({ error: 'Upload session expired or invalid' }, { status: 404 });
            }

            const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
            const fileStream = fs.createWriteStream(chunkPath);
            // @ts-expect-error Readable.fromWeb matches
            const nodeStream = Readable.fromWeb(chunk.stream());
            await pump(nodeStream, fileStream);

            return NextResponse.json({ success: true });
        }
        
        // Handle JSON (Init / Complete)
        const body = await req.json();
        const { action } = body;

        if (action === 'init') {
            const { filename, size, type } = body;
            const uploadId = randomUUID();
            const tempDir = path.join(UPLOAD_TEMP_DIR, uploadId);
            fs.mkdirSync(tempDir, { recursive: true });

            // Store metadata
            fs.writeFileSync(path.join(tempDir, 'metadata.json'), JSON.stringify({
                filename,
                size,
                type,
                createdAt: Date.now()
            }));

            return NextResponse.json({ uploadId });
        }

        if (action === 'complete') {
            const { uploadId } = body;
            const tempDir = path.join(UPLOAD_TEMP_DIR, uploadId);
            
            if (!fs.existsSync(tempDir)) {
                return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
            }

            const metadata = JSON.parse(fs.readFileSync(path.join(tempDir, 'metadata.json'), 'utf-8'));
            const { filename, type } = metadata;

            // Resolve conflict
            let finalDir = FINAL_IMAGES_DIR;
            let urlPrefix = '/images/uploads';
            if (type === 'marmoset' || filename.endsWith('.mview')) {
                finalDir = FINAL_MARMOSET_DIR;
                urlPrefix = '/marmoset';
            }

            let finalFilename = filename;
            let finalPath = path.join(finalDir, finalFilename);
            
            // Rename if exists (simple counter)
            let counter = 1;
            const namePart = path.parse(filename).name;
            const extPart = path.parse(filename).ext;
            while (fs.existsSync(finalPath)) {
                finalFilename = `${namePart}_${counter}${extPart}`;
                finalPath = path.join(finalDir, finalFilename);
                counter++;
            }

            // Assemble
            // Use synchronous appending to avoid race conditions with streams
            const fd = fs.openSync(finalPath, 'w');
            
            const chunks = fs.readdirSync(tempDir)
                .filter(f => f.startsWith('chunk-'))
                .sort((a, b) => {
                    const idxA = parseInt(a.split('-')[1]);
                    const idxB = parseInt(b.split('-')[1]);
                    return idxA - idxB;
                });

            for (const chunkFile of chunks) {
                const chunkPath = path.join(tempDir, chunkFile);
                const chunkData = fs.readFileSync(chunkPath);
                fs.writeSync(fd, chunkData);
            }
            fs.closeSync(fd);

            // Verify size
            const stats = fs.statSync(finalPath);
            if (metadata.size && stats.size !== metadata.size) {
                 console.warn(`Size mismatch: expected ${metadata.size}, got ${stats.size}`);
                 // Optional: Delete if mismatch to prevent corrupted files?
                 // fs.unlinkSync(finalPath);
                 // return NextResponse.json({ error: 'File size mismatch' }, { status: 400 });
            }

            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });

            return NextResponse.json({ 
                path: `${urlPrefix}/${finalFilename}`,
                filename: finalFilename
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Unified upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
