"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Machine } from "@/lib/schema";
import type { Lang } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { DesignSheet } from "./DesignSheet";
import type { ViewName } from "./MechStage";
import { PART_LABELS, type PartId } from "./model";

const MechStage = dynamic(() => import("./MechStage").then((module) => module.MechStage), {
  ssr: false,
  loading: () => (
    <div className="viewer__canvas-skeleton">
      <span className="micro">LOADING 3D ENGINE</span>
      <i />
    </div>
  ),
});

class ViewerBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const VIEWS: { key: ViewName; label: keyof Dictionary["viewer"] }[] = [
  { key: "front", label: "front" },
  { key: "side", label: "side" },
  { key: "back", label: "back" },
  { key: "top", label: "top" },
  { key: "iso", label: "iso" },
];

export function MechViewer({
  machine,
  lang,
  labels,
  hero = false,
}: {
  machine: Machine;
  lang: Lang;
  labels: Dictionary["viewer"];
  hero?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"3d" | "2d" | "split">("3d");
  const [explode, setExplode] = useState(0);
  const [quantum, setQuantum] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [engineering, setEngineering] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [view, setView] = useState<{ name: ViewName; nonce: number }>({ name: "iso", nonce: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoRotate(false);
    }
  }, []);

  const partLabel = hovered
    ? PART_LABELS[hovered as PartId]?.[lang] ?? hovered
    : null;

  const renderSheet = (compact = false) => (
    <DesignSheet
      machine={machine}
      lang={lang}
      hovered={hovered}
      onHover={setHovered}
      engineering={engineering}
      compact={compact}
    />
  );

  const fallback = (
    <div className="viewer__fallback">
      <p className="micro">WEBGL UNAVAILABLE / STATIC SHEET</p>
      {renderSheet(false)}
    </div>
  );

  const setPreset = (name: ViewName) => {
    setView((current) => ({ name, nonce: current.nonce + 1 }));
    setAutoRotate(false);
  };

  return (
    <div
      className={`viewer ${hero ? "viewer--hero" : ""} viewer--${mode}`}
      data-viewer-ready={ready ? "true" : "false"}
    >
      <div className="viewer__frame" aria-hidden>
        <i className="c tl" />
        <i className="c tr" />
        <i className="c bl" />
        <i className="c br" />
      </div>

      {!hero && (
        <div className="viewer__topbar">
          <div className="viewer__ident">
            <span className="viewer__index">MS / {machine.modelCode}</span>
            <span className="viewer__name">{machine.name[lang]}</span>
          </div>
          <div className="viewer__badges">
            <span>{labels.lodLabel}</span>
            <span>{machine.specs.heightOverall ? `${machine.specs.heightOverall.toFixed(1)} M` : "N/A"}</span>
            <span className="viewer__live">
              <i />
              LIVE
            </span>
          </div>
        </div>
      )}

      <div className="viewer__stage">
        {mounted && mode !== "2d" && (
          <div className="viewer__canvas">
            <ViewerBoundary fallback={fallback}>
              <MechStage
                machine={machine}
                explode={explode}
                quantum={quantum / 100}
                wireframe={wireframe}
                autoRotate={autoRotate}
                view={view.name}
                nonce={view.nonce}
                hovered={hovered}
                onHover={setHovered}
                onReady={() => setReady(true)}
              />
            </ViewerBoundary>
          </div>
        )}

        {mode !== "3d" && <div className="viewer__sheet-wrap">{renderSheet(mode === "split")}</div>}

        {!hero && mode === "3d" && (
          <div className="viewer__hud" aria-hidden>
            <div className="viewer__hud-row">
              <span>{labels.viewLabel}</span>
              <span>FOV 30° / TARGET 09.0</span>
            </div>
            <div className="viewer__reticle">
              <span />
              <span />
            </div>
            <div className="viewer__hud-row viewer__hud-row--bottom">
              <span>U.C. CALIBRATION</span>
              <span>1 UNIT = 1 M</span>
            </div>
          </div>
        )}

        {!hero && mounted && mode !== "2d" && !ready && (
          <div className="viewer__loading">
            <div className="viewer__loading-bar">
              <i />
            </div>
            <p className="micro">{labels.loading}</p>
            <span>PROCEDURAL GEOMETRY / PART GRAPH</span>
          </div>
        )}

        {hovered && partLabel && (
          <div className="viewer__part">
            <span className="viewer__part-dot" />
            <span>{partLabel}</span>
            <span className="viewer__part-id">PART / {hovered.toUpperCase()}</span>
          </div>
        )}

        {!hero && mode === "3d" && (
          <div className="viewer__hint">{labels.dragHint}</div>
        )}

        {hero && (
          <div className="viewer__hero-hint">
            <span>{labels.dragHint}</span>
          </div>
        )}

        <div className="viewer__vignette" aria-hidden />
      </div>

      {!hero && (
        <div className="viewer__console">
          <div className="viewer__console-row">
            <div className="seg" role="group" aria-label={labels.viewLabel}>
              {(["3d", "2d", "split"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={mode === value ? "is-active" : ""}
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                >
                  {value === "3d" ? "3D" : value === "2d" ? labels.design : labels.split}
                </button>
              ))}
            </div>

            <div className="viewer__presets" role="group" aria-label={labels.presets}>
              {VIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={view.name === item.key ? "is-active" : ""}
                  onClick={() => setPreset(item.key)}
                >
                  {labels[item.label]}
                </button>
              ))}
            </div>

            <div className="viewer__toggles">
              <button
                type="button"
                className={autoRotate ? "is-active" : ""}
                onClick={() => setAutoRotate((v) => !v)}
                aria-pressed={autoRotate}
              >
                {labels.autoRotate}
              </button>
              <button
                type="button"
                className={wireframe ? "is-active" : ""}
                onClick={() => setWireframe((v) => !v)}
                aria-pressed={wireframe}
              >
                {labels.wireframe}
              </button>
              {mode !== "3d" && (
                <button
                  type="button"
                  className={engineering ? "is-active" : ""}
                  onClick={() => setEngineering((v) => !v)}
                  aria-pressed={engineering}
                >
                  {labels.engineering}
                </button>
              )}
            </div>
          </div>

          <div className="viewer__console-row viewer__console-row--sliders">
            <label className="slider">
              <span className="slider__head">
                <span>{labels.explode}</span>
                <span className="mono">{String(explode).padStart(3, "0")}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={explode}
                onChange={(event) => setExplode(Number(event.target.value))}
                aria-label={labels.explode}
              />
            </label>
            <label className="slider slider--quantum">
              <span className="slider__head">
                <span>{labels.quantum}</span>
                <span className="mono">{String(quantum).padStart(3, "0")}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={quantum}
                onChange={(event) => setQuantum(Number(event.target.value))}
                aria-label={labels.quantum}
              />
            </label>
            <button type="button" className="viewer__reset" onClick={() => setPreset("iso")}>
              {labels.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
