import { type NextRequest, NextResponse } from 'next/server';
import { log } from '../../../../utils/logger';

// This API route is incompatible with "output: export" because it uses query parameters.
// The logic has been moved to server-side fetching in /admin/portfolio/[slug]/page.tsx.
// We keep this file as a placeholder to avoid breaking the build or if user wants to restore it later.

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ 
    message: 'This API route is deprecated in static export mode. Use direct server-side file reading instead.' 
  });
}

/*
// ORIGINAL LOGIC (Preserved for reference)
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  // ...
}
*/
