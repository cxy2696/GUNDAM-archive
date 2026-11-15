"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick, sourceLabel } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import type { Era, EventRecord, Lang } from "@/lib/schema";

const MAX_YEAR = 2400;
const TICKS = Array.from({ length: 25 }, (_, index) => index * 100);

export function CenturyTimeline({
  eras,
  events,
  lang,
  dict,
}: {
  eras: Era[];
  events: EventRecord[];
  lang: Lang;
  dict: Dictionary;
}) {
  const sortedEras = useMemo(() => [...eras].sort((a, b) => a.order - b.order), [eras]);
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.year - b.date.year), [events]);
  const [selectedId, setSelectedId] = useState(sortedEvents[sortedEvents.length - 1]?.id ?? "");
  const selected = sortedEvents.find((event) => event.id === selectedId);
  const selectedEra = selected ? sortedEras.find((era) => era.id === selected.eraId) : undefined;

  const pct = (year: number) => `${Math.max(0, Math.min(100, (year / MAX_YEAR) * 100))}%`;
  const width = (start: number, end: number) =>
    `${Math.max(0.35, ((end - start + 1) / MAX_YEAR) * 100)}%`;

  return (
    <section className="century-timeline" aria-labelledby="century-timeline-title">
      <div className="century-timeline__head">
        <div>
          <div className="eyebrow">TIMELINE / CENTURY AXIS</div>
          <h2 id="century-timeline-title">{dict.chronology.sharedTimeline}</h2>
        </div>
        <p>{dict.chronology.sharedTimelineLead}</p>
      </div>

      <div className="century-timeline__scroll">
        <div className="century-timeline__canvas">
          <div className="ct-axis" aria-hidden>
            <span className="ct-axis__label">{dict.chronology.century}</span>
            <div className="ct-axis__track">
              {TICKS.map((year) => (
                <span key={year} className="ct-axis__tick" style={{ left: pct(year) }}>
                  <i />
                  <b className="mono">{String(year).padStart(4, "0")}</b>
                </span>
              ))}
            </div>
          </div>

          <div className="ct-rows">
            {sortedEras.map((era) => {
              const eraEvents = sortedEvents.filter((event) => event.eraId === era.id);
              return (
                <div key={era.id} className="ct-row" style={{ "--era": era.color } as React.CSSProperties}>
                  <button
                    type="button"
                    className="ct-era"
                    onClick={() => eraEvents[0] && setSelectedId(eraEvents[eraEvents.length - 1].id)}
                    title={pick(era.name, lang)}
                  >
                    <span className="mono">{era.code}</span>
                    <b>{pick(era.name, lang)}</b>
                    <em className="mono">{String(eraEvents.length).padStart(2, "0")}</em>
                  </button>
                  <div className="ct-track">
                    <span
                      className="ct-band"
                      style={{ left: pct(era.span.start), width: width(era.span.start, era.span.end) }}
                      aria-hidden
                    />
                    {eraEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`ct-event ${event.id === selectedId ? "is-active" : ""}`}
                        style={{ left: pct(event.date.year) }}
                        onClick={() => setSelectedId(event.id)}
                        title={`${era.code} ${formatStoryDate(event.date, era.code, lang)} · ${pick(event.title, lang)}`}
                        aria-label={`${pick(event.title, lang)} — ${formatStoryDate(event.date, era.code, lang)}`}
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="century-timeline__detail" aria-live="polite">
        {selected && selectedEra ? (
          <>
            <div className="ct-detail__head">
              <div>
                <span className="micro">{selectedEra.code} / {formatStoryDate(selected.date, selectedEra.code, lang)}</span>
                <h3>{pick(selected.title, lang)}</h3>
              </div>
              <Link href={`/${lang}/events/${selected.id}`} className="text-link">
                {dict.common.open} →
              </Link>
            </div>
            <p>{pick(selected.summary, lang)}</p>
            <div className="ct-detail__sources">
              <span className="micro">{dict.chronology.eventSources} · {selected.sources.length} {dict.chronology.sourceCount}</span>
              <ul>
                {selected.sources.map((source) => (
                  <li key={`${source.label}-${source.level}`}>
                    <span className={`source-level source-level--${source.level}`}>{source.level}</span>
                    <span>{sourceLabel(source, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="ct-detail__empty">{dict.chronology.selectEvent}</p>
        )}
      </div>
    </section>
  );
}
