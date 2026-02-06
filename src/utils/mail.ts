import nodemailer from 'nodemailer';
import { getSecret } from '@/utils/secrets';
import fs from 'fs';
import path from 'path';

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export function getMailConfig(): MailConfig | null {
  // 1. Try to read from Keystatic settings (admin panel)
  const settingsPath = path.join(process.cwd(), 'src/content/settings.json');
  
  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const emailSettings = settingsData?.email;
      
      if (emailSettings?.enabled) {
        return {
          host: emailSettings.host,
          port: Number(emailSettings.port),
          secure: emailSettings.secure,
          user: emailSettings.user,
          pass: emailSettings.password,
          fromName: emailSettings.fromName || 'Portfolio',
          fromEmail: emailSettings.user
        };
      }
    }
  } catch (err) {
    console.error('Failed to read email settings from file:', err);
  }

  // 2. Fallback to Environment Variables / Secrets
  const host = getSecret('SMTP_HOST');
  const user = getSecret('SMTP_USER');
  const pass = getSecret('SMTP_PASS');
  
  if (host && user && pass) {
     return {
        host,
        port: Number(getSecret('SMTP_PORT') || 587),
        secure: getSecret('SMTP_SECURE') === 'true',
        user,
        pass,
        fromName: 'Portfolio',
        fromEmail: user
     };
  }

  return null;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}) {
  const config = getMailConfig();

  if (!config) {
    console.warn('SMTP disabled: missing credentials (checked Admin Settings and ENV)');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const fromString = options.from || `"${config.fromName}" <${config.fromEmail}>`;

  await transporter.sendMail({
    from: fromString,
    ...options,
  });
}
