"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Character, Era, EventRecord, Faction, Lang, Machine, Place } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { dateFraction, formatStoryDate } from "@/lib/format";

type TickMode = "year" | "decade" | "century";

function domainFor(era: Era, fullHistory: boolean): [number, number] {
  if (era.id === "uc" && fullHistory) return [era.span.start, era.span.end];
  return [era.window.start, era.window.end];
}

function tickStep(domain: [number, number], mode: TickMode): number {
  const span = domain[1] - domain[0];
  let step = mode === "year" ? 1 : mode === "decade" ? 5 : 20;
  while (span / step > 13) step *= 2;
  while (span / step < 2 && step > 1) step = Math.ceil(step / 2);
  return step;
}

function ticksFor(domain: [number, number], step: number): number[] {
  const out: number[] = [domain[0]];
  const start = Math.ceil(domain[0] / step) * step;
  for (let value = start; value <= domain[1]; value += step) {
    if (value === domain[0]) continue;
    if (value - domain[0] < step * 0.7) continue;
    out.push(value);
  }
  return out;
}

function eraEventRows(events: EventRecord[], domain: [number, number]) {
  const sorted = [...events].sort((a, b) => dateFraction(a.date) - dateFraction(b.date));
  const rowEnds: number[] = [];
  return sorted.map((event) => {
    const left = ((dateFraction(event.date) - domain[0]) / (domain[1] - domain[0])) * 100;
    let row = rowEnds.findIndex((end) => left > end + 7.5);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(left);
    } else {
      rowEnds[row] = left;
    }
    return { event, left, row };
  });
}

