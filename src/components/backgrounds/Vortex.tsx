"use client";
import React, { useEffect, useRef } from "react";

export const VortexBackground = ({ particleCount = 400 }: { particleCount?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const centerX = width / 2;
    const centerY = height / 2;

    const particles: any[] = [];
    
    // Use prop for particle count
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 200 + 50,
        speed: Math.random() * 0.02 + 0.005,
        size: Math.random() * 2 + 0.5,
      });
    }

    const animate = () => {
      // Create trails effect by not fully clearing
      // Need to use globalCompositeOperation carefully or just fill with semi-transparent
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; 
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.angle += p.speed;
        p.radius -= 0.1; // Move inward
        
        if (p.radius < 0) {
            p.radius = Math.random() * 300 + 100;
            p.speed = Math.random() * 0.02 + 0.005;
        }

        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius * 0.6; // Flatten for 3D effect

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.angle * 50}, 70%, 50%)`;
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
    }
    
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [particleCount]); 

  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }} />;
};
