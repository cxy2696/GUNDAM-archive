"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Era, EventRecord, Faction, Lang, Machine, Place } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import { EraFactionMap } from "./EraFactionMap";

const R = 218;
const CX = 320;
const CY = 320;
const ORBITS: Record<string, number> = { L1: 1.3, L2: 1.46, L3: 1.62, L4: 1.78, L5: 1.94 };

function orbitPoint(orbit: string | undefined, angle: number | undefined): { x: number; y: number } {
  const idx = orbit ? ORBITS[orbit] ?? 1.3 : 1.95;
  const rx = R * idx;
  const ry = R * idx * 0.42;
  const theta = ((angle ?? 0) * Math.PI) / 180;
  const ex = rx * Math.cos(theta);
  const ey = ry * Math.sin(theta);
  const rot = (-18 * Math.PI) / 180;
  return {
    x: CX + ex * Math.cos(rot) - ey * Math.sin(rot),
    y: CY + ex * Math.sin(rot) + ey * Math.cos(rot),
  };
}

function earthPoint(place: Place): { x: number; y: number } {
  const x = CX + ((place.lng ?? 0) / 180) * R * 0.8;
  const y = CY - ((place.lat ?? 0) / 90) * R * 0.8;
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > R * 0.94) {
    return { x: CX + (dx / dist) * R * 0.94, y: CY + (dy / dist) * R * 0.94 };
  }
  return { x, y };
}

