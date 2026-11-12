"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Era, EventRecord, Faction, Lang, Machine } from "@/lib/schema";
import { formatStoryDate } from "@/lib/format";

const CX = 320;
const CY = 320;
const R = 232;

export function EraFactionMap({
  era,
  factions,
  events,
  machines,
  lang,
  dict,
}: {
  era: Era;
  factions: Faction[];
  events: EventRecord[];
  machines: Machine[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [selectedId, setSelectedId] = useState(factions[0]?.id ?? "");
  useEffect(() => {
    setSelectedId(factions[0]?.id ?? "");
  }, [era.id, factions]);

  const selected = factions.find((faction) => faction.id === selectedId) ?? factions[0];
  const eraEvents = useMemo(
    () => events.filter((event) => event.eraId === era.id).sort((a, b) => a.date.year - b.date.year),
    [events, era.id],
  );
  const nodes = factions.map((faction, index) => {
    const angle = (-90 + (360 / Math.max(1, factions.length)) * index) * (Math.PI / 180);
    return {
      faction,
      x: CX + Math.cos(angle) * R,
      y: CY + Math.sin(angle) * R * 0.82,
      machineCount: machines.filter((machine) => machine.factionId === faction.id).length,
      eventCount: eraEvents.filter((event) => event.factionIds.includes(faction.id)).length,
    };
  });
  const selectedMachines = selected
    ? machines.filter((machine) => machine.factionId === selected.id).slice(0, 6)
    : [];
  const selectedEvents = selected
    ? eraEvents.filter((event) => event.factionIds.includes(selected.id)).slice(0, 5)
    : [];

  if (!selected) return null;

  return (
    <div className="era-map">
      <div className="era-map__frame">
        <div className="map-frame__top">
          <span className="micro">{era.code} / STRATEGIC OVERVIEW</span>
          <span className="mono">NON-GEOGRAPHIC / SCHEMATIC</span>
        </div>
        <svg viewBox="0 0 640 640" className="map-svg" role="img" aria-label={`${pick(era.name, lang)} ${dict.map.title}`}>
          <defs>
            <radialGradient id={`era-fill-${era.id}`} cx="42%" cy="38%" r="68%">
              <stop offset="0%" stopColor="#102a36" />
              <stop offset="70%" stopColor="#07141b" />
              <stop offset="100%" stopColor="#040b10" />
            </radialGradient>
            <radialGradient id={`era-glow-${era.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="58%" stopColor="rgba(34,211,238,0.12)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
          </defs>

          {Array.from({ length: 52 }).map((_, index) => (
            <circle
              key={index}
              cx={(index * 137) % 640}
              cy={(index * 89) % 640}
              r={index % 9 === 0 ? 1.2 : 0.7}
              fill="#a8ddec"
              opacity={0.1 + (index % 5) * 0.04}
            />
          ))}

          <circle cx={CX} cy={CY} r={R + 38} fill={`url(#era-glow-${era.id})`} />
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1d4b5c" strokeWidth="0.8" strokeDasharray="3 7" />
          <circle cx={CX} cy={CY} r={R * 0.62} fill="none" stroke="#1d4b5c" strokeWidth="0.6" strokeDasharray="2 8" />
          <circle cx={CX} cy={CY} r={R * 0.3} fill={`url(#era-fill-${era.id})`} stroke={era.color} strokeWidth="1" />
          <text x={CX} y={CY - 4} textAnchor="middle" className="map-label" fill={era.color} fontSize="22">
            {era.code}
          </text>
          <text x={CX} y={CY + 15} textAnchor="middle" className="map-label" fill="#7d94a2" fontSize="11">
            {pick(era.name, lang)}
          </text>

          {nodes.map(({ faction, x, y, machineCount, eventCount }) => {
            const active = faction.id === selected.id;
            return (
              <g
                key={faction.id}
                className={`era-map__node ${active ? "is-active" : ""}`}
                onClick={() => setSelectedId(faction.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelectedId(faction.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${pick(faction.name, lang)} ${machineCount} MS`}
              >
                <line x1={CX} y1={CY} x2={x} y2={y} stroke={active ? faction.color : "#1e4b5b"} strokeWidth={active ? 1.2 : 0.5} opacity={active ? 0.8 : 0.45} />
                <circle cx={x} cy={y} r={active ? 18 : 12} fill="#07131a" stroke={faction.color} strokeWidth={active ? 2 : 1} />
                <circle cx={x} cy={y} r={active ? 5 : 3.5} fill={faction.color} />
                <text x={x} y={y + (y > CY ? 34 : -26)} textAnchor="middle" className="map-label" fill={active ? "#e8eff5" : "#9ab0bd"} fontSize="14">
                  {pick(faction.name, lang)}
                </text>
                <text x={x} y={y + (y > CY ? 46 : -14)} textAnchor="middle" className="map-label map-label--sub" fill={faction.color} fontSize="9">
                  {String(machineCount).padStart(2, "0")} MS / {String(eventCount).padStart(2, "0")} EV
                </text>
              </g>
            );
          })}

          <text x={CX} y={CY + R + 42} textAnchor="middle" className="map-label" fill="#4e6572" fontSize="11">
            {dict.map.schematic}
          </text>
        </svg>
        <div className="map-frame__legend">
          <span><i className="dot dot--colony" />{dict.map.factionsLegend}</span>
          <span><i className="line" />{dict.map.note}</span>
        </div>
      </div>

      <aside className="era-map__side">
        <div className="map-side__head">
          <span className="micro">{dict.map.selectedFaction}</span>
          <span className="tag" style={{ color: selected.color, borderColor: selected.color }}>{selected.short}</span>
        </div>
        <h2>{pick(selected.name, lang)}</h2>
        <p className="map-side__desc">{pick(selected.description, lang)}</p>
        <div className="era-map__stats">
          <div><span>{dict.map.machines}</span><b className="mono">{String(machines.filter((m) => m.factionId === selected.id).length).padStart(2, "0")}</b></div>
          <div><span>{dict.map.events}</span><b className="mono">{String(eraEvents.filter((e) => e.factionIds.includes(selected.id)).length).padStart(2, "0")}</b></div>
        </div>

        <div className="map-side__events">
          <span className="micro">{dict.map.factionEvents} / {String(selectedEvents.length).padStart(2, "0")}</span>
          {selectedEvents.length === 0 ? (
            <p className="map-side__empty">{dict.map.empty}</p>
          ) : (
            selectedEvents.map((event) => (
              <Link key={event.id} href={`/${lang}/events/${event.id}`} className="map-event">
                <span className="map-event__date mono">{formatStoryDate(event.date, era.code, lang)}</span>
                <b>{pick(event.title, lang)}</b>
                <p>{pick(event.summary, lang)}</p>
              </Link>
            ))
          )}
        </div>

        {selectedMachines.length > 0 && (
          <div className="era-map__machines">
            <span className="micro">{dict.map.factionMachines}</span>
            <div>
              {selectedMachines.map((machine) => (
                <Link key={machine.id} href={`/${lang}/machines/${machine.id}`}>
                  <span className="mono">{machine.modelCode}</span>
                  {pick(machine.name, lang)}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link href={`/${lang}/factions/${selected.id}`} className="text-link era-map__link">
          {dict.map.openFaction} <span aria-hidden>→</span>
        </Link>
      </aside>
    </div>
  );
}
