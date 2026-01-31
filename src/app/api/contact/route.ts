import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSecret } from '@/utils/secrets';

// NOTE: This API route will NOT work with "output: export" (static site generation).
// It requires a Node.js server (e.g. Vercel, VPS, or "npm start" without "output: export").
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Get config from secrets.json or env
    const host = getSecret('SMTP_HOST') || 'smtp.beget.com';
    const port = Number(getSecret('SMTP_PORT')) || 465;
    const user = getSecret('SMTP_USER');
    const pass = getSecret('SMTP_PASS');

    // Debug logging for SMTP config (careful not to log full password)
    console.log('Initializing SMTP transport with:', {
      host,
      port,
      user,
      passLength: pass ? pass.length : 0
    });

    if (!user || !pass) {
      console.error('SMTP credentials missing in environment variables or secrets.json');
      return NextResponse.json({ error: 'Server configuration error (missing credentials)' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: user, // Sender address
      to: user, // Receiver address (send to self)
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
