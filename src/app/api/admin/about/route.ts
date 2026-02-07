import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = 'force-dynamic';

const ABOUT_FILE_PATH = path.join(process.cwd(), "src/content/about.json");

type AboutJson = {
  title?: string;
  description?: string;
  tableOfContent?: { display?: boolean; subItems?: boolean };
  avatar?: { display?: boolean };
  calendar?: { display?: boolean; link?: string };
  work?: { display?: boolean; title?: string; experiences?: unknown[] };
  studies?: { display?: boolean; title?: string; institutions?: unknown[] };
  technical?: { display?: boolean; title?: string; skills?: unknown[] };
  blocks?: unknown[];
  [key: string]: unknown;
};

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
    const body = (await request.json()) as Partial<AboutJson>;
    let existing: Partial<AboutJson> = {};
    if (fs.existsSync(ABOUT_FILE_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(ABOUT_FILE_PATH, "utf-8")) as Partial<AboutJson>;
      } catch {
        existing = {};
      }
    }

    const merged: AboutJson = {
      ...existing,
      ...body,
      tableOfContent: { ...(existing.tableOfContent ?? {}), ...(body.tableOfContent ?? {}) },
      avatar: { ...(existing.avatar ?? {}), ...(body.avatar ?? {}) },
      calendar: { ...(existing.calendar ?? {}), ...(body.calendar ?? {}) },
      work: { ...(existing.work ?? {}), ...(body.work ?? {}) },
      studies: { ...(existing.studies ?? {}), ...(body.studies ?? {}) },
      technical: { ...(existing.technical ?? {}), ...(body.technical ?? {}) },
    };

    if (!merged.tableOfContent) merged.tableOfContent = { display: true, subItems: false };
    if (typeof merged.tableOfContent.display !== "boolean") merged.tableOfContent.display = true;
    if (typeof merged.tableOfContent.subItems !== "boolean") merged.tableOfContent.subItems = false;

    if (!merged.avatar) merged.avatar = { display: true };
    if (typeof merged.avatar.display !== "boolean") merged.avatar.display = true;

    if (!merged.calendar) merged.calendar = { display: true, link: "" };
    if (typeof merged.calendar.display !== "boolean") merged.calendar.display = true;
    if (typeof merged.calendar.link !== "string") merged.calendar.link = "";

    if (!merged.work) merged.work = { display: true, title: "Опыт работы", experiences: [] };
    if (typeof merged.work.display !== "boolean") merged.work.display = true;
    if (typeof merged.work.title !== "string") merged.work.title = "Опыт работы";
    if (!Array.isArray(merged.work.experiences)) merged.work.experiences = [];

    if (!merged.studies) merged.studies = { display: true, title: "Образование", institutions: [] };
    if (typeof merged.studies.display !== "boolean") merged.studies.display = true;
    if (typeof merged.studies.title !== "string") merged.studies.title = "Образование";
    if (!Array.isArray(merged.studies.institutions)) merged.studies.institutions = [];

    if (!merged.technical) merged.technical = { display: true, title: "Навыки", skills: [] };
    if (typeof merged.technical.display !== "boolean") merged.technical.display = true;
    if (typeof merged.technical.title !== "string") merged.technical.title = "Навыки";
    if (!Array.isArray(merged.technical.skills)) merged.technical.skills = [];

    if (!Array.isArray(merged.blocks)) merged.blocks = existing.blocks ?? [];

    fs.writeFileSync(ABOUT_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8");
    return NextResponse.json({ success: true, about: merged });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить About" }, { status: 500 });
  }
}
