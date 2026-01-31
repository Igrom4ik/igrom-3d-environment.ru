import { NextResponse } from 'next/server';
import { getSecrets, saveSecrets } from '@/utils/secrets';

// Ensure this route is not statically exported
// export const dynamic = 'force-dynamic';
export const dynamic = 'force-static';

export async function GET() {
  const secrets = getSecrets();
  // Mask sensitive values for display if needed, but for admin panel we might want to see them or just empty placeholders
  // Let's return them as is, assuming the admin panel is protected.
  return NextResponse.json(secrets);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const success = saveSecrets(data);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save secrets' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
