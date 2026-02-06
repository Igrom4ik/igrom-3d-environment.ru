import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_AVATAR_PATH, normalizeAvatarPath } from "@/lib/avatar";

export const dynamic = "force-dynamic";

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src/content/settings.json');
const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "images", "uploads");
const AVATAR_PUBLIC_PATH = DEFAULT_AVATAR_PATH;
const AVATAR_FILE_NAME = "avatar.webp";
const AVATAR_FS_PATH = path.join(UPLOADS_DIR, AVATAR_FILE_NAME);

type AvatarMode = "keep" | "upload" | "reset";

const isSafePublicPath = (p: string) => {
  if (!p.startsWith("/")) return false;
  if (p.includes("..")) return false;
  if (p.includes("\0")) return false;
  return true;
};

const isUploadsAvatarPath = (p: string) => isSafePublicPath(p) && p.startsWith("/images/uploads/");

function toFsPublicPath(publicPath: string) {
  const normalized = publicPath.replaceAll("\\", "/");
  const rel = normalized.replace(/^\//, "");
  return path.join(PUBLIC_DIR, rel);
}

function getAvatarAbsolutePathFromSettings(settings: any) {
  const avatar = normalizeAvatarPath(settings?.person?.avatar);
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return null;
  if (!isSafePublicPath(avatar)) return null;
  return toFsPublicPath(avatar);
}

function readUInt16BE(buf: Buffer, off: number) {
  return (buf[off] << 8) | buf[off + 1];
}

function readUInt32BE(buf: Buffer, off: number) {
  return (buf[off] * 2 ** 24) + (buf[off + 1] << 16) + (buf[off + 2] << 8) + buf[off + 3];
}

function getPngSize(buf: Buffer) {
  if (buf.length < 24) return null;
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) if (buf[i] !== sig[i]) return null;
  const width = readUInt32BE(buf, 16);
  const height = readUInt32BE(buf, 20);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
}

function getJpegSize(buf: Buffer) {
  if (buf.length < 4) return null;
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    let marker = buf[offset + 1];
    offset += 2;
    while (marker === 0xff && offset < buf.length) {
      marker = buf[offset];
      offset += 1;
    }
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buf.length) return null;
    const size = readUInt16BE(buf, offset);
    if (size < 2) return null;
    if (marker === 0xc0 || marker === 0xc2) {
      if (offset + 7 > buf.length) return null;
      const height = readUInt16BE(buf, offset + 3);
      const width = readUInt16BE(buf, offset + 5);
      return { width, height };
    }
    offset += size;
  }
  return null;
}

function getWebpSize(buf: Buffer) {
  if (buf.length < 16) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);

  if (chunk === "VP8X") {
    if (buf.length < 30) return null;
    const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width: w, height: h };
  }

  if (chunk === "VP8 ") {
    if (buf.length < 30) return null;
    const start = 20;
    if (buf[start] !== 0x9d || buf[start + 1] !== 0x01 || buf[start + 2] !== 0x2a) return null;
    const w = readUInt16BE(buf, start + 3) & 0x3fff;
    const h = readUInt16BE(buf, start + 5) & 0x3fff;
    return { width: w, height: h };
  }

  if (chunk === "VP8L") {
    if (buf.length < 25) return null;
    if (buf[20] !== 0x2f) return null;
    const b0 = buf[21];
    const b1 = buf[22];
    const b2 = buf[23];
    const b3 = buf[24];
    const w = 1 + (((b1 & 0x3f) << 8) | b0);
    const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width: w, height: h };
  }

  return null;
}

function getImageSize(buf: Buffer, mime: string) {
  if (mime === "image/png") return getPngSize(buf);
  if (mime === "image/jpeg") return getJpegSize(buf);
  if (mime === "image/webp") return getWebpSize(buf);
  return null;
}

function parseSettingsJson(raw: unknown) {
  if (typeof raw !== "string") {
    return { ok: false as const, error: "Invalid settings payload" };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false as const, error: "Invalid settings payload" };
    }
    return { ok: true as const, value: parsed };
  } catch {
    return { ok: false as const, error: "Invalid settings payload" };
  }
}

function enforceAvatarPath(settings: any) {
  if (!settings.person) settings.person = {};
  settings.person.avatar = AVATAR_PUBLIC_PATH;
}

type ParsedMultipartField =
  | { kind: "field"; name: string; value: string }
  | { kind: "file"; name: string; filename: string; contentType: string; buffer: Buffer };

