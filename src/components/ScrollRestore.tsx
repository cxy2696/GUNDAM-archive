"use client";

import { useEffect } from "react";

/** Restores the scroll position saved by LanguageSwitch. */
export function ScrollRestore() {
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gaia:scroll");
      if (!saved) return;
      sessionStorage.removeItem("gaia:scroll");
      const y = Number(saved);
      if (!Number.isFinite(y) || y <= 0) return;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
    } catch {
      /* private mode */
    }
  }, []);
  return null;
}
