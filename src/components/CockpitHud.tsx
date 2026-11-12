"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";

export function CockpitHud({
  dict,
  machineCount,
  eraCount,
}: {
  dict: Dictionary;
  machineCount: number;
  eraCount: number;
}) {
  const [time, setTime] = useState("--:--:--");
  const frame = useRef<number | null>(null);
  const pathname = usePathname();
  const isHome = /\/(zh|ja)\/?$/.test(pathname);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((value) => String(value).padStart(2, "0"))
          .join(":"),
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    const onScroll = () => {
      document.documentElement.dataset.scrolled = window.scrollY > 120 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.scrolled = window.scrollY > 120 ? "true" : "false";
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        root.style.setProperty("--hud-x", `${event.clientX}px`);
        root.style.setProperty("--hud-y", `${event.clientY}px`);
        frame.current = null;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <>
      <div className={`hud-layer ${isHome ? "" : "hud-layer--inner"}`.trim()} aria-hidden="true">
        <span className="hud-corner hud-corner--tl" />
        <span className="hud-corner hud-corner--tr" />
        <span className="hud-corner hud-corner--bl" />
        <span className="hud-corner hud-corner--br" />
        <span className="cockpit-canopy" />
        <span className="cockpit-side cockpit-side--left"><i>MFD-01 / TACTICAL</i></span>
        <span className="cockpit-side cockpit-side--right"><i>MFD-02 / SENSOR</i></span>
        <span className="cockpit-console" />
        <span className="hud-scan" />
        <span className="hud-reticle"><i /></span>
        <div className="hud-rail hud-rail--top">
          <span>GUNDAM ARCHIVE / COCKPIT LINK</span>
          <span>{time} / SYS NOMINAL</span>
        </div>
        <div className="hud-rail hud-rail--bottom">
          <span>MS {String(machineCount).padStart(3, "0")} / ERA {String(eraCount).padStart(2, "0")}</span>
          <span>FCS ONLINE / {dict.common.hudLink}</span>
        </div>
        <div className="hud-side hud-side--left">ORBIT / 00</div>
        <div className="hud-side hud-side--right">FRAME / LOD-P</div>
      </div>

    </>
  );
}
