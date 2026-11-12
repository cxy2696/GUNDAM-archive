"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { GraphData } from "@/lib/graph";
import type { Era, Lang } from "@/lib/schema";
import { RelationGraph } from "@/components/graph/RelationGraph";

export function FactionGraphExplorer({
  eras,
  graphs,
  lang,
  dict,
}: {
  eras: Era[];
  graphs: Record<string, GraphData>;
  lang: Lang;
  dict: Dictionary;
}) {
  const ordered = [...eras].sort((a, b) => a.order - b.order).filter((era) => graphs[era.id]);
  const [eraId, setEraId] = useState(ordered[0]?.id ?? "uc");
  const era = ordered.find((item) => item.id === eraId) ?? ordered[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mapped = params.get("era");
    if (mapped && graphs[mapped]) setEraId(mapped);
  }, [graphs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("era", eraId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [eraId]);

  if (!era) return null;
  const graph = graphs[era.id];

  return (
    <section className="faction-graph" id="relations">
      <div className="faction-graph__head">
        <div>
          <div className="eyebrow">{dict.archive.eyebrow} / GRAPH</div>
          <h2>{dict.graph.archiveTitle}</h2>
          <p>{dict.graph.archiveLead}</p>
        </div>
        <div className="faction-graph__tabs" role="tablist" aria-label={dict.chronology.title}>
          {ordered.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === eraId}
              className={`faction-graph__tab ${item.id === eraId ? "is-active" : ""}`}
              style={{ "--era": item.color } as React.CSSProperties}
              onClick={() => setEraId(item.id)}
            >
              <span className="mono">{item.code}</span>
              <b>{pick(item.name, lang)}</b>
            </button>
          ))}
        </div>
      </div>
      <RelationGraph data={graph} dict={dict} title={`${era.code} · ${pick(era.name, lang)}`} lead={dict.graph.archiveLead} />
    </section>
  );
}
