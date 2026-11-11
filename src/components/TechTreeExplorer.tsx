"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Era, Faction, Lang, Machine, Tag } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { layoutTechTree } from "@/lib/tree";

export function TechTreeExplorer({
  machines,
  eras,
  factions,
  tags,
  lang,
  dict,
}: {
  machines: Machine[];
  eras: Era[];
  factions: Faction[];
  tags: Tag[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [activeTag, setActiveTag] = useState<string>("all");
  const layout = useMemo(() => layoutTechTree(machines), [machines]);
  const usedTags = tags.filter((tag) => machines.some((machine) => machine.tags.includes(tag.id)));
  const tag = tags.find((item) => item.id === activeTag);
  const activeCount = tag ? machines.filter((machine) => machine.tags.includes(tag.id)).length : machines.length;

  return (
    <div className="tree-page container">
      <div className="tree__toolbar">
        <div className="tree__counts">
          <span className="mono">{String(machines.length).padStart(2, "0")} {dict.tree.nodes}</span>
          <span className="mono">{String(layout.edges.length).padStart(2, "0")} {dict.tree.edges}</span>
          <span className="mono">{layout.nodes.filter((node) => node.isolated).length} ISOLATED</span>
        </div>
        <div className="tree__legend" aria-label={dict.tree.legend}>
          <span><i className="line line--derive" />{dict.tree.derive}</span>
          <span><i className="line line--tech" />{dict.tree.techFrom}</span>
          <span><i className="line line--replace" />{dict.tree.replace}</span>
        </div>
      </div>

      <div className="tree__filters">
        <span className="micro">{dict.tree.filterHint}</span>
        <div className="tree__chips">
          <button type="button" className={`chip ${activeTag === "all" ? "is-active" : ""}`} onClick={() => setActiveTag("all")}>
            {dict.tree.allTags}
            <span className="chip__count">{String(machines.length).padStart(2, "0")}</span>
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
                {String(machines.filter((machine) => machine.tags.includes(item.id)).length).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="tree__viewport">
        <div className="tree__stage" style={{ width: layout.width, height: layout.height }}>
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
              const dim = activeTag !== "all" && edge.techTag !== activeTag;
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

          <div className="tree__parallel" style={{ top: layout.isolatedLabelY }}>
            <span className="micro">{dict.tree.crossEra}</span>
            <span className="tree__parallel-line" />
          </div>

          {layout.nodes.map(({ machine, x, y, isolated }) => {
            const era = eras.find((item) => item.id === machine.eraId);
            const faction = factions.find((item) => item.id === machine.factionId);
            const dim = activeTag !== "all" && !machine.tags.includes(activeTag);
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
            <b className="mono">{String(machines.length).padStart(2, "0")}</b>
          </div>
          <div>
            <span className="micro">{dict.tree.edges}</span>
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
