"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@once-ui-system/core";
import { ChevronLeft } from "lucide-react";
import styles from "@/app/admin/portfolio/portfolio.module.css";

type BrandingInfo = Record<
  string,
  {
    url: string;
    exists: boolean;
    version: string | null;
  }
>;

const AssetCard = ({
  title,
  description,
  assetKey,
  accept,
  isImagePreview,
  info,
  onUpload,
  uploading,
}: {
  title: string;
  description: string;
  assetKey: string;
  accept: string;
  isImagePreview: boolean;
  info: BrandingInfo | null;
  uploading: boolean;
  onUpload: (asset: string, file: File) => Promise<void>;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const asset = info?.[assetKey];
  const src = useMemo(() => {
    if (!asset?.url) return null;
    const v = asset.version ? `?v=${encodeURIComponent(asset.version)}` : "";
    return `${asset.url}${v}`;
  }, [asset?.url, asset?.version]);

  return (
    <div style={{ background: "#181920", border: "1px solid #282a36", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <div style={{ color: "#9a9cab", fontSize: 13 }}>{description}</div>
        </div>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          Выбрать файл
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          await onUpload(assetKey, file);
        }}
      />

      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: asset?.exists ? "#b7f7c2" : "#f7d3b7", fontSize: 13 }}>
          {asset?.exists ? "Файл установлен" : "Файл отсутствует"}
        </div>
        {asset?.url && (
          <div style={{ color: "#9a9cab", fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
            {asset.url}
          </div>
        )}
      </div>

      {isImagePreview && src && (
        <div style={{ background: "#0b0b10", border: "1px solid #282a36", borderRadius: 12, padding: 16, display: "flex", justifyContent: "center" }}>
          <img src={src} alt={title} style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
};

export default function ClientPage() {
  const [info, setInfo] = useState<BrandingInfo | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/admin/branding", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as BrandingInfo;
    setInfo(data);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const upload = async (asset: string, file: File) => {
    setUploadingKey(asset);
    try {
      const form = new FormData();
      form.append("asset", asset);
      form.append("file", file);

      const res = await fetch("/api/admin/branding", { method: "PUT", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      await refresh();
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.utilityPageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.navLink} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronLeft size={16} /> Назад
          </Link>
        </div>
        <div className={styles.headerRight}>
          <span style={{ color: "#9a9cab", fontSize: 14 }}>Branding</span>
        </div>
      </header>

      <div className={styles.contentArea}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <AssetCard
            title="Логотип (Dark)"
            description="public/images/LogoBW.png"
            assetKey="logoBW"
            accept="image/png"
            isImagePreview={true}
            info={info}
            uploading={uploadingKey === "logoBW"}
            onUpload={upload}
          />
          <AssetCard
            title="Логотип (Light)"
            description="public/images/LogoColor.png"
            assetKey="logoColor"
            accept="image/png"
            isImagePreview={true}
            info={info}
            uploading={uploadingKey === "logoColor"}
            onUpload={upload}
          />
          <AssetCard
            title="Favicon (SVG)"
            description="public/favicon.svg"
            assetKey="faviconSvg"
            accept="image/svg+xml"
            isImagePreview={false}
            info={info}
            uploading={uploadingKey === "faviconSvg"}
            onUpload={upload}
          />
          <AssetCard
            title="Favicon (ICO)"
            description="public/favicon.ico"
            assetKey="faviconIco"
            accept="image/x-icon"
            isImagePreview={false}
            info={info}
            uploading={uploadingKey === "faviconIco"}
            onUpload={upload}
          />
        </div>
      </div>
    </div>
  );
}

