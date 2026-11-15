"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  drift: number;
  color: string;
};

/** Lightweight 2D starfield behind the cockpit; no WebGL context cost. */
export function SpaceBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let raf = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const stars: Star[] = [];

    const seed = (index: number) => {
      const x = Math.sin(index * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length === 0) {
        for (let i = 0; i < 520; i += 1) {
          const z = 0.2 + seed(i + 21) * 0.8;
          stars.push({
            x: seed(i) * width,
            y: seed(i + 9) * height,
            z,
            r: 0.6 + seed(i + 3) * 1.6,
            phase: seed(i + 5) * Math.PI * 2,
            drift: 0.008 + seed(i + 7) * 0.025,
            color: i % 11 === 0 ? "#d8ff63" : i % 4 === 0 ? "#b8ffd2" : "#eafff0",
          });
        }
      }
    };

    const draw = (time: number) => {
      frame += 1;
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      context.clearRect(0, 0, width, height);

      // faint galactic band
      const band = context.createLinearGradient(0, height * 0.1, width, height * 0.9);
      band.addColorStop(0, "rgba(88,255,157,0.025)");
      band.addColorStop(0.46, "rgba(150,255,190,0.06)");
      band.addColorStop(1, "rgba(88,255,157,0.012)");
      context.fillStyle = band;
      context.beginPath();
      context.ellipse(width * 0.58, height * 0.42, width * 0.72, height * 0.16, -0.28, 0, Math.PI * 2);
      context.fill();

      for (const star of stars) {
        const twinkle = reduced ? 0.7 : 0.45 + Math.sin(time * 0.0012 + star.phase) * 0.3;
        const px = (star.x + pointerX * star.z * 14 + Math.sin(time * 0.00003 + star.phase) * 2) % width;
        const py = (star.y + pointerY * star.z * 9 + Math.cos(time * 0.00004 + star.phase) * 1.6) % height;
        context.globalAlpha = twinkle * (0.55 + star.z * 0.45);
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(px, py, star.r, 0, Math.PI * 2);
        context.fill();
        if (star.r > 1.1 && !reduced) {
          context.globalAlpha = twinkle * 0.12;
          context.beginPath();
          context.arc(px, py, star.r * 5, 0, Math.PI * 2);
          context.fill();
        }
      }

      // occasional shooting streak
      if (!reduced && frame % 420 < 48) {
        const t = (frame % 420) / 48;
        const sx = width * 0.12 + t * width * 0.72;
        const sy = height * 0.12 + t * height * 0.24;
        const streak = context.createLinearGradient(sx - 90, sy - 30, sx, sy);
        streak.addColorStop(0, "rgba(88,255,157,0)");
        streak.addColorStop(1, "rgba(200,255,215,0.7)");
        context.globalAlpha = 0.55;
        context.strokeStyle = streak;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(sx - 90, sy - 30);
        context.lineTo(sx, sy);
        context.stroke();
      }
      context.globalAlpha = 1;
      raf = window.requestAnimationFrame(draw);
    };

    const onPointer = (event: PointerEvent) => {
      targetX = (event.clientX / width - 0.5) * 2;
      targetY = (event.clientY / height - 0.5) * 2;
    };

    resize();
    raf = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="space-backdrop" aria-hidden="true" />;
}
