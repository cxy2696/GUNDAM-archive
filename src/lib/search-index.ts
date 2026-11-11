import { getBundle } from "./content";
import { normalizeQuery } from "./format";
import { pick } from "./i18n";
import type { Lang } from "./schema";
import type { SearchEntry } from "./search";

export function buildSearchIndex(lang: Lang): SearchEntry[] {
  const bundle = getBundle();
  const entries: SearchEntry[] = [];

  const add = (entry: Omit<SearchEntry, "haystack">) => {
    entries.push({
      ...entry,
      haystack: normalizeQuery(
        [entry.title, entry.subtitle, entry.meta, ...entry.keywords].join(" "),
      ),
    });
  };

  for (const m of bundle.machines) {
    const era = bundle.eras.find((e) => e.id === m.eraId);
    const faction = bundle.factions.find((f) => f.id === m.factionId);
    add({
      type: "machine",
      id: m.id,
      href: `/machines/${m.id}`,
      title: pick(m.name, lang),
      subtitle: m.modelCode,
      meta: `${era?.code ?? ""} · ${faction ? pick(faction.name, lang) : ""}`,
      keywords: [m.name.zh, m.name.ja, m.name.en, m.modelCode, ...m.aliases],
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
      keywords: [c.name.zh, c.name.ja, c.name.en],
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
      keywords: [f.name.zh, f.name.ja, f.name.en, f.short],
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
      keywords: [e.title.zh, e.title.ja],
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
      keywords: [t.name.zh, t.name.ja, t.name.en, t.description.zh, t.description.ja],
    });
  }

  for (const w of bundle.works) {
    add({
      type: "work",
      id: w.id,
      href: `/archive#works`,
      title: pick(w.title, lang),
      subtitle: String(w.year),
      meta: pick(w.title, lang === "zh" ? "ja" : "zh"),
      keywords: [w.title.zh, w.title.ja, w.title.en, String(w.year)],
    });
  }

  return entries;
}
