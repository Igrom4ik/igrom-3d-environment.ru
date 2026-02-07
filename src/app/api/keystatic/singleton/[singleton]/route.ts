import { createReader } from "@keystatic/core/reader";
import { NextResponse, type NextRequest } from "next/server";
import keystaticConfig from "../../../../../../keystatic.config";

export const dynamic = "force-dynamic";

const reader = createReader(process.cwd(), keystaticConfig);

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ singleton: string }> },
) {
  try {
    const { singleton } = await context.params;

    switch (singleton) {
      case "about": {
        const entry = await reader.singletons.about.read();
        return NextResponse.json(entry ?? null);
      }
      case "home": {
        const entry = await reader.singletons.home.read();
        return NextResponse.json(entry ?? null);
      }
      case "work": {
        const entry = await reader.singletons.work.read();
        return NextResponse.json(entry ?? null);
      }
      case "gallery": {
        const entry = await reader.singletons.gallery.read();
        return NextResponse.json(entry ?? null);
      }
      case "design": {
        const entry = await reader.singletons.design.read();
        return NextResponse.json(entry ?? null);
      }
      case "settings": {
        const entry = await reader.singletons.settings.read();
        return NextResponse.json(entry ?? null);
      }
      case "telegramSettings": {
        const entry = await reader.singletons.telegramSettings.read();
        return NextResponse.json(entry ?? null);
      }
      default:
        return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
