"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Era, Faction, Lang, Tag } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { normalizeQuery } from "@/lib/format";
import { MachineCard, type MachineCardData } from "./MachineCard";
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
  machines: MachineCardData[];
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
  const [canon, setCanon] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("timeline");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    const list = machines.filter((machine) => {
      if (eraId !== "all" && machine.eraId !== eraId) return false;
      if (factionId !== "all" && machine.factionId !== factionId) return false;
      if (tagId !== "all" && !machine.tags.includes(tagId)) return false;
      if (canon !== "all" && machine.canon !== canon) return false;
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
  }, [machines, eraId, factionId, tagId, canon, query, sort, lang, eras]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextEra = params.get("era");
    const nextFaction = params.get("faction");
    const nextTag = params.get("tag");
    const nextCanon = params.get("canon");
    const nextSort = params.get("sort") as SortKey | null;
    const nextQuery = params.get("q");
    if (nextEra && eras.some((era) => era.id === nextEra)) setEraId(nextEra);
    if (nextFaction && factions.some((faction) => faction.id === nextFaction)) setFactionId(nextFaction);
    if (nextTag && tags.some((tag) => tag.id === nextTag)) setTagId(nextTag);
    if (nextCanon && ["mainline", "side_story", "parallel", "game_original"].includes(nextCanon)) setCanon(nextCanon);
    if (nextSort && ["timeline", "name", "height"].includes(nextSort)) setSort(nextSort);
    if (nextQuery) setQuery(nextQuery);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eras, factions, tags]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string, empty = "all") => {
      if (value && value !== empty) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("era", eraId);
    setOrDelete("faction", factionId);
    setOrDelete("tag", tagId);
    setOrDelete("canon", canon);
    setOrDelete("sort", sort, "timeline");
    setOrDelete("q", query, "");
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [eraId, factionId, tagId, canon, query, sort]);

  const usedFactions = factions.filter((faction) => machines.some((m) => m.factionId === faction.id));
  const usedTags = tags.filter((tag) => machines.some((m) => m.tags.includes(tag.id)));
  const reset = () => {
    setEraId("all");
    setFactionId("all");
    setTagId("all");
    setCanon("all");
    setQuery("");
  };

  return (
    <div className="explorer container">
      <div className="explorer__bar">
        <div className="explorer__search">
          <SearchIcon size={16} />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.machineIndex.search}
            aria-label={dict.machineIndex.search}
          />
          <kbd className="explorer__kbd">/</kbd>
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
        <div className="explorer__meta-right">
          <div className="explorer__canon" role="group" aria-label={dict.machine.canon}>
            {(["all", "mainline", "side_story", "parallel"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`explorer__canon-btn ${canon === value ? "is-active" : ""}`}
                onClick={() => setCanon(value)}
                aria-pressed={canon === value}
              >
                {value === "all" ? dict.common.all : dict.canon[value]}
              </button>
            ))}
          </div>
          {(eraId !== "all" || factionId !== "all" || tagId !== "all" || canon !== "all" || query) && (
            <button type="button" className="text-btn" onClick={reset}>
              {dict.machineIndex.reset} ×
            </button>
          )}
        </div>
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
