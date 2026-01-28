
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Helper to convert data to MDOC format
function convertToMdoc(data: Record<string, unknown>) {
  const { content, ...frontmatter } = data;
  
  // Clean up undefined/null values from frontmatter
  const cleanFrontmatter = JSON.parse(JSON.stringify(frontmatter));
  
  const yamlString = yaml.dump(cleanFrontmatter, { lineWidth: -1 });
  
  return `---
${yamlString}---
${(content as string) || ''}
`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { slug, ...projectData } = data;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const albumsDir = path.join(process.cwd(), 'src/content/albums');
    
    // Handle "create" case or rename if slug changes (simplified: just save to slug)
    // If we were fully supporting slug changes, we'd need to check if oldSlug exists and rename.
    // For now, let's assume slug matches the file name we want.

    // If it's a new directory structure (folders) or flat structure?
    // Based on `military-hat.mdoc`, it seems flat in `src/content/albums/` or nested?
    // `military-hat.mdoc` was directly in albums. `main-gallery` was a folder with index.mdoc.
    // Let's standardize on folders for consistency if we want, or flat. 
    // `military-hat.mdoc` exists. Let's support both but prefer creating .mdoc for now as it's simpler.

    // Check if folder exists
    const folderPath = path.join(albumsDir, slug);
    const mdocPath = path.join(albumsDir, `${slug}.mdoc`);
    const indexMdocPath = path.join(folderPath, 'index.mdoc');

    let targetPath = mdocPath;

    // If folder exists, write to index.mdoc
    if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
        targetPath = indexMdocPath;
    } 
    // If .mdoc exists, write to it
    else if (fs.existsSync(mdocPath)) {
        targetPath = mdocPath;
    }
    // New file: prefer .mdoc for simplicity unless we need to colocate images
    else {
        targetPath = mdocPath;
    }

    const fileContent = convertToMdoc(projectData);

    fs.writeFileSync(targetPath, fileContent, 'utf8');

    return NextResponse.json({ success: true, path: targetPath });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
