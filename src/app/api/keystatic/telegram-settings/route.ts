import { NextResponse } from 'next/server';
import { getTelegramSettings } from '../../../../utils/reader';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getTelegramSettings();
    return NextResponse.json({ chatId: settings?.chatId || '' });
  } catch (error) {
    console.error("🔥 TELEGRAM SETTINGS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
