"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "tsx";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
  };

  return (
    <div
      style={{
        margin: "16px 0",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(5,8,20,0.9)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "6px 12px",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.08,
          color: "#9da4c0",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{language}</span>
        <button
          onClick={copyToClipboard}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#9da4c0",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            cursor: "pointer",
          }}
        >
          COPY
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: "12px 16px",
            background: "transparent",
            fontSize: 13,
            minWidth: "100%",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function BlogImage({
  src,
  alt,
  size = "m",
}: {
  src: string;
  alt?: string;
  size?: "s" | "m" | "l";
}) {
  const [open, setOpen] = React.useState(false);
  const maxWidth = size === "s" ? 260 : size === "l" ? 720 : 480;

  return (
    <>
      <figure
        style={{
          margin: "16px auto",
          maxWidth,
          cursor: "zoom-in",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
      </figure>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: "24px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 20,
              boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </>
  );
}

export function ZoomImage(props: any) {
  const [isZoomed, setIsZoomed] = React.useState(false);
  // Filter out potential conflicting props
  const { width, height, style, ...rest } = props;

  return (
    <>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          margin: '24px 0',
          width: '100%',
          cursor: 'zoom-in'
        }}
        onClick={() => setIsZoomed(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...rest}
          style={{
            maxWidth: "100%", 
            width: "auto", 
            height: "auto",
            maxHeight: "350px", // Reduced from 500px to prevent huge images
            borderRadius: 16,
            display: "block",
            border: "1px solid rgba(255,255,255,0.08)",
            objectFit: "contain",
            transition: "transform 0.2s ease-in-out",
            margin: "0 auto",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        />
      </div>

      {isZoomed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '20px'
          }}
          onClick={() => setIsZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...rest}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain',
              borderRadius: 4,
              boxShadow: '0 0 40px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}
    </>
  );
}
