import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

export async function GET(request: Request) {
  try {
    const ip = pickClientIp(request.headers);
    const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : "https://ipapi.co/json/";

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "igrom-3d-environment.ru",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(
      {
        ip: data?.ip ?? null,
        city: data?.city ?? null,
        region: data?.region ?? null,
        country: data?.country_name ?? data?.country ?? null,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 502 });
  }
}

