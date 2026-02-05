"use client";
import React, { useEffect, useRef } from "react";

export const WaveGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height); // Clear for transparency
      // Optionally fill with background color if needed, but transparency is better for overlay
      
      ctx.strokeStyle = "rgba(0, 255, 200, 0.5)";
      ctx.lineWidth = 1;

      const perspective = 300;
      const gridWidth = 2000;
      const gridHeight = 1000;
      const spacing = 40;

      for (let z = 0; z < gridHeight; z += spacing) {
        ctx.beginPath();
        for (let x = -gridWidth / 2; x < gridWidth / 2; x += spacing) {
            // Wave calculation
            const yOffset = Math.sin(x * 0.005 + frame * 0.05) * 20 + Math.sin(z * 0.01 + frame * 0.05) * 20;
            
            // 3D Projection
            const scale = perspective / (perspective + z);
            const px = width / 2 + x * scale;
            const py = height / 2 + 100 + yOffset * scale;

            if (x === -gridWidth / 2) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      frame++;
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
