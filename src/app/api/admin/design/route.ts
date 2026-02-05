import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const DESIGN_FILE_PATH = path.join(process.cwd(), 'src/content/design.json');

export async function GET() {
  try {
    if (!fs.existsSync(DESIGN_FILE_PATH)) {
      return NextResponse.json({}, { status: 200 });
    }
    const fileContent = fs.readFileSync(DESIGN_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading design settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validate or sanitize body if needed
    // For now, we assume admin knows what they are doing and body matches the schema
    
    fs.writeFileSync(DESIGN_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error('Error saving design settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
