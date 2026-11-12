"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Era, Lang, Machine, Tag } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

const CATEGORY_ORDER = ["frame", "armor", "power", "sensor", "weapon", "system"] as const;

export function GlossaryExplorer({
  tags,
  machines,
  eras,
  lang,
  dict,
}: {
  tags: Tag[];
  machines: Machine[];
  eras: Era[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [category, setCategory] = useState<string>("all");
  const [eraFilter, setEraFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags
      .filter((tag) => category === "all" || tag.category === category)
      .filter((tag) => {
        if (eraFilter === "all") return true;
        return machines.some((machine) => machine.eraId === eraFilter && machine.tags.includes(tag.id));
      })
      .filter((tag) => {
        if (!q) return true;
        const haystack = [
          tag.name.zh,
          tag.name.ja,
          tag.name.en,
          tag.description.zh,
          tag.description.ja,
          ...tag.detail.zh,
          ...tag.detail.ja,
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category as typeof CATEGORY_ORDER[number]) - CATEGORY_ORDER.indexOf(b.category as typeof CATEGORY_ORDER[number]));
  }, [tags, category, eraFilter, query, machines]);

  return (
    <div className="glossary-explorer">
      <div className="glossary-toolbar">
        <label className="glossary-search">
          <span className="sr-only">{dict.glossary.searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.glossary.searchPlaceholder}
          />
        </label>
        <div className="glossary-chips" role="group" aria-label={dict.nav.glossary}>
          <button type="button" className={`chip ${category === "all" ? "is-active" : ""}`} onClick={() => setCategory("all")}>
            {dict.glossary.filterAll}
            <span className="chip__count">{String(tags.length).padStart(2, "0")}</span>
          </button>
          {CATEGORY_ORDER.map((key) => {
            const count = tags.filter((tag) => tag.category === key).length;
            return (
              <button
                key={key}
                type="button"
                className={`chip ${category === key ? "is-active" : ""}`}
                onClick={() => setCategory(key)}
              >
                {dict.glossary.category[key]}
                <span className="chip__count">{String(count).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glossary-eras" role="group" aria-label={dict.glossary.seriesFilter}>
        <span className="micro">{dict.glossary.seriesFilter}</span>
        <button
          type="button"
          className={`chip ${eraFilter === "all" ? "is-active" : ""}`}
          onClick={() => setEraFilter("all")}
        >
          {dict.glossary.filterAll}
        </button>
        {eras.map((era) => (
          <button
            key={era.id}
            type="button"
            className={`chip ${eraFilter === era.id ? "is-active" : ""}`}
            style={{ "--era": era.color } as React.CSSProperties}
            onClick={() => setEraFilter(era.id)}
          >
            <span className="mono">{era.code}</span>
            {pick(era.name, lang)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="glossary-empty">{dict.glossary.noResults}</p>
      ) : (
        <div className="glossary-grid">
          {filtered.map((tag) => {
            const usingAll = machines.filter((machine) => machine.tags.includes(tag.id));
            const using = eraFilter === "all" ? usingAll : usingAll.filter((machine) => machine.eraId === eraFilter);
            const eraCodes = [...new Set(using.map((machine) => eras.find((era) => era.id === machine.eraId)?.code).filter(Boolean))];
            return (
              <article key={tag.id} className="glossary-card" id={`tag-${tag.id}`}>
                <div className="glossary-card__top">
                  <span className="micro">{dict.glossary.category[tag.category]}</span>
                  <span className="mono">{String(using.length).padStart(2, "0")} MS</span>
                </div>
                <h3>{pick(tag.name, lang)}</h3>
                <span className="glossary-card__en">{tag.name.en}</span>
                <p className="glossary-card__summary">{pick(tag.description, lang)}</p>
                {tag.detail[lang].map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="glossary-card__detail">{paragraph}</p>
                ))}
                <div className="glossary-card__foot">
                  <span className="micro">{eraCodes.join(" / ")}</span>
                  <span className="micro">{using.length} {dict.glossary.machinesUsing}</span>
                </div>
                {using.length > 0 && (
                  <div className="glossary-card__machines">
                    {using.slice(0, 4).map((machine) => (
                      <Link key={machine.id} href={`/${lang}/machines/${machine.id}`}>
                        {pick(machine.name, lang)}
                      </Link>
                    ))}
                    {using.length > 4 && <span className="mono">+{using.length - 4}</span>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
