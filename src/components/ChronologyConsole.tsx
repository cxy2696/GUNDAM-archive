"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Era, EventRecord, Lang, Machine, Work } from "@/lib/schema";

const pad = (value: number, length = 4) => String(value).padStart(length, "0");

export function ChronologyConsole({
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
  const [selectedId, setSelectedId] = useState(eras[0]?.id ?? "");
  const selected = eras.find((era) => era.id === selectedId) ?? eras[0];
  if (!selected) return null;

  const eraMachines = machines
    .filter((machine) => machine.eraId === selected.id)
    .sort((a, b) => a.firstAppear.year - b.firstAppear.year || a.modelCode.localeCompare(b.modelCode));
  const eraWorks = works
    .filter((work) => work.eraId === selected.id)
    .sort((a, b) => a.year - b.year);
  const eraEvents = events
    .filter((event) => event.eraId === selected.id)
    .sort((a, b) => a.date.year - b.date.year || (a.date.month ?? 0) - (b.date.month ?? 0));
  const index = eras.findIndex((era) => era.id === selected.id);

  return (
    <section className="chrono-console" aria-labelledby="chrono-console-title">
      <div className="chrono-console__top">
        <span className="micro">TACTICAL / ERA SELECT</span>
        <span className="mono">SYS / CHRONOLOGY / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="chrono-console__grid">
        <div className="chrono-console__list" role="tablist" aria-label={dict.chronology.title}>
          {eras.map((era, i) => (
            <button
              key={era.id}
              type="button"
              role="tab"
              aria-selected={era.id === selected.id}
              className={`chrono-console__tab ${era.id === selected.id ? "is-active" : ""}`}
              style={{ "--era": era.color } as React.CSSProperties}
              onClick={() => setSelectedId(era.id)}
            >
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="mono chrono-console__code">{era.code}</span>
              <b>{pick(era.name, lang)}</b>
            </button>
          ))}
        </div>

        <div className="chrono-console__screen" style={{ "--era": selected.color } as React.CSSProperties}>
          <div className="chrono-console__screen-head">
            <span className="mono">{selected.code} / ERA {String(index + 1).padStart(2, "0")}</span>
            <span className="mono chrono-console__signal">● LINK STABLE</span>
          </div>
          <h2 id="chrono-console-title">{pick(selected.name, lang)}</h2>
          <div className="chrono-console__years mono">
            {pad(selected.span.start)} — {pad(selected.span.end)}
            <span>{dict.chronology.colWindow} {pad(selected.window.start)} — {pad(selected.window.end)}</span>
          </div>
          <p className="chrono-console__summary">{pick(selected.summary, lang)}</p>
          <div className="chrono-console__stats">
            <div><span>{dict.chronology.colMachines}</span><b className="mono">{String(eraMachines.length).padStart(2, "0")}</b></div>
            <div><span>{dict.chronology.colWorks}</span><b className="mono">{String(eraWorks.length).padStart(2, "0")}</b></div>
            <div><span>{dict.chronology.colEvents}</span><b className="mono">{String(eraEvents.length).padStart(2, "0")}</b></div>
          </div>
          <div className="chrono-console__columns">
            <div>
              <span className="micro">{dict.chronology.rosterTitle}</span>
              <div className="chrono-console__links">
                {eraMachines.slice(0, 5).map((machine) => (
                  <Link key={machine.id} href={`/${lang}/machines/${machine.id}`}>
                    <span className="mono">{machine.modelCode}</span>
                    <b>{pick(machine.name, lang)}</b>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <span className="micro">{dict.chronology.works}</span>
              <div className="chrono-console__links">
                {eraWorks.slice(0, 5).map((work) => (
                  <Link key={work.id} href={`/${lang}/archive#works`}>
                    <span className="mono">{work.year}</span>
                    <b>{pick(work.title, lang)}</b>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="chrono-console__actions">
            <Link href={`/${lang}/timeline?era=${selected.id}`} className="btn btn--sm">
              {dict.nav.timeline} →
            </Link>
            <Link href={`/${lang}/chronology#roster-title`} className="text-link">
              {dict.chronology.rosterTitle} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
