import { getBundle } from "./content";
import { normalizeQuery } from "./format";
import { pick, pickList } from "./i18n";
import type { Lang } from "./schema";
import type { SearchEntry } from "./search";

export function buildSearchIndex(lang: Lang): SearchEntry[] {
  const bundle = getBundle();
  const entries: SearchEntry[] = [];

  const add = (entry: Omit<SearchEntry, "haystack" | "keywords"> & { keywords: string[] }) => {
    const { keywords, ...rest } = entry;
    entries.push({
      ...rest,
      haystack: normalizeQuery(
        [entry.title, entry.subtitle, entry.meta, ...keywords].join(" "),
      ).slice(0, 900),
    });
  };

  for (const m of bundle.machines) {
    const era = bundle.eras.find((e) => e.id === m.eraId);
    const faction = bundle.factions.find((f) => f.id === m.factionId);
    const pilots = m.pilots
      .map((pilot) => bundle.characters.find((character) => character.id === pilot.characterId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const tagNames = m.tags
      .map((id) => bundle.tags.find((tag) => tag.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .flatMap((tag) => [tag.name.zh, tag.name.ja, tag.name.en]);
    add({
      type: "machine",
      id: m.id,
      href: `/machines/${m.id}`,
      title: pick(m.name, lang),
      subtitle: m.modelCode,
      meta: `${era?.code ?? ""} · ${faction ? pick(faction.name, lang) : ""}`,
      keywords: [
        m.name.zh,
        m.name.ja,
        m.name.en,
        m.modelCode,
        ...m.aliases,
        ...pilots.flatMap((pilot) => [pilot.name.zh, pilot.name.ja, pilot.name.en]),
        ...tagNames,
        era?.code ?? "",
        era ? pick(era.name, lang) : "",
        faction ? pick(faction.name, lang) : "",
        m.summary.zh,
        m.summary.ja ?? "",
        m.summary.en ?? "",
        ...(m.description.zh ?? []).slice(0, 1),
        ...(m.description.ja ?? []).slice(0, 1),
        ...(m.description.en ?? []).slice(0, 1),
        ...m.armament.flatMap((arm) => [arm.name.zh, arm.name.ja ?? "", arm.name.en ?? ""]),
      ],
    });
  }

  for (const c of bundle.characters) {
    const faction = bundle.factions.find((f) => f.id === c.factionId);
    add({
      type: "character",
      id: c.id,
      href: `/characters/${c.id}`,
      title: pick(c.name, lang),
      subtitle: pick(c.role, lang),
      meta: faction ? pick(faction.name, lang) : "",
      keywords: [
        c.name.zh,
        c.name.ja,
        c.name.en,
        ...c.aliases,
        c.role.zh,
        c.role.ja ?? "",
        c.role.en ?? "",
        c.origin ? `${c.origin.zh} ${c.origin.ja ?? ""} ${c.origin.en ?? ""}` : "",
        c.rank ? `${c.rank.zh} ${c.rank.ja ?? ""} ${c.rank.en ?? ""}` : "",
        ...(c.bio.zh ?? []).slice(0, 1),
        ...(c.bio.ja ?? []).slice(0, 1),
        ...(c.bio.en ?? []).slice(0, 1),
      ],
    });
  }

  for (const f of bundle.factions) {
    add({
      type: "faction",
      id: f.id,
      href: `/factions/${f.id}`,
      title: pick(f.name, lang),
      subtitle: f.short,
      meta: f.founded ?? "",
      keywords: [f.name.zh, f.name.ja, f.name.en, f.short, pick(f.description, lang), f.motto ? pick(f.motto, lang) : ""],
    });
  }

  for (const e of bundle.events) {
    const era = bundle.eras.find((x) => x.id === e.eraId);
    add({
      type: "event",
      id: e.id,
      href: `/events/${e.id}`,
      title: pick(e.title, lang),
      subtitle: era?.code ?? "",
      meta: `${era?.code ?? ""}${String(e.date.year).padStart(4, "0")}`,
      keywords: [
        e.title.zh,
        e.title.ja,
        e.summary.zh,
        e.summary.ja ?? "",
        e.summary.en ?? "",
        ...(e.detail.zh ?? []).slice(0, 1),
        ...(e.detail.ja ?? []).slice(0, 1),
        ...(e.detail.en ?? []).slice(0, 1),
        ...e.factionIds.flatMap((id) => {
          const faction = bundle.factions.find((item) => item.id === id);
          return faction ? [faction.name.zh, faction.name.ja, faction.name.en, faction.short] : [];
        }),
        ...e.machineIds.flatMap((id) => {
          const machine = bundle.machines.find((item) => item.id === id);
          return machine ? [machine.name.zh, machine.name.ja, machine.name.en, machine.modelCode] : [];
        }),
      ],
    });
  }

  for (const t of bundle.tags) {
    add({
      type: "tag",
      id: t.id,
      href: `/glossary#tag-${t.id}`,
      title: pick(t.name, lang),
      subtitle: t.category.toUpperCase(),
      meta: `${bundle.machines.filter((m) => m.tags.includes(t.id)).length} MS`,
      keywords: [
        t.name.zh,
        t.name.ja,
        t.name.en,
        t.description.zh,
        t.description.ja,
        t.description.en ?? "",
        t.category,
        ...t.detail.zh.slice(0, 1),
        ...t.detail.ja.slice(0, 1),
        ...(t.detail.en ?? []).slice(0, 1),
      ],
    });
  }

  for (const w of bundle.works) {
    add({
      type: "work",
      id: w.id,
      href: `/archive#works`,
      title: pick(w.title, lang),
      subtitle: String(w.year),
      meta: pick(w.title, lang === "en" ? "ja" : lang === "ja" ? "zh" : "ja"),
      keywords: [
        w.title.zh,
        w.title.ja,
        w.title.en,
        String(w.year),
        w.summary.zh,
        w.summary.ja ?? "",
        w.summary.en ?? "",
      ],
    });
  }

  return entries;
}
