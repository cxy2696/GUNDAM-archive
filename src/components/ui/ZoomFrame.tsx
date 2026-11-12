"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function ZoomFrame({
  children,
  label,
  className = "",
  min = 0.75,
  max = 2.4,
  initial = 1,
  fullscreen = true,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  min?: number;
  max?: number;
  initial?: number;
  fullscreen?: boolean;
}) {
  const [zoom, setZoom] = useState(initial);
  const [full, setFull] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = full ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [full]);

  const step = (delta: number) => setZoom((value) => Math.min(max, Math.max(min, Number((value + delta).toFixed(2)))));

  const frame = (
    <div className={`zoom-frame ${full ? "is-full" : ""} ${className}`.trim()}>
      <div className="zoom-frame__bar">
        {label && <span className="zoom-frame__label">{label}</span>}
        <div className="zoom-frame__keys">
          <button type="button" onClick={() => step(-0.15)} aria-label="Zoom out">−</button>
          <span className="mono">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => step(0.15)} aria-label="Zoom in">＋</button>
          <button type="button" onClick={() => setZoom(initial)} aria-label="Reset zoom">↺</button>
          {fullscreen && (
            <button type="button" onClick={() => setFull((value) => !value)} aria-label={full ? "Exit fullscreen" : "Fullscreen"}>
              {full ? "×" : "⛶"}
            </button>
          )}
        </div>
      </div>
      <div className="zoom-frame__scroll">
        <div className="zoom-frame__scale" style={{ width: `${100 / zoom}%`, transform: `scale(${zoom})` }}>
          {children}
        </div>
      </div>
    </div>
  );

  if (full && mounted) return createPortal(frame, document.body);
  return frame;
}
