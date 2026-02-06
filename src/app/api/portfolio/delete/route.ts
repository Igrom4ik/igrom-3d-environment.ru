
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { log } from '../../../../utils/logger';

export const dynamic = 'force-dynamic';

type DeleteMode = 'soft' | 'hard' | 'restore';

const isValidSlug = (s: string) => s && !s.includes('..') && !s.includes('/') && !s.includes('\\');

async function processDelete(slugs: string[], mode: DeleteMode) {
  const albumsDir = path.join(process.cwd(), 'src/content/albums');
  const processed: string[] = [];
  const alreadyDeleted: string[] = [];
  const errors: string[] = [];

  for (const slug of slugs) {
    if (!isValidSlug(slug)) {
      errors.push(`Invalid slug format: ${slug}`);
      continue;
    }

    try {
      const folderPath = path.join(albumsDir, slug);
      const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
      const indexMdocPath = path.join(folderPath, 'index.mdoc');

      let targetPath: string | null = null;
      let isDirectory = false;

      try {
        await fs.access(indexMdocPath);
        targetPath = indexMdocPath;
        isDirectory = true;
      } catch {
        try {
          await fs.access(mdocPath);
          targetPath = mdocPath;
        } catch {
          // File not found - treat as already deleted
          log(`Project files not found for: ${slug} (already deleted)`);
          processed.push(slug);
          alreadyDeleted.push(slug);
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
        continue;
      }

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
    } catch (err: any) {
      log(`Error processing slug ${slug}:`, err);
      errors.push(`Failed to process ${slug}: ${err.message}`);
    }
  }

  return { processed, errors, alreadyDeleted };
}

function parseSlugsFromQuery(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id') || searchParams.get('slug');
  const slugsParam = searchParams.get('slugs');

  if (id) return [id];
  if (!slugsParam) return [];

  return slugsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slugs = parseSlugsFromQuery(req);
    const action = (searchParams.get('action') || 'hard') as DeleteMode;

    if (!slugs || slugs.length === 0) {
      return NextResponse.json({ success: false, error: 'Slugs are required' }, { status: 400 });
    }

    const { processed, errors } = await processDelete(slugs, action);
    const success = processed.length > 0;

    if (success) {
      revalidatePath('/portfolio');
      revalidatePath('/gallery');
      revalidatePath('/work');
      revalidatePath('/admin/portfolio');
      revalidatePath('/');
    }

    const responseData = {
      success,
      processed,
      errors: errors.length > 0 ? errors : undefined,
    };

    log(`Delete API (DELETE) response: status=${success ? 200 : 500}`, responseData);
    return NextResponse.json(responseData, { status: success ? 200 : 500 });
  } catch (error: any) {
    log('Delete API (DELETE) error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slugs, action } = await req.json(); // action: 'soft' | 'hard' | 'restore'

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: 'Slugs are required' }, { status: 400 });
    }

    const mode = (action || 'hard') as DeleteMode;
    const { processed, errors } = await processDelete(slugs, mode);

    const success = processed.length > 0;
    const responseData = { 
      success, 
      processed, 
      errors: errors.length > 0 ? errors : undefined 
    };
    
    if (success) {
      revalidatePath('/portfolio');
      revalidatePath('/gallery');
      revalidatePath('/work');
      revalidatePath('/admin/portfolio');
      revalidatePath('/');
    }

    log(`Delete API (POST) response: status=${success ? 200 : 500}`, responseData);
    
    return NextResponse.json(responseData, { status: success ? 200 : 500 });
  } catch (error: any) {
    log('Delete API (POST) error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
