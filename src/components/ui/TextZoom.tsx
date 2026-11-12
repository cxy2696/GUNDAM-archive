"use client";

import { useState, type ReactNode } from "react";

export function TextZoom({
  children,
  label,
  initial = 1,
}: {
  children: ReactNode;
  label?: string;
  initial?: number;
}) {
  const [scale, setScale] = useState(initial);
  return (
    <div className="text-zoom" style={{ "--text-zoom": scale } as React.CSSProperties}>
      <div className="text-zoom__bar">
        {label && <span>{label}</span>}
        <div>
          <button type="button" onClick={() => setScale((value) => Math.max(0.85, Number((value - 0.1).toFixed(2))))} aria-label="Smaller text">A−</button>
          <span className="mono">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((value) => Math.min(1.7, Number((value + 0.1).toFixed(2))))} aria-label="Larger text">A＋</button>
          <button type="button" onClick={() => setScale(initial)} aria-label="Reset text size">↺</button>
        </div>
      </div>
      {children}
    </div>
  );
}