function parseContentDisposition(headerValue: string) {
  const parts = headerValue.split(";").map((p) => p.trim());
  const out: Record<string, string> = {};
  for (const part of parts.slice(1)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    let value = part.slice(eq + 1).trim();
    if (value.startsWith("\"") && value.endsWith("\"")) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

function parseMultipartBody(body: Buffer) {
  const firstCrlf = body.indexOf("\r\n");
  if (firstCrlf === -1) return null;
  const firstLine = body.slice(0, firstCrlf).toString("utf8");
  if (!firstLine.startsWith("--") || firstLine.length < 4) return null;
  const boundary = firstLine.slice(2);
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const fields: ParsedMultipartField[] = [];

  let pos = 0;
  while (true) {
    const start = body.indexOf(boundaryBuf, pos);
    if (start === -1) break;
    let cursor = start + boundaryBuf.length;
    if (cursor + 2 <= body.length && body.slice(cursor, cursor + 2).toString("utf8") === "--") {
      break;
    }
    if (cursor + 2 <= body.length && body.slice(cursor, cursor + 2).toString("utf8") === "\r\n") {
      cursor += 2;
    } else {
      pos = cursor;
      continue;
    }

    const headerEnd = body.indexOf("\r\n\r\n", cursor);
    if (headerEnd === -1) break;
    const headerText = body.slice(cursor, headerEnd).toString("utf8");
    const headers = new Map<string, string>();
    for (const line of headerText.split("\r\n")) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      headers.set(line.slice(0, idx).trim().toLowerCase(), line.slice(idx + 1).trim());
    }

    const contentDisposition = headers.get("content-disposition") ?? "";
    const cd = parseContentDisposition(contentDisposition);
    const name = cd["name"];
    if (!name) break;

    const partBodyStart = headerEnd + 4;
    const nextBoundary = body.indexOf(boundaryBuf, partBodyStart);
    if (nextBoundary === -1) break;
    let partBodyEnd = nextBoundary;
    if (partBodyEnd >= 2 && body.slice(partBodyEnd - 2, partBodyEnd).toString("utf8") === "\r\n") {
      partBodyEnd -= 2;
    }
    const partBody = body.slice(partBodyStart, partBodyEnd);

    const filename = cd["filename"];
    if (filename) {
      fields.push({
        kind: "file",
        name,
        filename,
        contentType: headers.get("content-type") ?? "application/octet-stream",
        buffer: partBody,
      });
    } else {
      fields.push({
        kind: "field",
        name,
        value: partBody.toString("utf8"),
      });
    }

    pos = nextBoundary;
  }

  return { boundary, fields };
}

async function applyAvatarModeAndSave({
  nextSettings,
  prevSettings,
  avatarMode,
  avatarBuffer,
  avatarMime,
}: {
  nextSettings: any;
  prevSettings: any;
  avatarMode: AvatarMode;
  avatarBuffer?: Buffer;
  avatarMime?: string;
}) {
  const prevAvatar = typeof prevSettings?.person?.avatar === "string" ? prevSettings.person.avatar : null;
  enforceAvatarPath(nextSettings);

  if (avatarMode === "reset") {
    if (fs.existsSync(AVATAR_FS_PATH)) fs.rmSync(AVATAR_FS_PATH, { force: true });
    if (prevAvatar && isUploadsAvatarPath(prevAvatar) && prevAvatar !== AVATAR_PUBLIC_PATH) {
      const oldFsPath = toFsPublicPath(prevAvatar);
      if (fs.existsSync(oldFsPath)) fs.rmSync(oldFsPath, { force: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
    return { success: true, settings: nextSettings };
  }

  if (avatarMode === "upload") {
    if (!avatarBuffer || !avatarMime) {
      return { error: "Не передан файл аватара", status: 400 as const };
    }

    if (avatarBuffer.byteLength > 5 * 1024 * 1024) {
      return { error: "Файл слишком большой (максимум 5 МБ)", status: 400 as const };
    }

    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(avatarMime)) {
      return { error: "Неверный формат (разрешены JPEG, PNG, WebP)", status: 400 as const };
    }

    const size = getImageSize(avatarBuffer, avatarMime);
    if (!size) {
      return { error: "Не удалось определить размер изображения", status: 400 as const };
    }
    if (size.width < 200 || size.height < 200) {
      return { error: "Слишком маленькое изображение (минимум 200×200)", status: 400 as const };
    }
    if (size.width > 1000 || size.height > 1000) {
      return { error: "Слишком большое изображение (максимум 1000×1000)", status: 400 as const };
    }

    const tmpName = `avatar-temp-${Date.now()}-${Math.random().toString(16).slice(2)}.webp.tmp`;
    const tmpPath = path.join(UPLOADS_DIR, tmpName);
    fs.writeFileSync(tmpPath, avatarBuffer);
    if (fs.existsSync(AVATAR_FS_PATH)) fs.rmSync(AVATAR_FS_PATH, { force: true });
    fs.renameSync(tmpPath, AVATAR_FS_PATH);

    try {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
    } catch (err) {
      if (fs.existsSync(AVATAR_FS_PATH)) fs.rmSync(AVATAR_FS_PATH, { force: true });
      throw err;
    }

    if (prevAvatar && isUploadsAvatarPath(prevAvatar) && prevAvatar !== AVATAR_PUBLIC_PATH) {
      const oldFsPath = toFsPublicPath(prevAvatar);
      if (fs.existsSync(oldFsPath)) fs.rmSync(oldFsPath, { force: true });
    }

    return { success: true, settings: nextSettings };
  }

  if (prevAvatar && isUploadsAvatarPath(prevAvatar) && prevAvatar !== AVATAR_PUBLIC_PATH) {
    const oldFsPath = toFsPublicPath(prevAvatar);
    if (fs.existsSync(oldFsPath)) fs.rmSync(oldFsPath, { force: true });
  }
  fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
  return { success: true, settings: nextSettings };
}

export async function GET() {
  try {
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
      return NextResponse.json({}, { status: 200 });
    }
    const fileContent = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    const avatarAbsolutePath = getAvatarAbsolutePathFromSettings(data);
    return NextResponse.json({ ...data, __meta: { avatarAbsolutePath } });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const rawSettings = form.get("settings");
      const avatarMode = (form.get("avatarMode")?.toString() ?? "keep") as AvatarMode;
      const avatarFile = form.get("avatar");

      const parsed = parseSettingsJson(rawSettings);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      const nextSettings = parsed.value;
      const prevSettings = fs.existsSync(SETTINGS_FILE_PATH)
        ? JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, "utf-8"))
        : {};

      let buffer: Buffer | undefined;
      let mime: string | undefined;
      if (avatarMode === "upload") {
        const fileLike = avatarFile as any;
        if (!fileLike || typeof fileLike !== "object" || typeof fileLike.arrayBuffer !== "function") {
          return NextResponse.json({ error: "Не передан файл аватара" }, { status: 400 });
        }
        buffer = Buffer.from(await fileLike.arrayBuffer());
        mime = typeof fileLike.type === "string" && fileLike.type ? fileLike.type : "application/octet-stream";
      }

      const result = await applyAvatarModeAndSave({
        nextSettings,
        prevSettings,
        avatarMode,
        avatarBuffer: buffer,
        avatarMime: mime,
      });

      if ("status" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }

    const fallbackClone = request.clone();
    try {
      const body = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
      }
      enforceAvatarPath(body);
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
      return NextResponse.json({ success: true, settings: body });
    } catch (jsonErr) {
      const raw = Buffer.from(await fallbackClone.arrayBuffer());
      const parsed = parseMultipartBody(raw);
      if (!parsed) {
        return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
      }

      const rawSettings = parsed.fields.find((f) => f.kind === "field" && f.name === "settings");
      const rawAvatarMode = parsed.fields.find((f) => f.kind === "field" && f.name === "avatarMode");
      const avatarFile = parsed.fields.find((f) => f.kind === "file" && f.name === "avatar");
      const parsedSettings = parseSettingsJson(rawSettings && rawSettings.kind === "field" ? rawSettings.value : null);
      if (!parsedSettings.ok) {
        return NextResponse.json({ error: parsedSettings.error }, { status: 400 });
      }

      const avatarMode = ((rawAvatarMode && rawAvatarMode.kind === "field" ? rawAvatarMode.value : "keep") as AvatarMode) ?? "keep";

      const nextSettings = parsedSettings.value;
      const prevSettings = fs.existsSync(SETTINGS_FILE_PATH)
        ? JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, "utf-8"))
        : {};

      const result = await applyAvatarModeAndSave({
        nextSettings,
        prevSettings,
        avatarMode,
        avatarBuffer: avatarFile && avatarFile.kind === "file" ? avatarFile.buffer : undefined,
        avatarMime: avatarFile && avatarFile.kind === "file" ? avatarFile.contentType : undefined,
      });

      if ("status" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
