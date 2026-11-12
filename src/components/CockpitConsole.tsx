"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

export type ConsoleEra = {
  id: string;
  code: string;
  name: { zh: string; ja: string };
  color: string;
  span: { start: number; end: number };
  machineCount: number;
  eventCount: number;
};

export type ConsoleTarget = {
  kind: string;
  label: string;
  meta: string;
  href: string;
};

export function CockpitConsole({
  eras,
  targets,
  totals,
  lang,
  dict,
}: {
  eras: ConsoleEra[];
  targets: ConsoleTarget[];
  totals: { machines: number; events: number; factions: number; tags: number };
  lang: Lang;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [eraId, setEraId] = useState(eras[0]?.id ?? "uc");
  const [clock, setClock] = useState("--:--:--");
  const era = eras.find((item) => item.id === eraId) ?? eras[0];
  const index = eras.findIndex((item) => item.id === eraId);
  const maxEvents = useMemo(() => Math.max(1, ...eras.map((item) => item.eventCount)), [eras]);

  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.dataset.console = "hidden";
      root.style.setProperty("--console-h", "0px");
    } else {
      root.dataset.console = "open";
      root.style.removeProperty("--console-h");
    }
  }, [hidden]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map((value) => String(value).padStart(2, "0"))
          .join(":"),
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!era) return null;

  const step = (delta: number) => {
    const next = (index + delta + eras.length) % eras.length;
    setEraId(eras[next].id);
  };

  return (
    <>
      <button
        type="button"
        className="console-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="cockpit-console"
      >
        <span aria-hidden>▤</span>
        {open ? dict.cockpit.collapse : dict.cockpit.expand}
      </button>

      <aside
        id="cockpit-console"
        className={`console ${open ? "is-open" : ""}`}
        aria-label={dict.cockpit.console}
      >
        <button type="button" className="console-close" onClick={() => setOpen(false)} aria-label={dict.cockpit.collapse}>
          ×
        </button>
        <button type="button" className="console-hide" onClick={() => setHidden(true)}>
          {lang === "zh" ? "收起" : lang === "ja" ? "収納" : "Hide"} <span aria-hidden>▾</span>
        </button>
        <section className="console-card">
          <div className="console-card__inner">
            <div className="console-card__head">
              <span>{dict.cockpit.consoleEra}</span>
              <b>
                {String(index + 1).padStart(2, "0")} / {String(eras.length).padStart(2, "0")}
              </b>
            </div>
            <div className="console-era" style={{ "--era": era.color } as React.CSSProperties}>
              <span className="console-era__badge mono">{era.code}</span>
              <span className="console-era__copy">
                <b>{pick(era.name, lang)}</b>
                <span className="mono">
                  {String(era.span.start).padStart(4, "0")}–{String(era.span.end).padStart(4, "0")} ·{" "}
                  {era.machineCount} MS / {era.eventCount} EV
                </span>
              </span>
              <span className="console-era__nav">
                <button type="button" className="console-key" onClick={() => step(-1)} aria-label={dict.cockpit.eraPrev}>
                  ‹
                </button>
                <button type="button" className="console-key" onClick={() => step(1)} aria-label={dict.cockpit.eraNext}>
                  ›
                </button>
              </span>
            </div>
            <Link href={`/${lang}/chronology?era=${era.id}`} className="console-open">
              {dict.cockpit.openChronology} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="console-card console-card--signal">
          <div className="console-card__inner">
            <div className="console-card__head">
              <span>{dict.cockpit.consoleSignal}</span>
              <b>{totals.events} EVENTS</b>
            </div>
            <div className="console-signal" role="group" aria-label={dict.cockpit.consoleSignal}>
              {eras.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${item.id === eraId ? "is-active" : ""}`}
                  style={
                    {
                      "--era": item.color,
                      "--h": `${Math.max(8, (item.eventCount / maxEvents) * 100)}%`,
                    } as React.CSSProperties
                  }
                  onClick={() => setEraId(item.id)}
                  aria-label={`${item.code} ${pick(item.name, lang)} · ${item.eventCount}`}
                  title={`${item.code} · ${pick(item.name, lang)} · ${item.eventCount}`}
                />
              ))}
            </div>
            <div className="console-signal__labels mono" aria-hidden>
              <span>{eras[0]?.code}</span>
              <span>U.C. → A.A.</span>
              <span>{eras[eras.length - 1]?.code}</span>
            </div>
          </div>
        </section>

        <section className="console-card console-card--targets">
          <div className="console-card__inner">
            <div className="console-card__head">
              <span>{dict.cockpit.consoleTargets}</span>
              <b>{dict.cockpit.online}</b>
            </div>
            <div className="console-targets">
              {targets.map((target) => (
                <Link key={target.href} href={target.href} className="console-target">
                  <span>{target.kind}</span>
                  <b>{target.label}</b>
                  <span>{target.meta}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="console-card console-card--aux">
          <div className="console-card__inner">
            <div className="console-card__head">
              <span>{dict.cockpit.consoleAux}</span>
              <b>AUX</b>
            </div>
            <div className="console-aux">
              <div className="console-aux__clock mono">{clock}</div>
              <div className="console-aux__meta">
                <span>MS {String(totals.machines).padStart(3, "0")}</span>
                <span>FAC {String(totals.factions).padStart(2, "0")}</span>
                <span>TAG {String(totals.tags).padStart(2, "0")}</span>
              </div>
              <div className="console-aux__grid">
                <button
                  type="button"
                  className="console-key"
                  onClick={() => window.dispatchEvent(new Event("gundam:search"))}
                  aria-label={dict.common.search}
                >
                  ⌕
                </button>
                <button
                  type="button"
                  className="console-key"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  aria-label={dict.footer.backTop}
                >
                  ↑
                </button>
                <Link href={`/${lang}/map`} className="console-key" aria-label={dict.cockpit.openMap}>
                  ◍
                </Link>
                <Link href={`/${lang}/glossary`} className="console-key" aria-label={dict.nav.glossary}>
                  ⌗
                </Link>
              </div>
            </div>
          </div>
        </section>
      </aside>
      <button type="button" className="console-restore" onClick={() => setHidden(false)}>
        <span aria-hidden>▤</span> {dict.cockpit.console}
      </button>
    </>
  );
}
