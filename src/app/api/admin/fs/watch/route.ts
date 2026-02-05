import fs from "node:fs";
import path from "node:path";
import { type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-static';

const PUBLIC_DIR = path.join(process.cwd(), "public");

const isSafePublicPath = (p: string) => {
  if (!p.startsWith("/")) return false;
  if (p.includes("..")) return false;
  if (p.includes("\0")) return false;
  return true;
};

export async function GET(req: NextRequest) {
  if (process.env.IS_GITHUB_PAGES === "true") {
    return new Response("Not available in static export", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const publicPath = searchParams.get("publicPath") ?? "";

  if (!isSafePublicPath(publicPath)) {
    return new Response("Bad Request", { status: 400 });
  }

  const rel = publicPath.replace(/^\//, "");
  const fsPath = path.join(PUBLIC_DIR, rel);
  const dir = path.dirname(fsPath);
  const base = path.basename(fsPath);

  if (!dir.startsWith(PUBLIC_DIR)) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send("ready", { publicPath, ts: Date.now() });

      let watcher: fs.FSWatcher | null = null;
      try {
        watcher = fs.watch(dir, { recursive: false }, (_eventType, filename) => {
          if (filename && filename.toString() !== base) return;
          send("change", { publicPath, ts: Date.now() });
        });
      } catch {
        send("error", { message: "Не удалось запустить мониторинг файла" });
      }

      const interval = setInterval(() => send("ping", { ts: Date.now() }), 15000);

      const close = () => {
        clearInterval(interval);
        try {
          watcher?.close();
        } catch {}
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
