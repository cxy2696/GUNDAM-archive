"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

type HudMode = "on" | "off";
type ReadMode = "std" | "lg";

export function HudControls({
  lang,
  dict,
  className = "",
}: {
  lang: Lang;
  dict: Dictionary;
  className?: string;
}) {
  const [hud, setHud] = useState<HudMode>("on");
  const [read, setRead] = useState<ReadMode>("std");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setHud(root.dataset.hud === "off" ? "off" : "on");
      setRead(root.dataset.read === "lg" ? "lg" : "std");
    };
    sync();
    window.addEventListener("gundam:hud", sync);
    window.addEventListener("gundam:read", sync);
    return () => {
      window.removeEventListener("gundam:hud", sync);
      window.removeEventListener("gundam:read", sync);
    };
  }, []);

  const toggleHud = () => {
    const next: HudMode = hud === "on" ? "off" : "on";
    document.documentElement.dataset.hud = next;
    try {
      localStorage.setItem("gundam-hud", next);
    } catch {
      /* private mode */
    }
    setHud(next);
    window.dispatchEvent(new Event("gundam:hud"));
  };

  const toggleRead = () => {
    const next: ReadMode = read === "lg" ? "std" : "lg";
    document.documentElement.dataset.read = next;
    try {
      localStorage.setItem("gundam-read", next);
    } catch {
      /* private mode */
    }
    setRead(next);
    window.dispatchEvent(new Event("gundam:read"));
  };

  return (
    <div className={`hud-inline ${className}`.trim()} role="group" aria-label={dict.common.hud}>
      <button
        type="button"
        className={`hud-inline__btn ${hud === "on" ? "is-active" : ""}`}
        onClick={toggleHud}
        aria-pressed={hud === "on"}
        aria-label={hud === "on" ? dict.common.hudOff : dict.common.hudOn}
        title={hud === "on" ? dict.common.hudOff : dict.common.hudOn}
      >
        <span className="hud-inline__dot" />
        HUD
      </button>
      <button
        type="button"
        className={`hud-inline__btn ${read === "lg" ? "is-active" : ""}`}
        onClick={toggleRead}
        aria-pressed={read === "lg"}
        aria-label={read === "lg" ? dict.common.readingStandard : dict.common.readingLarge}
        title={read === "lg" ? dict.common.readingStandard : dict.common.readingLarge}
      >
        {read === "lg" ? "A−" : "A+"}
      </button>
    </div>
  );
}
