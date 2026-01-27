import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import path from 'node:path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');

  if (!folder) {
    return NextResponse.json({ error: 'Folder parameter is required' }, { status: 400 });
  }

  // Allow 'marmoset' or subpaths in public
  // We resolve relative to process.cwd() + public
  const safeFolder = folder.replace(/\.\./g, ''); // Simple directory traversal prevention
  const folderPath = path.join(process.cwd(), 'public', safeFolder);
  
  // Detect OS
  const platform = process.platform;
  let command = '';

  if (platform === 'win32') {
    // Windows
    command = `explorer "${folderPath}"`;
  } else if (platform === 'darwin') {
    // macOS
    command = `open "${folderPath}"`;
  } else {
    // Linux
    command = `xdg-open "${folderPath}"`;
  }

  // Execute asynchronously
  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open folder: ${error}`);
    }
  });

  // Return a friendly HTML response
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Folder Opened</title>
        <meta http-equiv="refresh" content="2;url=about:blank">
      </head>
      <body style="background: #1e1e1e; color: #e0e0e0; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        <div style="background: #2d2d2d; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center;">
            <h2 style="margin-top: 0; color: #4caf50;">📂 Folder Opened!</h2>
            <p>You can now paste your large file into the folder.</p>
            <p style="font-size: 0.9em; opacity: 0.7;">This tab will close automatically...</p>
            <button onclick="window.close()" style="margin-top: 1rem; padding: 8px 16px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">Close Now</button>
        </div>
        <script>
            // Attempt to close the window (works if opened by script)
            setTimeout(() => window.close(), 2500);
        </script>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
