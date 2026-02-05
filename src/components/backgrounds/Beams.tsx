"use client";
import React, { useEffect, useRef } from "react";

export const AnimatedBeamsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Beam {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = Math.random() * 100 + 50;
        this.speed = Math.random() * 5 + 2;
        this.angle = -Math.PI / 4; // Diagonal movement
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Reset if off screen
        if (this.x < -100 || this.y < -100) {
            this.x = width + Math.random() * 200;
            this.y = Math.random() * height * 1.5;
        }
      }

      draw() {
        if(!ctx) return;
        const endX = this.x - Math.cos(this.angle) * this.length;
        const endY = this.y - Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    const beams: Beam[] = Array.from({ length: 20 }, () => new Beam());

    const animate = () => {
      ctx.clearRect(0, 0, width, height); // Clear for transparency
      // If we want trails, we need to fill with semi-transparent, but that affects underlying content visibility
      // For overlay background, clearRect is safer. 
      // To simulate trails without clearing everything, we can manage it differently, but for now clearRect.
      
      beams.forEach(beam => {
        beam.update();
        beam.draw();
      });
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
