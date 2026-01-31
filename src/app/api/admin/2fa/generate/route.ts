import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getSecret } from '@/utils/secrets';

export async function POST() {
  try {
    const adminEmail = getSecret('ADMIN_EMAIL') || 'admin@igrom-3d-environment.ru';
    
    const secret = speakeasy.generateSecret({
      name: `Portfolio Admin (${adminEmail})`,
      issuer: 'Igrom 3D Environment'
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate otpauth_url');
    }

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('Error generating 2FA:', error);
    return NextResponse.json({ error: 'Failed to generate 2FA secret' }, { status: 500 });
  }
}