export function TimelineExplorer({
  eras,
  events,
  places,
  machines,
  characters,
  factions,
  lang,
  dict,
}: {
  eras: Era[];
  events: EventRecord[];
  places: Place[];
  machines: Machine[];
  characters: Character[];
  factions: Faction[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [mainlineOnly, setMainlineOnly] = useState(false);
  const [tickMode, setTickMode] = useState<TickMode>("year");
  const [fullHistory, setFullHistory] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusEra, setFocusEra] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("e");
    if (eventId && events.some((event) => event.id === eventId)) setSelectedId(eventId);
    const era = params.get("era");
    if (era && eras.some((item) => item.id === era)) setFocusEra(era);
  }, [events, eras]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!focusEra) return;
    const node = document.getElementById(`lane-${focusEra}`);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusEra]);

  useEffect(() => {
    if (!selectedId) return;
    const ordered = events
      .filter((event) => (mainlineOnly ? event.mainline : true))
      .filter((event) => (focusEra ? event.eraId === focusEra : true))
      .sort((a, b) => dateFraction(a.date) - dateFraction(b.date));
    const current = ordered.findIndex((event) => event.id === selectedId);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === "ArrowRight" ? ordered[current + 1] : ordered[current - 1];
      if (next) setSelectedId(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, events, mainlineOnly, focusEra]);

  const selected = events.find((event) => event.id === selectedId) ?? null;
  const visible = events.filter((event) => (mainlineOnly ? event.mainline : true));

  const selectedEra = selected ? eras.find((era) => era.id === selected.eraId) : null;
  const selectedPlace = selected?.placeId ? places.find((place) => place.id === selected.placeId) : null;
  const selectedMachines = selected?.machineIds
    .map((id) => machines.find((machine) => machine.id === id))
    .filter((machine): machine is Machine => Boolean(machine)) ?? [];
  const selectedCharacters = selected?.characterIds
    .map((id) => characters.find((character) => character.id === id))
    .filter((character): character is Character => Boolean(character)) ?? [];
  const selectedFactions = selected?.factionIds
    .map((id) => factions.find((faction) => faction.id === id))
    .filter((faction): faction is Faction => Boolean(faction)) ?? [];

  const laneData = useMemo(
    () =>
      eras.map((era) => {
        const domain = domainFor(era, fullHistory);
        const eraEvents = visible.filter((event) => event.eraId === era.id);
        const rows = eraEventRows(eraEvents, domain);
        const maxRow = rows.reduce((max, row) => Math.max(max, row.row), 0);
        return {
          era,
          domain,
          rows,
          height: Math.max(126, 66 + (maxRow + 1) * 32),
          step: tickStep(domain, tickMode),
        };
      }),
    [eras, visible, fullHistory, tickMode],
  );

  return (
    <div className="timeline-page container">
      <div className="tl-controls">
        <div className="tl-controls__left">
          <button
            type="button"
            className={`chip ${mainlineOnly ? "is-active" : ""}`}
            onClick={() => setMainlineOnly((value) => !value)}
            aria-pressed={mainlineOnly}
          >
            {dict.timeline.mainlineOnly}
          </button>
          <span className="micro">{visible.length} / {events.length} EVENTS</span>
        </div>
        <div className="tl-controls__right">
          <div className="seg">
            {(["year", "decade", "century"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={tickMode === mode ? "is-active" : ""}
                onClick={() => setTickMode(mode)}
              >
                {dict.timeline[mode]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`chip ${fullHistory ? "is-active" : ""}`}
            onClick={() => setFullHistory((value) => !value)}
            aria-pressed={fullHistory}
          >
            {fullHistory ? dict.timeline.fullHistory : dict.timeline.focusWindow}
          </button>
        </div>
      </div>

      <div className="tl-era-rail" role="group" aria-label={dict.chronology.title}>
        <button
          type="button"
          className={`tl-era-chip ${!focusEra ? "is-active" : ""}`}
          onClick={() => setFocusEra(null)}
        >
          <span className="mono">ALL</span>
          <b>{dict.timeline.allEvents}</b>
        </button>
        {eras.map((era) => (
          <button
            key={era.id}
            type="button"
            className={`tl-era-chip ${focusEra === era.id ? "is-active" : ""}`}
            style={{ "--era": era.color } as React.CSSProperties}
            onClick={() => setFocusEra(focusEra === era.id ? null : era.id)}
          >
            <span className="mono">{era.code}</span>
            <b>{pick(era.name, lang)}</b>
            <span className="mono">{String(visible.filter((event) => event.eraId === era.id).length).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className={`tl-lanes ${focusEra ? "has-focus" : ""}`}>
        {laneData.map(({ era, domain, rows, height, step }) => {
          const ticks = ticksFor(domain, step);
          return (
            <section
              key={era.id}
              id={`lane-${era.id}`}
              className={`tl-lane ${focusEra === era.id ? "is-focus" : ""}`}
              style={{ "--era": era.color } as React.CSSProperties}
            >
              <header className="tl-head">
                <div className="tl-head__top">
                  <span className="tl-head__code mono">{era.code}</span>
                  <span className={`tag ${era.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>
                    {era.canon === "mainline" ? dict.timeline.mainline : dict.timeline.parallel}
                  </span>
                </div>
                <h2>{pick(era.name, lang)}</h2>
                <div className="tl-head__meta mono">
                  {String(domain[0]).padStart(4, "0")} — {String(domain[1]).padStart(4, "0")}
                </div>
                <p>{pick(era.summary, lang)}</p>
                <span className="tl-head__count mono">{String(rows.length).padStart(2, "0")} EVENTS / LOCAL SCALE</span>
              </header>

              <div className="tl-track" style={{ minHeight: height }}>
                <div className="tl-grid" aria-hidden>
                  {ticks.map((tick) => (
                    <span
                      key={tick}
                      className="tl-tick"
                      style={{ left: `${((tick - domain[0]) / (domain[1] - domain[0])) * 100}%` }}
                    >
                      <i />
                    </span>
                  ))}
                </div>

                {rows.map(({ event, left, row }) => {
                  const end = event.endDate ? dateFraction(event.endDate) : null;
                  const width = end ? Math.max(0.5, ((end - dateFraction(event.date)) / (domain[1] - domain[0])) * 100) : 0;
                  const isSelected = selectedId === event.id;
                  return (
                    <div key={event.id} className="tl-event-wrap">
                      {end && (
                        <span
                          className="tl-span"
                          style={{ left: `${left}%`, width: `${width}%`, top: 18 }}
                          aria-hidden
                        />
                      )}
                      <button
                        type="button"
                        className={`tl-event tl-event--${event.scale} ${isSelected ? "is-selected" : ""}`}
                        style={{ left: `${Math.min(96, Math.max(4, left))}%`, top: 28 + row * 32 }}
                        onClick={() => setSelectedId(event.id)}
                        aria-expanded={isSelected}
                      >
                        <span className="tl-event__dot" />
                        <span className="tl-event__label">{pick(event.title, lang)}</span>
                        <span className="tl-event__date mono">
                          {String(event.date.year).padStart(4, "0")}
                          {event.date.month ? `.${String(event.date.month).padStart(2, "0")}` : ""}
                        </span>
                      </button>
                    </div>
                  );
                })}

                <div className="tl-axis" aria-hidden>
                  {ticks.map((tick) => (
                    <span
                      key={tick}
                      className="tl-axis__label mono"
                      style={{ left: `${((tick - domain[0]) / (domain[1] - domain[0])) * 100}%` }}
                    >
                      {String(tick).padStart(4, "0")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mobile gets a vertical, collision-free event list instead of
                  squeezing a 1,000-year axis into 360px. */}
              <div className="tl-mobile" aria-label={`${pick(era.name, lang)} events`}>
                {[...rows]
                  .sort((a, b) => a.left - b.left)
                  .map(({ event }) => (
                    <button
                      key={event.id}
                      type="button"
                      className={`tl-mobile__event tl-mobile__event--${event.scale} ${selectedId === event.id ? "is-selected" : ""}`}
                      onClick={() => setSelectedId(event.id)}
                      aria-expanded={selectedId === event.id}
                    >
                      <span className="tl-mobile__date mono">
                        {String(event.date.year).padStart(4, "0")}
                        {event.date.month ? `.${String(event.date.month).padStart(2, "0")}` : ""}
                      </span>
                      <span className="tl-mobile__body">
                        <b>{pick(event.title, lang)}</b>
                        <span className="micro">{event.scale.toUpperCase()}</span>
                      </span>
                      <span aria-hidden>→</span>
                    </button>
                  ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="tl-note">
        <span className="micro">NOTE</span>
        <p>{dict.timeline.lead}</p>
      </div>

      <div className={`tl-drawer-layer ${selected ? "is-open" : ""}`} aria-hidden={!selected}>
        <button
          type="button"
          className="tl-backdrop"
          onClick={() => setSelectedId(null)}
          aria-label={dict.timeline.close}
          tabIndex={selected ? 0 : -1}
        />
        {selected && (
          <aside className="tl-drawer" role="dialog" aria-modal="true" aria-label={dict.timeline.eventDetail}>
            <div className="tl-drawer__head">
              <div>
                <span className="micro">
                  {selectedEra?.code} / {dict.timeline[selected.scale === "era" ? "scaleEra" : selected.scale === "battle" ? "scaleBattle" : "scaleIncident"]}
                </span>
                <h2>{pick(selected.title, lang)}</h2>
                <span className="mono tl-drawer__date">
                  {selectedEra && formatStoryDate(selected.date, selectedEra.code, lang)}
                  {selected.endDate && selectedEra ? ` — ${formatStoryDate(selected.endDate, selectedEra.code, lang)}` : ""}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} aria-label={dict.timeline.close}>
                ×
              </button>
            </div>
            <div className="tl-drawer__body">
              <p className="tl-drawer__summary">{pick(selected.summary, lang)}</p>

              <div className="tl-drawer__block">
                <span className="micro">{dict.timeline.eventCourse}</span>
                {selected.detail[lang].map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="tl-drawer__detail">{paragraph}</p>
                ))}
              </div>

              <div className="tl-drawer__block">
                <span className="micro">{dict.timeline.outcome}</span>
                <p>{pick(selected.outcome, lang)}</p>
              </div>

              <Link href={`/${lang}/events/${selected.id}`} className="btn btn--sm tl-drawer__record">
                {dict.timeline.openRecord} →
              </Link>

              {selectedPlace && (
                <div className="tl-drawer__row">
                  <span className="micro">{dict.timeline.place}</span>
                  <span>{pick(selectedPlace.name, lang)}</span>
                </div>
              )}

              {selectedFactions.length > 0 && (
                <div className="tl-drawer__block">
                  <span className="micro">{dict.timeline.participants}</span>
                  <div className="tag-row">
                    {selectedFactions.map((faction) => (
                      <Link key={faction.id} href={`/${lang}/factions/${faction.id}`} className="tag">
                        {pick(faction.name, lang)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {selectedMachines.length > 0 && (
                <div className="tl-drawer__block">
                  <span className="micro">{dict.timeline.relatedMachines}</span>
                  <div className="tl-drawer__list">
                    {selectedMachines.map((machine) => (
                      <Link key={machine.id} href={`/${lang}/machines/${machine.id}`} className="tl-drawer__item">
                        <span className="mono">{machine.modelCode}</span>
                        <b>{pick(machine.name, lang)}</b>
                        <span aria-hidden>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {selectedCharacters.length > 0 && (
                <div className="tl-drawer__block">
                  <span className="micro">{dict.timeline.relatedCharacters}</span>
                  <div className="tl-drawer__list">
                    {selectedCharacters.map((character) => (
                      <Link key={character.id} href={`/${lang}/characters/${character.id}`} className="tl-drawer__item">
                        <b>{pick(character.name, lang)}</b>
                        <span>{pick(character.role, lang)}</span>
                        <span aria-hidden>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="tl-drawer__sources">
                <span className="micro">{dict.common.source}</span>
                {selected.sources.map((source) => (
                  <span key={source.label} className="tl-source">
                    <b>{source.level}</b> {source.label}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
