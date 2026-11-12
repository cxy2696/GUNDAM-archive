"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Era, Faction, Lang, Tag } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { layoutTechTree, type TreeMachine } from "@/lib/tree";

export function TechTreeExplorer({
  machines,
  eras,
  factions,
  tags,
  lang,
  dict,
}: {
  machines: TreeMachine[];
  eras: Era[];
  factions: Faction[];
  tags: Tag[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [activeTag, setActiveTag] = useState<string>("all");
  const [activeEra, setActiveEra] = useState<string>("uc");
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);
  const availableMachines = useMemo(
    () => machines.filter((machine) => machine.eraId === activeEra),
    [machines, activeEra],
  );
  const layout = useMemo(
    () => layoutTechTree(machines, eras.map((era) => era.id), activeEra),
    [machines, eras, activeEra],
  );
  const usedTags = tags.filter((tag) => availableMachines.some((machine) => machine.tags.includes(tag.id)));
  const tag = tags.find((item) => item.id === activeTag);
  const activeCount = tag ? availableMachines.filter((machine) => machine.tags.includes(tag.id)).length : availableMachines.length;
  const activeEraRecord = eras.find((era) => era.id === activeEra);
  const hasIsolated = layout.nodes.some((node) => node.isolated);
  const levels = [...new Set(layout.nodes.filter((node) => !node.isolated).map((node) => node.depth))].sort((a, b) => a - b);
  const q = query.trim().toLowerCase();
  const matchesQuery = (machine: TreeMachine) => {
    if (!q) return true;
    return [machine.name.zh, machine.name.ja, machine.name.en, machine.modelCode, ...machine.aliases]
      .join(" ")
      .toLowerCase()
      .includes(q);
  };
  const matchedCount = availableMachines.filter(matchesQuery).length;
  const connected = useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>([hovered]);
    layout.edges.forEach((edge) => {
      if (edge.from.machine.id === hovered) set.add(edge.to.machine.id);
      if (edge.to.machine.id === hovered) set.add(edge.from.machine.id);
    });
    return set;
  }, [hovered, layout.edges]);

  useEffect(() => {
    setZoom(1);
    setQuery("");
  }, [activeEra]);

  const fit = () => {
    const el = viewportRef.current;
    if (!el) return;
    setZoom(Math.max(0.42, Math.min(1, (el.clientWidth - 24) / layout.width)));
  };

  return (
    <div className="tree-page container">
      <div className="tree__toolbar">
        <div className="tree__counts">
          <span className="mono">{String(availableMachines.length).padStart(2, "0")} {dict.tree.nodes}</span>
          <span className="mono">{String(layout.edges.length).padStart(2, "0")} {dict.tree.ucEdges}</span>
          <span className="mono">{activeEraRecord?.code ?? activeEra} / SERIES</span>
        </div>
        <div className="tree__legend" aria-label={dict.tree.legend}>
          <span><i className="line line--derive" />{dict.tree.derive}</span>
          <span><i className="line line--tech" />{dict.tree.techFrom}</span>
          <span><i className="line line--replace" />{dict.tree.replace}</span>
        </div>
      </div>

      <div className="tree__tools">
        <label className="tree__search">
          <span className="sr-only">{dict.tree.searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.tree.searchPlaceholder}
          />
          {q && <span className="tree__search-count mono">{matchedCount} / {availableMachines.length}</span>}
        </label>
        <span className="micro tree__focus-hint">{dict.tree.focusHint}</span>
        <div className="tree__zoom">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.42, +(value - 0.1).toFixed(2)))} aria-label={dict.tree.zoomOut}>−</button>
          <span className="mono">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.5, +(value + 0.1).toFixed(2)))} aria-label={dict.tree.zoomIn}>＋</button>
          <button type="button" className="chip" onClick={fit}>{dict.tree.fit}</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? dict.common.close : "Fullscreen"}>
            {expanded ? "×" : "⛶"}
          </button>
        </div>
      </div>

      <div className="tree__era-tabs" role="tablist" aria-label={dict.chronology.title}>
        {eras.map((era) => (
          <button
            key={era.id}
            type="button"
            role="tab"
            aria-selected={activeEra === era.id}
            className={`tree__era-tab ${activeEra === era.id ? "is-active" : ""}`}
            style={{ "--era": era.color } as React.CSSProperties}
            onClick={() => { setActiveEra(era.id); setActiveTag("all"); }}
          >
            <span className="mono">{era.code}</span>
            <b>{pick(era.name, lang)}</b>
            <span className="mono">{String(machines.filter((machine) => machine.eraId === era.id).length).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <div className="tree__filters">
        <span className="micro">{dict.tree.filterHint}</span>
        <div className="tree__chips">
          <button type="button" className={`chip ${activeTag === "all" ? "is-active" : ""}`} onClick={() => setActiveTag("all")}>
            {dict.tree.allTags}
            <span className="chip__count">{String(availableMachines.length).padStart(2, "0")}</span>
          </button>
          {usedTags.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${activeTag === item.id ? "is-active" : ""}`}
              onClick={() => setActiveTag(activeTag === item.id ? "all" : item.id)}
            >
              {pick(item.name, lang)}
              <span className="chip__count">
                {String(availableMachines.filter((machine) => machine.tags.includes(item.id)).length).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`tree__viewport ${expanded ? "is-expanded" : ""}`} ref={viewportRef}>
        <div className="tree__zoom-box" style={{ width: layout.width * zoom, height: layout.height * zoom }}>
        <div
          className={`tree__stage ${activeTag !== "all" ? "is-filtered" : ""}`}
          style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}
        >
          <div className="tree__levels" aria-hidden>
            {levels.map((level) => (
              <span key={level} className="tree__level" style={{ left: 180 + level * 286 }}>
                <i />
                <b>{dict.tree.generation} {String(level + 1).padStart(2, "0")}</b>
              </span>
            ))}
          </div>
          <div className="tree__band" style={{ left: 70, width: 230 }}>
            <span className="micro">ORIGIN / 原型</span>
          </div>
          <div className="tree__band tree__band--right" style={{ left: layout.width - 360, width: 290 }}>
            <span className="micro">SUCCESSOR / 后继</span>
          </div>

          <svg className="tree__edges" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden>
            <defs>
              <marker id="tt-arrow-derive" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L8 4 L0 8 z" fill="#22d3ee" />
              </marker>
              <marker id="tt-arrow-tech" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L8 4 L0 8 z" fill="#a78bfa" />
              </marker>
              <marker id="tt-arrow-replace" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L8 4 L0 8 z" fill="#64748b" />
              </marker>
            </defs>
            {layout.edges.map((edge, index) => {
              const dim =
                (activeTag !== "all" && edge.techTag !== activeTag) ||
                Boolean(connected && !connected.has(edge.from.machine.id) && !connected.has(edge.to.machine.id));
              const tag = tags.find((item) => item.id === edge.techTag);
              const label =
                edge.kind === "derive_of"
                  ? dict.tree.derive
                  : edge.kind === "replace"
                    ? dict.tree.replace
                    : tag
                      ? pick(tag.name, lang)
                      : dict.tree.techFrom;
              return (
                <g key={`${edge.from.machine.id}-${edge.to.machine.id}-${edge.kind}-${index}`} className={dim ? "is-dim" : ""}>
                  <path
                    d={edge.d}
                    className={`tree-edge tree-edge--${edge.kind} ${dim ? "is-dim" : ""}`}
                    markerEnd={`url(#tt-arrow-${edge.kind === "derive_of" ? "derive" : edge.kind === "tech_from" ? "tech" : "replace"})`}
                  />
                  <text x={edge.labelX} y={edge.labelY} textAnchor="middle" className={`tree-edge-label tree-edge-label--${edge.kind}`}>
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {hasIsolated && (
            <div className="tree__parallel" style={{ top: layout.isolatedLabelY }}>
              <span className="micro">{dict.tree.crossEra}</span>
              <span className="tree__parallel-line" />
            </div>
          )}

          {layout.nodes.map(({ machine, x, y, isolated }) => {
            const era = eras.find((item) => item.id === machine.eraId);
            const faction = factions.find((item) => item.id === machine.factionId);
            const dim =
              (activeTag !== "all" && !machine.tags.includes(activeTag)) ||
              (q.length > 0 && !matchesQuery(machine)) ||
              Boolean(connected && !connected.has(machine.id));
            return (
              <Link
                key={machine.id}
                href={`/${lang}/machines/${machine.id}`}
                className={`tnode ${isolated ? "is-isolated" : ""} ${dim ? "is-dim" : ""}`}
                style={{
                  left: x,
                  top: y,
                  "--faction": faction?.color ?? "var(--cyan)",
                  "--era": era?.color ?? "var(--cyan)",
                } as React.CSSProperties}
                title={`${machine.modelCode} · ${pick(machine.name, lang)}`}
                onMouseEnter={() => setHovered(machine.id)}
                onMouseLeave={() => setHovered((current) => (current === machine.id ? null : current))}
              >
                <span className="tnode__bar" />
                <span className="tnode__top">
                  <span className="mono">{machine.modelCode}</span>
                  <span className="mono">{era?.code}</span>
                </span>
                <b>{pick(machine.name, lang)}</b>
                <span className="tnode__meta">
                  {machine.firstAppear.year} · {machine.tags.length} TAGS
                </span>
              </Link>
            );
          })}
        </div>
        </div>
      </div>

      <div className="tree__foot">
        <div className="tree__tagpanel">
          {tag ? (
            <>
              <div className="tree__tagpanel-head">
                <span className="micro">{dict.tree.tagDefinition}</span>
                <span className="mono">{String(activeCount).padStart(2, "0")} MS</span>
              </div>
              <h3>{pick(tag.name, lang)}</h3>
              <span className="tree__tag-cat mono">{tag.category}</span>
              <p>{pick(tag.description, lang)}</p>
              <button type="button" className="text-btn" onClick={() => setActiveTag("all")}>
                {dict.tree.clearFocus} ×
              </button>
            </>
          ) : (
            <>
              <span className="micro">{dict.tree.legend}</span>
              <p className="tree__hint">{dict.tree.clickHint}</p>
              <p className="tree__hint tree__hint--muted">{dict.tree.crossEraNote}</p>
            </>
          )}
        </div>
        <div className="tree__stats">
          <div>
            <span className="micro">{dict.tree.nodes}</span>
            <b className="mono">{String(availableMachines.length).padStart(2, "0")}</b>
          </div>
          <div>
            <span className="micro">{dict.tree.ucEdges}</span>
            <b className="mono">{String(layout.edges.length).padStart(2, "0")}</b>
          </div>
          <div>
            <span className="micro">{dict.home.stats.eras}</span>
            <b className="mono">{String(new Set(machines.map((m) => m.eraId)).size).padStart(2, "0")}</b>
          </div>
          <div>
            <span className="micro">TAGS</span>
            <b className="mono">{String(usedTags.length).padStart(2, "0")}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
