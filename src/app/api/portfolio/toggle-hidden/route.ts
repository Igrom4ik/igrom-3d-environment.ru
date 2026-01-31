
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export async function POST(req: NextRequest) {
  try {
    const { slug, hidden } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    
    // Determine file path
    const folderPath = path.join(albumsDir, slug);
    const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
    const indexMdocPath = path.join(folderPath, 'index.mdoc');

    let targetPath = null;

    if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory() && fs.existsSync(indexMdocPath)) {
        targetPath = indexMdocPath;
    } else if (fs.existsSync(mdocPath)) {
        targetPath = mdocPath;
    } else {
         return NextResponse.json({ error: 'Project file not found' }, { status: 404 });
    }

    // Read file
    const fileContent = fs.readFileSync(targetPath, 'utf8');
    const { data, content } = matter(fileContent);

    // Update hidden status
    data.hidden = hidden;

    // Stringify back
    const updatedContent = matter.stringify(content, data);

    fs.writeFileSync(targetPath, updatedContent, 'utf8');

    return NextResponse.json({ success: true, hidden });
  } catch (error) {
    console.error('Toggle hidden error:', error);
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
  }
}
