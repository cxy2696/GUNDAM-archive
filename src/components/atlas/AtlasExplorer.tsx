"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { AtlasEra, Era, EventRecord, Faction, Lang, Machine } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick, sourceLabel } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import { Atlas2D } from "./Atlas2D";
import { ZoomFrame } from "@/components/ui/ZoomFrame";

const Atlas3D = dynamic(() => import("./Atlas3D").then((module) => module.Atlas3D), {
  ssr: false,
  loading: () => <div className="atlas3d__fallback">LOADING 3D ORBITAL ENGINE</div>,
});

type View = "2d" | "3d";

export function AtlasExplorer({
  atlas,
  eras,
  factions,
  machines,
  events,
  lang,
  dict,
}: {
  atlas: AtlasEra[];
  eras: Era[];
  factions: Faction[];
  machines: Machine[];
  events: EventRecord[];
  lang: Lang;
  dict: Dictionary;
}) {
  const ordered = useMemo(
    () =>
      [...atlas].sort(
        (a, b) => (eras.find((era) => era.id === a.eraId)?.order ?? 0) - (eras.find((era) => era.id === b.eraId)?.order ?? 0),
      ),
    [atlas, eras],
  );
  const [eraId, setEraId] = useState(ordered[0]?.eraId ?? "uc");
  const [view, setView] = useState<View>("2d");
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => ordered[0]?.nodes.find((node) => node.priority === 1)?.id ?? ordered[0]?.nodes[0]?.id ?? null,
  );

  const era = ordered.find((item) => item.eraId === eraId) ?? ordered[0];
  const eraRecord = eras.find((item) => item.id === era?.eraId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mapped = params.get("era");
    const mode = params.get("view");
    const node = params.get("node");
    if (mapped && ordered.some((item) => item.eraId === mapped)) setEraId(mapped);
    if (mode === "3d" || mode === "2d") setView(mode);
    if (node) setSelectedId(node);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoRotate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!era) return;
    const params = new URLSearchParams(window.location.search);
    params.set("era", era.eraId);
    params.set("view", view);
    if (selectedId) params.set("node", selectedId);
    else params.delete("node");
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", next);
  }, [era, view, selectedId]);

  const selectEra = (id: string) => {
    setEraId(id);
    const target = ordered.find((item) => item.eraId === id);
    const first = target?.nodes.find((node) => node.priority === 1) ?? target?.nodes[0];
    setSelectedId(first ? first.id : null);
  };

  if (!era) return null;

  const selected = era.nodes.find((node) => node.id === selectedId) ?? null;
  const selectedFaction = selected?.factionId ? factions.find((item) => item.id === selected.factionId) : undefined;
  const selectedPlaceEvents = selected
    ? events.filter((event) => event.eraId === era.eraId && selected.placeId && event.placeId === selected.placeId)
    : [];
  const factionEvents = selected?.factionId
    ? events.filter((event) => event.eraId === era.eraId && event.factionIds.includes(selected.factionId!)).slice(0, 5)
    : [];
  const relatedEvents = selectedPlaceEvents.length > 0 ? selectedPlaceEvents : factionEvents;
  const relatedMachines = selected?.factionId
    ? machines.filter((machine) => machine.eraId === era.eraId && machine.factionId === selected.factionId).slice(0, 5)
    : [];
  const eraFactions = factions.filter((faction) => faction.eraIds.includes(era.eraId));

  const surface = era.nodes.filter((node) => node.anchor === "earth" || node.anchor === "moon" || node.anchor === "mars" || node.anchor === "venus" || node.anchor === "jupiter");
  const orbit = era.nodes.filter((node) => node.anchor === "lagrange" || node.anchor === "earthorbit");
  const far = era.nodes.filter((node) => node.anchor === "deep");

  const groupLabel = (anchor: string) =>
    anchor === "earth" || anchor === "moon" || anchor === "mars" || anchor === "venus" || anchor === "jupiter"
      ? dict.atlas.surface
      : anchor === "lagrange" || anchor === "earthorbit"
        ? dict.atlas.orbit
        : dict.atlas.far;

  return (
    <div className="atlas-page container">
      <div className="atlas-tabs" role="tablist" aria-label={dict.nav.map}>
        {ordered.map((item) => {
          const record = eras.find((entry) => entry.id === item.eraId);
          const active = item.eraId === era.eraId;
          return (
            <button
              key={item.eraId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`atlas-tab ${active ? "is-active" : ""}`}
              style={{ "--era": record?.color ?? "var(--cyan)" } as React.CSSProperties}
              onClick={() => selectEra(item.eraId)}
            >
              <span className="mono">{record?.code}</span>
              <b>{record ? pick(record.name, lang) : item.eraId}</b>
              <span className="mono">{String(item.nodes.length).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div className="atlas-toolbar">
        <div className="atlas-toolbar__ident">
          <span className="mono">
            {eraRecord?.code} / {String(eraRecord?.order ?? 0).padStart(2, "0")}
          </span>
          <b>{eraRecord ? pick(eraRecord.name, lang) : era.eraId}</b>
          <span className="mono">
            {era.nodes.length} NODES · {eraFactions.length} FACTIONS · {era.routes.length} ROUTES
          </span>
        </div>
        <div className="atlas-toolbar__actions">
          <div className="seg atlas-view" role="group" aria-label={dict.atlas.view2d}>
            <button type="button" className={view === "2d" ? "is-active" : ""} onClick={() => setView("2d")}>
              {dict.atlas.view2d}
            </button>
            <button type="button" className={view === "3d" ? "is-active" : ""} onClick={() => setView("3d")}>
              {dict.atlas.view3d}
            </button>
          </div>
          {view === "3d" && (
            <>
              <button type="button" className={`chip ${autoRotate ? "is-active" : ""}`} onClick={() => setAutoRotate((value) => !value)}>
                {autoRotate ? dict.atlas.stopRotate : dict.atlas.autoRotate}
              </button>
              <button type="button" className={`chip ${showLabels ? "is-active" : ""}`} onClick={() => setShowLabels((value) => !value)}>
                LABELS
              </button>
            </>
          )}
          <button
            type="button"
            className="chip"
            onClick={() => {
              setResetKey((value) => value + 1);
              setSelectedId(null);
            }}
          >
            {dict.atlas.reset}
          </button>
        </div>
      </div>

      <div className="atlas-body">
        <div className="atlas-main">
          <ZoomFrame label={view === "2d" ? dict.atlas.view2d : dict.atlas.view3d} min={0.8} max={2.2}>
          <div className="atlas-stage" data-view={view}>
            {view === "2d" ? (
              <Atlas2D
                key={`${era.eraId}-${resetKey}`}
                era={era}
                factions={factions}
                lang={lang}
                dict={dict}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ) : (
              <Atlas3D
                key={`${era.eraId}-${resetKey}`}
                era={era}
                factions={factions}
                lang={lang}
                dict={dict}
                selectedId={selectedId}
                onSelect={setSelectedId}
                autoRotate={autoRotate}
                showLabels={showLabels}
              />
            )}
            <div className="atlas-legend">
              <span><i className="atlas-dot" />{dict.atlas.legendSurface}</span>
              <span><i className="atlas-dot atlas-dot--orbit" />{dict.atlas.legendOrbit}</span>
              <span><i className="atlas-line" />{dict.atlas.legendRoute}</span>
            </div>
          </div>
          </ZoomFrame>

          <div className="atlas-notes">
            <div>
              <span className="micro">{dict.atlas.geography}</span>
              <p>{pick(era.geography, lang)}</p>
              {era.layoutNote && <p className="atlas-notes__small">{pick(era.layoutNote, lang)}</p>}
            </div>
            <div className="atlas-notes__note">
              <span className="micro">READOUT</span>
              <p>{dict.atlas.formatNote}</p>
            </div>
          </div>
        </div>

        <aside className="atlas-side">
          <div className="atlas-side__card">
            <div className="atlas-side__head">
              <span className="micro">{dict.atlas.selection}</span>
              <span className="mono">{selected ? selected.kind.toUpperCase() : "—"}</span>
            </div>
            {selected ? (
              <>
                <h2>{pick(selected.name, lang)}</h2>
                <div className="atlas-side__meta">
                  <span className="tag">{dict.atlas.kinds[selected.kind]}</span>
                  <span className="tag">{groupLabel(selected.anchor)}</span>
                  {selected.orbit && <span className="tag tag--violet">{selected.orbit}</span>}
                  {selected.factionId && (
                    <Link href={`/${lang}/factions/${selected.factionId}`} className="atlas-side__faction">
                      {selectedFaction?.short ?? selected.factionId}
                    </Link>
                  )}
                </div>
                <p className="atlas-side__desc">
                  {selected.note
                    ? pick(selected.note, lang)
                    : selectedFaction
                      ? pick(selectedFaction.description, lang)
                      : pick(era.geography, lang)}
                </p>

                {selected.factionId && (
                  <Link href={`/${lang}/factions/${selected.factionId}`} className="text-link atlas-side__link">
                    {dict.atlas.openFaction} <span aria-hidden>→</span>
                  </Link>
                )}

                <div className="atlas-side__block">
                  <span className="micro">
                    {dict.atlas.relatedEvents} / {String(relatedEvents.length).padStart(2, "0")}
                  </span>
                  {relatedEvents.length === 0 ? (
                    <p className="atlas-side__empty">{dict.map.empty}</p>
                  ) : (
                    relatedEvents.slice(0, 4).map((event) => (
                      <Link key={event.id} href={`/${lang}/events/${event.id}`} className="atlas-event">
                        <span className="mono">{eraRecord ? formatStoryDate(event.date, eraRecord.code, lang) : ""}</span>
                        <b>{pick(event.title, lang)}</b>
                      </Link>
                    ))
                  )}
                </div>

                {relatedMachines.length > 0 && (
                  <div className="atlas-side__block">
                    <span className="micro">
                      {dict.atlas.relatedMachines} / {String(relatedMachines.length).padStart(2, "0")}
                    </span>
                    <div className="atlas-machines">
                      {relatedMachines.map((machine) => (
                        <Link key={machine.id} href={`/${lang}/machines/${machine.id}`}>
                          <span className="mono">{machine.modelCode}</span>
                          {pick(machine.name, lang)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="atlas-side__prompt">{dict.atlas.selectPrompt}</p>
            )}
          </div>

          <div className="atlas-side__card atlas-side__card--index">
            <div className="atlas-side__head">
              <span className="micro">{dict.atlas.allNodes}</span>
              <span className="mono">{String(era.nodes.length).padStart(2, "0")}</span>
            </div>
            {[
              { key: "surface", label: dict.atlas.surface, list: surface },
              { key: "orbit", label: dict.atlas.orbit, list: orbit },
              { key: "far", label: dict.atlas.far, list: far },
            ].map((group) =>
              group.list.length === 0 ? null : (
                <div key={group.key} className="atlas-index-group">
                  <span className="atlas-index-group__label">{group.label}</span>
                  {group.list.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={`atlas-index ${node.id === selectedId ? "is-active" : ""}`}
                      onClick={() => setSelectedId(node.id)}
                    >
                      <span className="atlas-index__dot" style={{ background: factions.find((f) => f.id === node.factionId)?.color ?? "#58ff9d" }} />
                      {pick(node.name, lang)}
                      <span className="mono">{node.orbit ?? node.kind}</span>
                    </button>
                  ))}
                </div>
              ),
            )}
          </div>

          <div className="atlas-sources">
            <span className="micro">{dict.atlas.sources}</span>
            <ul>
              {era.sources.map((source) => (
                <li key={source.label}>
                  <span className={`source-level source-level--${source.level}`}>{source.level}</span>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {sourceLabel(source, lang)}
                    </a>
                  ) : (
                    sourceLabel(source, lang)
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
