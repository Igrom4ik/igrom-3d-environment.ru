"use client";
import React, { useEffect, useRef } from "react";

export const InteractiveGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const gap = 40;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let x = 0; x <= width; x += gap) {
        for (let y = 0; y <= height; y += gap) {
          const dx = mouse.current.x - x;
          const dy = mouse.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate displacement
          const maxDist = 200;
          let activeX = x;
          let activeY = y;
          let size = 2;
          let alpha = 0.2;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            activeX -= (dx / dist) * force * 20;
            activeY -= (dy / dist) * force * 20;
            size = 2 + force * 3;
            alpha = 0.2 + force * 0.8;
          }

          ctx.beginPath();
          ctx.arc(activeX, activeY, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    
    animate();

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1, pointerEvents: "none" }} />;
};
