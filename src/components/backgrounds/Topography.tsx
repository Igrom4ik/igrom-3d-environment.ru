"use client";
import React, { useEffect, useRef } from "react";

export const TopographyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let offset = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
            // Combine sine waves to create organic shapes
            const noise = 
                Math.sin(x * 0.01 + offset) * 20 + 
                Math.sin(x * 0.03 + y * 0.02) * 10;
            ctx.lineTo(x, y + noise);
        }
        ctx.stroke();
      }
      offset += 0.01;
      requestAnimationFrame(animate);
    };

    animate();
    
    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1, pointerEvents: "none" }} />;
};
