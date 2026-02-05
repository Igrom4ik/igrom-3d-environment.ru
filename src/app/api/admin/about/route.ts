import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = 'force-static';

const ABOUT_FILE_PATH = path.join(process.cwd(), "src/content/about.json");

export async function GET() {
  try {
    if (!fs.existsSync(ABOUT_FILE_PATH)) {
      return NextResponse.json({}, { status: 200 });
    }
    const fileContent = fs.readFileSync(ABOUT_FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать About" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(ABOUT_FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, about: body });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить About" }, { status: 500 });
  }
}

