"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { GraphData } from "@/lib/graph";
import type { Lang, Machine, Tag } from "@/lib/schema";
import { RelationGraph } from "@/components/graph/RelationGraph";
import { ZoomFrame } from "@/components/ui/ZoomFrame";

const CATEGORY_ORDER = ["frame", "armor", "power", "sensor", "weapon", "system"] as const;

export function GlossaryGraphTools({
  tags,
  machines,
  graphs,
  lang,
  dict,
}: {
  tags: Tag[];
  machines: Machine[];
  graphs: Record<string, GraphData>;
  lang: Lang;
  dict: Dictionary;
}) {
  const usage = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tag of tags) {
      map[tag.id] = machines.filter((machine) => machine.tags.includes(tag.id)).length;
    }
    return map;
  }, [tags, machines]);

  const available = useMemo(() => tags.filter((tag) => graphs[tag.id]), [tags, graphs]);
  const [selectedId, setSelectedId] = useState<string>(() => {
    const ranked = [...available].sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0));
    return ranked[0]?.id ?? available[0]?.id ?? "";
  });
  const selected = available.find((tag) => tag.id === selectedId) ?? available[0];
  const graph = selected ? graphs[selected.id] : null;
  const maxUsage = Math.max(1, ...Object.values(usage));

  const categories = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: dict.glossary.category[category],
    tags: tags
      .filter((tag) => tag.category === category)
      .sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0)),
  })).filter((group) => group.tags.length > 0);

  return (
    <div className="glossary-graph-tools">
      <ZoomFrame label={dict.graph.tagMap} min={0.8} max={2}>
      <div className="tag-map">
        <div className="tag-map__head">
          <span className="micro">TAG MAP / {dict.graph.tagMap}</span>
          <span className="micro">{dict.graph.tagMapLead}</span>
        </div>
        <div className="tag-map__grid">
          {categories.map((group) => (
            <section key={group.key} className="tag-map__col" aria-label={group.label}>
              <h3>{group.label}</h3>
              {group.tags.map((tag) => {
                const count = usage[tag.id] ?? 0;
                const scale = 0.55 + (count / maxUsage) * 0.45;
                const active = tag.id === selectedId;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-bubble ${active ? "is-active" : ""}`}
                    onClick={() => setSelectedId(tag.id)}
                    aria-pressed={active}
                    style={{ "--scale": scale } as React.CSSProperties}
                  >
                    <span className="tag-bubble__dot" aria-hidden>
                      <i />
                    </span>
                    <span className="tag-bubble__label">
                      {pick(tag.name, lang)}
                      <b className="mono">{count}</b>
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
        <p className="tag-map__hint">{dict.graph.tagMapLead}</p>
      </div>
      </ZoomFrame>

      {graph && selected && (
        <div className="tag-tree">
          <div className="tag-tree__head">
            <span className="micro">02 / {dict.graph.tagTree}</span>
            <span className="mono">{dict.graph.tagTreeLead}</span>
            <Link href={`#tag-${selected.id}`} className="text-link">
              {lang === "ja" ? "用語を開く" : "打开词条"} →
            </Link>
          </div>
          <RelationGraph
            data={graph}
            dict={dict}
            title={`${pick(selected.name, lang)} · ${dict.graph.tagTree}`}
            lead={dict.graph.tagTreeLead}
          />
        </div>
      )}
    </div>
  );
}
