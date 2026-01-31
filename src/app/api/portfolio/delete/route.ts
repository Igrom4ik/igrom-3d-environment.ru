
import { type NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { log } from '../../../../utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { slugs, action } = await req.json(); // action: 'soft' | 'hard' | 'restore'

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: 'Slugs are required' }, { status: 400 });
    }

    const mode = action || 'hard'; 
    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    const processed: string[] = [];
    const errors: string[] = [];

    // Basic slug validation to prevent path traversal
    // Allow Cyrillic and other characters, but prevent directory traversal
    const isValidSlug = (s: string) => s && !s.includes('..') && !s.includes('/') && !s.includes('\\');

    for (const slug of slugs) {
      if (!isValidSlug(slug)) {
        errors.push(`Invalid slug format: ${slug}`);
        continue;
      }

      try {
        const folderPath = path.join(albumsDir, slug);
        const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
        const indexMdocPath = path.join(folderPath, 'index.mdoc');

        let targetPath = null;
        let isDirectory = false;

        // Check for directory-based project
        try {
            await fs.access(indexMdocPath);
            targetPath = indexMdocPath;
            isDirectory = true;
        } catch {
            // Check for standalone file project
            try {
                await fs.access(mdocPath);
                targetPath = mdocPath;
            } catch {
                errors.push(`Project files not found for: ${slug}`);
                continue;
            }
        }

        if (mode === 'hard') {
            if (isDirectory) {
                await fs.rm(folderPath, { recursive: true, force: true });
            } else {
                await fs.unlink(mdocPath);
            }
            log(`Hard deleted: ${slug}`);
            processed.push(slug);
        } else {
             // Soft delete or restore
             const fileContent = await fs.readFile(targetPath, 'utf8');
             const { data, content } = matter(fileContent);
             
             if (mode === 'soft') {
                 data.deleted = true;
             } else if (mode === 'restore') {
                 data.deleted = false; 
                 delete data.deleted; 
             }
             
             const updatedContent = matter.stringify(content, data);
             await fs.writeFile(targetPath, updatedContent, 'utf8');
             log(`${mode === 'soft' ? 'Soft deleted' : 'Restored'}: ${slug}`);
             processed.push(slug);
        }
      } catch (err: any) {
        log(`Error processing slug ${slug}:`, err);
        errors.push(`Failed to process ${slug}: ${err.message}`);
      }
    }

    const success = processed.length > 0;
    const responseData = { 
      success, 
      processed, 
      errors: errors.length > 0 ? errors : undefined 
    };
    
    log(`Delete API response: status=${success ? 200 : 500}`, responseData);
    
    return NextResponse.json(responseData, { status: success ? 200 : 500 });
  } catch (error: any) {
    log('Delete API error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