export function OrbitalMap({
  places,
  events,
  eras,
  machines,
  factions,
  lang,
  dict,
}: {
  places: Place[];
  events: EventRecord[];
  eras: Era[];
  machines: Machine[];
  factions: Faction[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [eraId, setEraId] = useState<string>("uc");
  const [selectedId, setSelectedId] = useState<string>("a-baoa-qu");
  const selectedEra = eras.find((era) => era.id === eraId) ?? eras[0];
  const selected = places.find((place) => place.id === selectedId) ?? places[0];
  const selectedEvents = events.filter((event) => event.placeId === selected?.id);
  const battlePlaces = places.filter((place) => events.some((event) => event.placeId === place.id));

  const positions = useMemo(
    () =>
      places.map((place) => ({
        place,
        ...(place.kind === "earth" || place.kind === "moon"
          ? earthPoint(place)
          : place.id === "axis"
            ? { x: 586, y: 430 }
            : orbitPoint(place.orbit, place.angle)),
      })),
    [places],
  );

  const select = (id: string) => setSelectedId(id);

  const eraTabs = (
    <div className="map-era-tabs" role="tablist" aria-label={dict.chronology.title}>
      {eras.map((era) => (
        <button
          key={era.id}
          type="button"
          role="tab"
          aria-selected={eraId === era.id}
          className={`map-era-tab ${eraId === era.id ? "is-active" : ""}`}
          style={{ "--era": era.color } as React.CSSProperties}
          onClick={() => setEraId(era.id)}
        >
          <span className="mono">{era.code}</span>
          <b>{pick(era.name, lang)}</b>
          <span className="mono">{String(events.filter((event) => event.eraId === era.id).length).padStart(2, "0")}</span>
        </button>
      ))}
    </div>
  );

  if (selectedEra && eraId !== "uc") {
    const eraFactions = factions.filter((faction) => faction.eraIds.includes(eraId));
    return (
      <div className="map-page map-page--stacked container">
        {eraTabs}
        <EraFactionMap
          era={selectedEra}
          factions={eraFactions}
          events={events}
          machines={machines}
          lang={lang}
          dict={dict}
        />
      </div>
    );
  }

  return (
    <div className="map-page container">
      {eraTabs}
      <div className="map-main">
        <div className="map-frame">
          <div className="map-frame__top">
            <span className="micro">EARTH SPHERE / TACTICAL SCHEMATIC</span>
            <span className="mono">LAT 0° · LON 0° · ALT 0</span>
          </div>
          <svg className="map-svg" viewBox="0 0 640 640" role="img" aria-label={dict.map.title}>
            <defs>
              <radialGradient id="earth-fill" cx="42%" cy="38%" r="68%">
                <stop offset="0%" stopColor="#0d2530" />
                <stop offset="55%" stopColor="#081820" />
                <stop offset="100%" stopColor="#040c11" />
              </radialGradient>
              <radialGradient id="earth-glow" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="rgba(34,211,238,0.12)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </radialGradient>
              <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(34,211,238,0)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.22)" />
              </linearGradient>
              <clipPath id="globe-clip">
                <circle cx={CX} cy={CY} r={R} />
              </clipPath>
            </defs>

            {Array.from({ length: 46 }).map((_, index) => (
              <circle
                key={index}
                cx={(index * 137) % 640}
                cy={(index * 89) % 640}
                r={index % 7 === 0 ? 1.2 : 0.7}
                fill="#a8ddec"
                opacity={0.1 + (index % 5) * 0.04}
              />
            ))}

            <circle cx={CX} cy={CY} r={R + 26} fill="url(#earth-glow)" />
            <circle cx={CX} cy={CY} r={R} fill="url(#earth-fill)" stroke="#1d4b5c" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={R - 0.5} fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.7" />

            <g clipPath="url(#globe-clip)" opacity="0.5">
              {[-60, -30, 0, 30, 60].map((lat) => {
                const y = CY - (lat / 90) * R;
                const w = Math.sqrt(Math.max(0, R * R - (y - CY) * (y - CY)));
                return (
                  <path
                    key={lat}
                    d={`M ${CX - w} ${y} Q ${CX} ${y + (lat === 0 ? 0 : lat > 0 ? 8 : -8)} ${CX + w} ${y}`}
                    fill="none"
                    stroke="#2b6473"
                    strokeWidth="0.55"
                  />
                );
              })}
              {[-120, -80, -40, 0, 40, 80, 120].map((lng) => (
                <ellipse
                  key={lng}
                  cx={CX}
                  cy={CY}
                  rx={Math.abs(R * Math.sin((lng * Math.PI) / 180))}
                  ry={R}
                  fill="none"
                  stroke="#2b6473"
                  strokeWidth="0.55"
                />
              ))}
              <ellipse cx={CX} cy={CY} rx={R * 0.94} ry={R * 0.2} fill="none" stroke="#398293" strokeWidth="0.5" opacity="0.5" />
              <g className="map-sweep">
                <path d={`M ${CX} ${CY} L ${CX + R} ${CY - 22} A ${R} ${R} 0 0 1 ${CX + R * 0.82} ${CY + R * 0.55} Z`} fill="url(#sweep)" />
              </g>
            </g>

            <g opacity="0.45">
              {["L1", "L2", "L3", "L4", "L5"].map((orbit) => {
                const idx = ORBITS[orbit];
                return (
                  <ellipse
                    key={orbit}
                    cx={CX}
                    cy={CY}
                    rx={R * idx}
                    ry={R * idx * 0.42}
                    transform={`rotate(-18 ${CX} ${CY})`}
                    fill="none"
                    stroke="#1c4655"
                    strokeWidth="0.6"
                    strokeDasharray="3 6"
                  />
                );
              })}
            </g>

            <circle cx={584} cy={170} r={22} fill="#101b20" stroke="#5a7180" strokeWidth="0.8" />
            <circle cx={578} cy={164} r={5} fill="#1f323b" />
            <text x={584} y={204} textAnchor="middle" className="map-label" fill="#7d94a2">
              {dict.map.moon}
            </text>

            <g className="map-axis" opacity="0.75">
              <circle cx={586} cy={430} r={14} fill="#0b1218" stroke="#7a6350" strokeWidth="0.7" strokeDasharray="2 3" />
              <path d={`M ${CX + R * 0.55} ${CY + R * 0.35} L 574 424`} stroke="#5d4a3d" strokeWidth="0.6" strokeDasharray="2 4" />
              <text x={586} y={458} textAnchor="middle" className="map-label" fill="#8a7565">AXIS / DEEP SPACE</text>
            </g>

            {positions.map(({ place, x, y }) => {
              const count = events.filter((event) => event.placeId === place.id).length;
              const isSelected = place.id === selected?.id;
              return (
                <g
                  key={place.id}
                  className={`map-marker map-marker--${place.kind} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => select(place.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") select(place.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${pick(place.name, lang)} (${count} ${dict.map.eventsHere})`}
                >
                  <circle cx={x} cy={y} r={14} fill="transparent" />
                  {isSelected && <circle cx={x} cy={y} r={11} className="map-marker__ring" />}
                  <circle cx={x} cy={y} r={3.6} className="map-marker__dot" />
                  <text x={x + 8} y={y - 6} className="map-label">
                    {pick(place.name, lang)}
                    {count > 0 ? ` / ${String(count).padStart(2, "0")}` : ""}
                  </text>
                </g>
              );
            })}

            <text x={CX} y={CY + R + 22} textAnchor="middle" className="map-label" fill="#4e6572" fontSize="9">
              {dict.map.note}
            </text>
          </svg>
          <div className="map-frame__legend">
            <span><i className="dot dot--earth" />{dict.map.earth}</span>
            <span><i className="dot dot--colony" />{dict.map.colony}</span>
            <span><i className="dot dot--space" />{dict.map.battle}</span>
            <span><i className="line" />{dict.map.lagrange}</span>
          </div>
        </div>

        <div className="map-list">
          <div className="map-list__head">
            <span className="micro">{dict.map.allBattles}</span>
            <span className="mono">{String(battlePlaces.length).padStart(2, "0")}</span>
          </div>
          {battlePlaces.map((place) => {
            const count = events.filter((event) => event.placeId === place.id).length;
            return (
              <button
                key={place.id}
                type="button"
                className={`map-list__row ${place.id === selected?.id ? "is-active" : ""}`}
                onClick={() => select(place.id)}
              >
                <span className="mono">{place.kind === "earth" ? "EARTH" : place.kind === "moon" ? "MOON" : place.orbit ?? "DEEP"}</span>
                <b>{pick(place.name, lang)}</b>
                <span className="mono">{String(count).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="map-side">
        {selected && (
          <>
            <div className="map-side__head">
              <span className="micro">{dict.map.selected}</span>
              <span className="tag">{selected.kind === "earth" ? "EARTH" : selected.kind === "moon" ? "MOON" : selected.orbit ?? "DEEP SPACE"}</span>
            </div>
            <h2>{pick(selected.name, lang)}</h2>
            <p className="map-side__desc">{pick(selected.description, lang)}</p>

            <div className="map-side__events">
              <span className="micro">{dict.map.eventsHere} / {String(selectedEvents.length).padStart(2, "0")}</span>
              {selectedEvents.length === 0 ? (
                <p className="map-side__empty">{dict.map.empty}</p>
              ) : (
                selectedEvents.map((event) => {
                  const era = eras.find((item) => item.id === event.eraId);
                  const eventMachines = event.machineIds
                    .map((id) => machines.find((machine) => machine.id === id))
                    .filter((machine): machine is Machine => Boolean(machine));
                  return (
                    <Link key={event.id} href={`/${lang}/events/${event.id}`} className="map-event">
                      <span className="map-event__date mono">
                        {era ? formatStoryDate(event.date, era.code, lang) : ""}
                      </span>
                      <b>{pick(event.title, lang)}</b>
                      <p>{pick(event.summary, lang)}</p>
                      {eventMachines.length > 0 && (
                        <span className="map-event__ms mono">
                          {eventMachines.map((machine) => machine.modelCode).join(" / ")}
                        </span>
                      )}
                    </Link>
                  );
                })
              )}
            </div>

            <div className="map-side__note">
              <span className="micro">SOURCE / SCHEMATIC</span>
              <p>{dict.map.note}</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
