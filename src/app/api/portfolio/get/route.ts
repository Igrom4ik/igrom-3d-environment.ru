
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { log } from '@/utils/logger';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  log(`API GET /api/portfolio/get called with slug: ${slug}`);
  
  try {
    if (!slug) {
      log("API Error: Slug is required");
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    const folderPath = path.join(albumsDir, slug);
    const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
    const indexMdocPath = path.join(folderPath, 'index.mdoc');

    log(`API Checking paths: ${indexMdocPath}, ${mdocPath}`);

    let filePath = null;

    if (fs.existsSync(indexMdocPath)) {
        filePath = indexMdocPath;
        log("API Found file at indexMdocPath");
    } else if (fs.existsSync(mdocPath)) {
        filePath = mdocPath;
        log("API Found file at mdocPath");
    }

    if (!filePath) {
        log(`API Error: Project not found for slug: ${slug}`);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent);
    const data = parsed.data;
    const content = parsed.content;

    log(`API Successfully returned project for slug: ${slug}`);
    return NextResponse.json({ 
        slug,
        ...data,
        content 
    });

  } catch (error) {
    log(`API ERROR for slug ${slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
