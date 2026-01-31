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

  // Simple copy function
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
        position: "relative", // For positioning copy button
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
            minWidth: "100%", // Ensure content doesn't shrink
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function HeroImage({ src, alt }: { src: string; alt?: string }) {
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
        src={src}
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
        src={src}
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
      <audio controls src={src} style={{ width: "100%" }} />
    </div>
  );
}

// Export components object for MDX
export const mdxComponents = {
  code: CodeBlock,
  pre: (props: any) => <div {...props} />, // Prevent double <pre>
  img: function ImageWithZoom(props: any) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
              maxHeight: "250px", // Reduced and Enforced
              width: "auto", 
              height: "auto",
              borderRadius: 8,
              display: "block",
              border: "1px solid rgba(255,255,255,0.1)",
              objectFit: "contain",
              transition: "transform 0.2s ease-in-out",
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
  },
  HeroImage,
  Note,
  VideoPlayer,
  AudioPlayer,
};
