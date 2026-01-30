
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { log } from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { slugs } = await req.json();

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: 'Slugs are required' }, { status: 400 });
    }

    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    const deleted: string[] = [];
    const errors: string[] = [];

    for (const slug of slugs) {
      try {
        const folderPath = path.join(albumsDir, slug);
        const mdocPath = path.join(albumsDir, `${slug}.mdoc`);

        let found = false;

        // Delete .mdoc file if it exists
        if (fs.existsSync(mdocPath)) {
          fs.unlinkSync(mdocPath);
          log(`Deleted file: ${mdocPath}`);
          found = true;
        }

        // Delete folder if it exists
        if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
          // Recursive delete
          fs.rmSync(folderPath, { recursive: true, force: true });
          log(`Deleted directory: ${folderPath}`);
          found = true;
        }

        if (found) {
          deleted.push(slug);
        } else {
          errors.push(`Project not found: ${slug}`);
        }
      } catch (err: any) {
        log(`Error deleting slug ${slug}:`, err);
        errors.push(`Failed to delete ${slug}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      deleted, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    log('Delete API error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
