import { normalizeQuery } from "./format";
import type { Dictionary } from "./i18n";

export type SearchType = "machine" | "tag" | "character" | "faction" | "event" | "work";

export type SearchEntry = {
  type: SearchType;
  id: string;
  href: string;
  title: string;
  subtitle: string;
  meta: string;
  keywords: string[];
  haystack: string;
};

export function searchEntries(
  entries: SearchEntry[],
  query: string,
  dict: Dictionary,
  limit = 18,
): SearchEntry[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  const scored = entries
    .map((entry) => {
      const title = normalizeQuery(entry.title);
      const subtitle = normalizeQuery(entry.subtitle);
      let score = 0;
      if (title === q || subtitle === q) score = 120;
      else if (title.startsWith(q)) score = 90;
      else if (subtitle.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 70;
      else if (entry.haystack.includes(q)) score = 40;
      if (score === 0) return null;
      if (entry.type === "machine") score += 4;
      return { entry, score };
    })
    .filter((x): x is { entry: SearchEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return scored.slice(0, limit).map((x) => x.entry);
}

export function groupResults(entries: SearchEntry[]): { type: SearchType; items: SearchEntry[] }[] {
  const order: SearchType[] = ["machine", "tag", "character", "faction", "event", "work"];
  return order
    .map((type) => ({ type, items: entries.filter((e) => e.type === type) }))
    .filter((g) => g.items.length > 0);
}

export const searchTypeLabel = (dict: Dictionary, type: SearchType) => dict.search.groups[type];
