import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getVersion(publicRelPath: string) {
  try {
    const st = fs.statSync(path.join(process.cwd(), "public", publicRelPath));
    return Math.floor(st.mtimeMs).toString();
  } catch {
    return null;
  }
}

export default function Head() {
  const faviconSvgVersion = getVersion("favicon.svg");
  const faviconIcoVersion = getVersion("favicon.ico");
  const faviconSvgHref = `/favicon.svg${faviconSvgVersion ? `?v=${faviconSvgVersion}` : ""}`;
  const faviconIcoHref = `/favicon.ico${faviconIcoVersion ? `?v=${faviconIcoVersion}` : ""}`;

  return (
    <>
      <link rel="icon" href={faviconSvgHref} type="image/svg+xml" />
      <link rel="alternate icon" href={faviconIcoHref} type="image/x-icon" />
    </>
  );
}

