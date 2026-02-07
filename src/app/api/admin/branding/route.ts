import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

const ASSETS = {
  logoBW: { absPath: path.join(IMAGES_DIR, "LogoBW.png"), url: "/images/LogoBW.png", kind: "png" as const },
  logoColor: { absPath: path.join(IMAGES_DIR, "LogoColor.png"), url: "/images/LogoColor.png", kind: "png" as const },
  faviconSvg: { absPath: path.join(PUBLIC_DIR, "favicon.svg"), url: "/favicon.svg", kind: "svg" as const },
  faviconIco: { absPath: path.join(PUBLIC_DIR, "favicon.ico"), url: "/favicon.ico", kind: "ico" as const },
} as const;

function safeStat(filePath: string) {
  try {
    const st = fs.statSync(filePath);
    return { exists: true, mtimeMs: st.mtimeMs };
  } catch {
    return { exists: false, mtimeMs: null as number | null };
  }
}

export async function GET() {
  const payload = Object.fromEntries(
    Object.entries(ASSETS).map(([key, cfg]) => {
      const st = safeStat(cfg.absPath);
      return [
        key,
        {
          url: cfg.url,
          exists: st.exists,
          version: st.mtimeMs ? Math.floor(st.mtimeMs).toString() : null,
        },
      ];
    }),
  );
  return NextResponse.json(payload);
}

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();
    const asset = form.get("asset")?.toString() ?? "";
    const file = form.get("file");

    if (!(asset in ASSETS)) {
      return NextResponse.json({ error: "Unknown asset" }, { status: 400 });
    }

    const cfg = ASSETS[asset as keyof typeof ASSETS];

    const fileLike = file as any;
    if (!fileLike || typeof fileLike !== "object" || typeof fileLike.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buffer = Buffer.from(await fileLike.arrayBuffer());
    if (buffer.byteLength === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
    if (buffer.byteLength > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });

    if (cfg.kind === "png") {
      const signature = buffer.subarray(0, 8);
      const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (!signature.equals(pngSig)) {
        return NextResponse.json({ error: "Only PNG allowed" }, { status: 400 });
      }
    }

    if (cfg.kind === "svg") {
      const text = buffer.toString("utf8", 0, Math.min(buffer.length, 1024));
      if (!text.includes("<svg")) {
        return NextResponse.json({ error: "Only SVG allowed" }, { status: 400 });
      }
    }

    if (cfg.kind === "ico") {
      if (buffer.length < 4 || buffer[0] !== 0x00 || buffer[1] !== 0x00) {
        return NextResponse.json({ error: "Only ICO allowed" }, { status: 400 });
      }
    }

    fs.mkdirSync(path.dirname(cfg.absPath), { recursive: true });
    const tmpPath = `${cfg.absPath}.tmp`;
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, cfg.absPath);

    const st = safeStat(cfg.absPath);
    return NextResponse.json({
      success: true,
      url: cfg.url,
      version: st.mtimeMs ? Math.floor(st.mtimeMs).toString() : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}

