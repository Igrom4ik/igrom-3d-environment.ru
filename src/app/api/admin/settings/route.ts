import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = 'force-static';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src/content/settings.json');
const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "images", "uploads");

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
  const avatar = settings?.person?.avatar;
  if (typeof avatar !== "string" || !isSafePublicPath(avatar)) return null;
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

      if (typeof rawSettings !== "string") {
        return NextResponse.json({ error: "Не переданы данные настроек" }, { status: 400 });
      }

      const nextSettings = JSON.parse(rawSettings);
      const prevSettings = fs.existsSync(SETTINGS_FILE_PATH)
        ? JSON.parse(fs.readFileSync(SETTINGS_FILE_PATH, "utf-8"))
        : {};

      const prevAvatar = typeof prevSettings?.person?.avatar === "string" ? prevSettings.person.avatar : null;
      const defaultAvatar = "/images/avatar.jpg";

      if (!nextSettings.person) nextSettings.person = {};

      if (avatarMode === "reset") {
        nextSettings.person.avatar = defaultAvatar;
        if (prevAvatar && isUploadsAvatarPath(prevAvatar)) {
          const oldFsPath = toFsPublicPath(prevAvatar);
          if (fs.existsSync(oldFsPath)) fs.rmSync(oldFsPath, { force: true });
        }

        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
        return NextResponse.json({ success: true, settings: nextSettings });
      }

      if (avatarMode === "upload") {
        if (!(avatarFile instanceof File)) {
          return NextResponse.json({ error: "Не передан файл аватара" }, { status: 400 });
        }

        if (avatarFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "Файл слишком большой (максимум 5 МБ)" }, { status: 400 });
        }

        const mime = avatarFile.type || "application/octet-stream";
        const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
        if (!allowed.has(mime)) {
          return NextResponse.json({ error: "Неверный формат (разрешены JPEG, PNG, WebP)" }, { status: 400 });
        }

        const buffer = Buffer.from(await avatarFile.arrayBuffer());
        const size = getImageSize(buffer, mime);
        if (!size) {
          return NextResponse.json({ error: "Не удалось определить размер изображения" }, { status: 400 });
        }
        if (size.width < 200 || size.height < 200) {
          return NextResponse.json({ error: "Слишком маленькое изображение (минимум 200×200)" }, { status: 400 });
        }
        if (size.width > 1000 || size.height > 1000) {
          return NextResponse.json({ error: "Слишком большое изображение (максимум 1000×1000)" }, { status: 400 });
        }

        const fileName = `avatar-${Date.now()}.webp`;
        const tmpPath = path.join(UPLOADS_DIR, `${fileName}.tmp`);
        const finalPath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(tmpPath, buffer);
        fs.renameSync(tmpPath, finalPath);

        nextSettings.person.avatar = `/images/uploads/${fileName}`;

        try {
          fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
        } catch (err) {
          if (fs.existsSync(finalPath)) fs.rmSync(finalPath, { force: true });
          throw err;
        }

        if (prevAvatar && isUploadsAvatarPath(prevAvatar)) {
          const oldFsPath = toFsPublicPath(prevAvatar);
          if (fs.existsSync(oldFsPath)) fs.rmSync(oldFsPath, { force: true });
        }

        return NextResponse.json({ success: true, settings: nextSettings });
      }

      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(nextSettings, null, 2), "utf-8");
      return NextResponse.json({ success: true, settings: nextSettings });
    }

    const body = await request.json();
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
