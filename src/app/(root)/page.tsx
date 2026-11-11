"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    const path = window.location.pathname;
    const base = path.endsWith("/") ? path : path.replace(/[^/]*$/, "");
    window.location.replace(`${base}zh/`);
  }, []);

  return (
    <main className="boot">
      <div className="boot__grid" aria-hidden />
      <div className="boot__center">
        <div className="boot__mark" aria-hidden>
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
            <circle cx="40" cy="40" r="14" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="40" cy="40" rx="32" ry="12" transform="rotate(-28 40 40)" stroke="currentColor" strokeWidth="1" opacity=".65" />
            <circle cx="40" cy="40" r="3" fill="currentColor" />
          </svg>
        </div>
        <p className="micro">GAIA ARCHIVE / INITIALIZING</p>
        <h1>机动战士档案</h1>
        <p className="boot__note">正在进入档案馆…</p>
        <div className="boot__links">
          <a href="zh/">中文</a>
          <span aria-hidden>/</span>
          <a href="ja/">日本語</a>
        </div>
      </div>
    </main>
  );
}
