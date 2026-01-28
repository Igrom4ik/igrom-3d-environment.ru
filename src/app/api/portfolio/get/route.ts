
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    const folderPath = path.join(albumsDir, slug);
    const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
    const indexMdocPath = path.join(folderPath, 'index.mdoc');

    let filePath = null;

    if (fs.existsSync(indexMdocPath)) {
        filePath = indexMdocPath;
    } else if (fs.existsSync(mdocPath)) {
        filePath = mdocPath;
    }

    if (!filePath) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse Frontmatter using gray-matter (since it handles YAML frontmatter + content)
    // Note: Keystatic uses .mdoc which is basically MD with Frontmatter.
    // js-yaml + split might be safer if matter doesn't like .mdoc extension by default, but usually it works on string.
    
    const parsed = matter(fileContent);
    const data = parsed.data;
    const content = parsed.content;

    return NextResponse.json({ 
        slug,
        ...data,
        content 
    });

  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
