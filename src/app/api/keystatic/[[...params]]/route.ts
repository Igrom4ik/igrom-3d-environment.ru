import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const { GET: _GET, POST: _POST } = makeRouteHandler({
  config,
});

export async function GET(req: NextRequest, context: any) {
    try {
        console.log(`[Keystatic API] GET ${req.url}`);
        return await _GET(req);
    } catch (error) {
        console.error("🔥 KEYSTATIC GET ERROR:", error);
        return new NextResponse(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

export async function POST(req: NextRequest, context: any) {
    try {
        console.log(`[Keystatic API] POST ${req.url}`);
        return await _POST(req);
    } catch (error) {
        console.error("🔥 KEYSTATIC POST ERROR:", error);
        return new NextResponse(JSON.stringify({ error: String(error) }), { status: 500 });
    }
}

export const maxDuration = 300; // 5 minutes for large file uploads
