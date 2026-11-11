"use client";

import { useMemo, useState } from "react";
import type { Era, Faction, Lang, Machine, Tag } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { normalizeQuery } from "@/lib/format";
import { MachineCard } from "./MachineCard";
import { SearchIcon } from "./Icons";

type SortKey = "timeline" | "name" | "height";

export function MachineExplorer({
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
  const [eraId, setEraId] = useState<string>("all");
  const [factionId, setFactionId] = useState<string>("all");
  const [tagId, setTagId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("timeline");

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    const list = machines.filter((machine) => {
      if (eraId !== "all" && machine.eraId !== eraId) return false;
      if (factionId !== "all" && machine.factionId !== factionId) return false;
      if (tagId !== "all" && !machine.tags.includes(tagId)) return false;
      if (q) {
        const haystack = normalizeQuery(
          [machine.name.zh, machine.name.ja, machine.name.en, machine.modelCode, ...machine.aliases].join(" "),
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.name[lang].localeCompare(b.name[lang], lang === "ja" ? "ja" : "zh");
      if (sort === "height") return (b.specs.heightOverall ?? 0) - (a.specs.heightOverall ?? 0);
      return (
        (eras.find((e) => e.id === a.eraId)?.order ?? 0) - (eras.find((e) => e.id === b.eraId)?.order ?? 0) ||
        a.firstAppear.year - b.firstAppear.year
      );
    });
  }, [machines, eraId, factionId, tagId, query, sort, lang, eras]);

  const usedFactions = factions.filter((faction) => machines.some((m) => m.factionId === faction.id));
  const usedTags = tags.filter((tag) => machines.some((m) => m.tags.includes(tag.id)));
  const reset = () => {
    setEraId("all");
    setFactionId("all");
    setTagId("all");
    setQuery("");
  };

  return (
    <div className="explorer container">
      <div className="explorer__bar">
        <div className="explorer__search">
          <SearchIcon size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.machineIndex.search}
            aria-label={dict.machineIndex.search}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={dict.common.clear}>
              ×
            </button>
          )}
        </div>
        <div className="explorer__selects">
          <label>
            <span className="micro">{dict.machine.faction}</span>
            <select value={factionId} onChange={(event) => setFactionId(event.target.value)}>
              <option value="all">{dict.machineIndex.allFactions}</option>
              {usedFactions.map((faction) => (
                <option key={faction.id} value={faction.id}>
                  {faction.name[lang]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="micro">{dict.machine.tags}</span>
            <select value={tagId} onChange={(event) => setTagId(event.target.value)}>
              <option value="all">{dict.machineIndex.allTags}</option>
              {usedTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name[lang]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="micro">{dict.machineIndex.sort}</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
              <option value="timeline">{dict.machineIndex.sortTimeline}</option>
              <option value="name">{dict.machineIndex.sortName}</option>
              <option value="height">{dict.machineIndex.sortHeight}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="explorer__chips">
        <button
          type="button"
          className={`chip ${eraId === "all" ? "is-active" : ""}`}
          onClick={() => setEraId("all")}
        >
          {dict.machineIndex.allEras}
          <span className="chip__count">{String(machines.length).padStart(2, "0")}</span>
        </button>
        {eras.map((era) => {
          const count = machines.filter((m) => m.eraId === era.id).length;
          return (
            <button
              key={era.id}
              type="button"
              className={`chip ${eraId === era.id ? "is-active" : ""}`}
              onClick={() => setEraId(era.id)}
              style={eraId === era.id ? { borderColor: era.color, color: era.color } : undefined}
            >
              <span className="mono" style={{ color: era.color }}>
                {era.code}
              </span>
              {era.name[lang]}
              <span className="chip__count">{String(count).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div className="explorer__meta">
        <span className="mono">
          {String(filtered.length).padStart(2, "0")} / {String(machines.length).padStart(2, "0")} {dict.machineIndex.results}
        </span>
        {(eraId !== "all" || factionId !== "all" || tagId !== "all" || query) && (
          <button type="button" className="text-btn" onClick={reset}>
            {dict.machineIndex.reset} ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="explorer__empty">
          <p>{dict.machineIndex.empty}</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
            {dict.machineIndex.reset}
          </button>
        </div>
      ) : (
        <div className="machine-grid">
          {filtered.map((machine, index) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              era={eras.find((era) => era.id === machine.eraId)}
              faction={factions.find((faction) => faction.id === machine.factionId)}
              lang={lang}
              dict={dict}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
