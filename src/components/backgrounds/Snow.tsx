"use client";
import React, { useEffect, useRef } from "react";

export const SnowBackground = ({ density = 150 }: { density?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      density: Math.random() * 150, // This is individual variance, keeping it
      speed: Math.random() * 1 + 0.5
    }));

    let angle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "white";
      
      angle += 0.01;

      particles.forEach((p) => {
        // Update position
        p.y += p.speed;
        p.x += Math.sin(angle + p.density) * 0.5; // Sway

        // Reset if off screen
        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        const parent = canvas.parentElement;
        if (parent) {
            width = canvas.width = parent.clientWidth;
            height = canvas.height = parent.clientHeight;
        } else {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
    };
    
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [density]); 

  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }} />;
};
