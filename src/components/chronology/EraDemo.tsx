"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Era, EventRecord, Lang, Machine, Work } from "@/lib/schema";
import type { EraWheelItem } from "./EraWheel3D";
import { ZoomFrame } from "@/components/ui/ZoomFrame";

const EraWheel3D = dynamic(() => import("./EraWheel3D").then((module) => module.EraWheel3D), {
  ssr: false,
  loading: () => <div className="era-wheel__fallback">LOADING 3D ERA WHEEL</div>,
});

export function EraDemo({
  eras,
  machines,
  works,
  events,
  lang,
  dict,
}: {
  eras: Era[];
  machines: Machine[];
  works: Work[];
  events: EventRecord[];
  lang: Lang;
  dict: Dictionary;
}) {
  const items = useMemo<EraWheelItem[]>(
    () =>
      [...eras]
        .sort((a, b) => a.order - b.order)
        .map((era) => ({
          era,
          machines: machines.filter((machine) => machine.eraId === era.id).length,
          events: events.filter((event) => event.eraId === era.id).length,
          works: works.filter((work) => work.eraId === era.id).length,
        })),
    [eras, machines, works, events],
  );
  const [selectedId, setSelectedId] = useState(items[0]?.era.id ?? "uc");
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const selected = items.find((item) => item.era.id === selectedId) ?? items[0];
  const maxMachines = Math.max(1, ...items.map((item) => item.machines));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mapped = params.get("era");
    if (mapped && items.some((item) => item.era.id === mapped)) setSelectedId(mapped);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoRotate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("era", selectedId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [selectedId]);

  if (!selected) return null;
  const era = selected.era;

  return (
    <section className="era-demo" aria-labelledby="era-demo-title">
      <div className="era-demo__head">
        <div>
          <div className="eyebrow">{dict.eraDemo.eyebrow}</div>
          <h2 id="era-demo-title">{dict.eraDemo.title}</h2>
        </div>
        <p>{dict.eraDemo.lead}</p>
      </div>

      <div className="era-demo__body">
        <ZoomFrame label={dict.eraDemo.title} min={0.8} max={2}>
        <div className="era-demo__stage">
          <EraWheel3D
            key={resetKey}
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            lang={lang}
            autoRotate={autoRotate}
          />
          <div className="era-demo__controls">
            <button type="button" className={`chip ${autoRotate ? "is-active" : ""}`} onClick={() => setAutoRotate((value) => !value)}>
              {autoRotate ? dict.eraDemo.stopRotate : dict.eraDemo.rotate}
            </button>
            <button type="button" className="chip" onClick={() => setResetKey((value) => value + 1)}>
              {dict.eraDemo.reset}
            </button>
          </div>
        </div>
        </ZoomFrame>

        <aside className="era-demo__panel" style={{ "--era": era.color } as React.CSSProperties}>
          <div className="era-demo__panel-head">
            <span className="micro">{dict.eraDemo.selected}</span>
            <span className="mono">{String(era.order).padStart(2, "0")} / {String(eras.length).padStart(2, "0")}</span>
          </div>
          <div className="era-demo__code mono">{era.code}</div>
          <h3>{pick(era.name, lang)}</h3>
          <p className="era-demo__summary">{pick(era.summary, lang)}</p>
          <dl className="era-demo__meta">
            <div>
              <dt>{dict.eraDemo.span}</dt>
              <dd className="mono">
                {String(era.span.start).padStart(4, "0")} — {String(era.span.end).padStart(4, "0")}
              </dd>
            </div>
            <div>
              <dt>{dict.eraDemo.window}</dt>
              <dd className="mono">
                {String(era.window.start).padStart(4, "0")} — {String(era.window.end).padStart(4, "0")}
              </dd>
            </div>
          </dl>
          <div className="era-demo__stats">
            <div>
              <b className="mono">{String(selected.machines).padStart(2, "0")}</b>
              <span>{dict.eraDemo.machines}</span>
            </div>
            <div>
              <b className="mono">{String(selected.events).padStart(2, "0")}</b>
              <span>{dict.eraDemo.events}</span>
            </div>
            <div>
              <b className="mono">{String(selected.works).padStart(2, "0")}</b>
              <span>{dict.eraDemo.works}</span>
            </div>
          </div>
          <div className="era-demo__actions">
            <Link href={`/${lang}/timeline?era=${era.id}`} className="text-link">
              {dict.eraDemo.openTimeline} →
            </Link>
            <Link href={`/${lang}/map?era=${era.id}`} className="text-link">
              {dict.eraDemo.openMap} →
            </Link>
          </div>
        </aside>
      </div>

      <div className="era-bars" role="group" aria-label={dict.eraDemo.distribution}>
        <div className="era-bars__head">
          <span className="micro">{dict.eraDemo.distribution}</span>
          <span className="micro">{dict.eraDemo.clickHint}</span>
        </div>
        <div className="era-bars__grid">
          {items.map((item) => (
            <button
              key={item.era.id}
              type="button"
              className={`era-bar ${item.era.id === selectedId ? "is-active" : ""}`}
              style={
                {
                  "--era": item.era.color,
                  "--h": `${Math.max(12, (item.machines / maxMachines) * 100)}%`,
                } as React.CSSProperties
              }
              onClick={() => setSelectedId(item.era.id)}
              aria-pressed={item.era.id === selectedId}
              title={`${item.era.code} ${pick(item.era.name, lang)} · ${item.machines} MS`}
            >
              <span className="era-bar__value mono">{item.machines}</span>
              <span className="era-bar__track">
                <i />
              </span>
              <span className="era-bar__code mono">{item.era.code}</span>
              <span className="era-bar__name">{pick(item.era.name, lang)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
