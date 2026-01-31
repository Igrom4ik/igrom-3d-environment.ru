import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';

export async function POST(req: Request) {
  try {
    const { token, secret } = await req.json();

    if (!token || !secret) {
      return NextResponse.json({ valid: false, error: 'Missing token or secret' }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow a bit of time drift
    });

    return NextResponse.json({ valid: verified });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
