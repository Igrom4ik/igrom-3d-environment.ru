import { NextResponse } from 'next/server';
import { getSiteSettings, saveSiteSettings } from '@/utils/siteSettings';

// Ensure this route is not statically exported
// export const dynamic = 'force-dynamic';
export const dynamic = 'force-static';

export async function GET() {
  const settings = getSiteSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const success = saveSiteSettings(data);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
