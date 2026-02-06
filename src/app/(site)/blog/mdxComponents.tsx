import React from "react";
import { CodeBlock, BlogImage, ZoomImage } from "./ClientMdxComponents";
import { getImageUrl } from "@/lib/assets";

export function HeroImage({ src, alt }: { src: string; alt?: string }) {
  const normalizedSrc = getImageUrl(src);
  return (
    <figure
      style={{
        margin: "24px 0 16px",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalizedSrc}
        alt={alt ?? ""}
        style={{ width: "100%", display: "block", objectFit: "cover" }}
      />
    </figure>
  );
}

export function Note({
  type = "info",
  children,
}: {
  type?: "info" | "tip" | "warning";
  children: React.ReactNode;
}) {
  const colors: Record<string, { border: string; bg: string }> = {
    info: {
      border: "rgba(80, 160, 255, 0.6)",
      bg: "rgba(80, 160, 255, 0.08)",
    },
    tip: {
      border: "rgba(80, 220, 160, 0.6)",
      bg: "rgba(80, 220, 160, 0.08)",
    },
    warning: {
      border: "rgba(255, 180, 80, 0.7)",
      bg: "rgba(255, 180, 80, 0.08)",
    },
  };

  const c = colors[type];

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${c.border}`,
        background:
          "linear-gradient(135deg, rgba(15,20,40,0.95), rgba(10,10,25,0.95))",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.12,
          marginBottom: 6,
          color: c.border,
        }}
      >
        {type === "tip" ? "Pro tip" : type}
      </div>
      <div style={{ fontSize: 14, color: "#d7dbf0" }}>{children}</div>
    </div>
  );
}

export function VideoPlayer({ src }: { src: string }) {
  const normalizedSrc = getImageUrl(src);
  return (
    <div
      style={{
        margin: "24px 0",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "black",
        position: "relative",
        paddingTop: "56.25%", // 16:9 Aspect Ratio
      }}
    >
      <video
        controls
        src={normalizedSrc}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export function AudioPlayer({ src }: { src: string }) {
  const normalizedSrc = getImageUrl(src);
  return (
    <div
      style={{
        margin: "16px 0",
        padding: "16px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,10,20,0.95)",
      }}
    >
      <audio controls src={normalizedSrc} style={{ width: "100%" }} />
    </div>
  );
}

// Export components object for MDX
export const mdxComponents = {
  code: CodeBlock,
  pre: (props: any) => <div {...props} />, // Prevent double <pre>
  BlogImage,
  img: ZoomImage,
  HeroImage,
  Note,
  VideoPlayer,
  AudioPlayer,
};
