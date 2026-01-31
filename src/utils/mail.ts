import nodemailer from 'nodemailer';
import { getSecret } from '@/utils/secrets';

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}) {
  const host = getSecret('SMTP_HOST');
  const port = getSecret('SMTP_PORT');
  const secure = getSecret('SMTP_SECURE');
  const user = getSecret('SMTP_USER');
  const pass = getSecret('SMTP_PASS');

  if (!host || !user || !pass) {
    console.log('SMTP disabled: missing credentials');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: secure === 'true', // true для 465
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: options.from || `"Portfolio" <${user}>`,
    ...options,
  });
}
