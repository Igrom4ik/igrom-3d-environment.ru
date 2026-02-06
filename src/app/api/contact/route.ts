import { NextResponse } from 'next/server';
import { sendMail, getMailConfig } from '@/utils/mail';

// NOTE: This API route will NOT work with "output: export" (static site generation).
// It requires a Node.js server (e.g. Vercel, VPS, or "npm start" without "output: export").
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const config = getMailConfig();
    
    if (!config) {
      console.error('SMTP credentials missing (Checked Admin Settings and ENV)');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    await sendMail({
      to: config.user, // Send to self
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
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
