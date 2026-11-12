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
  haystack: string;
};

const TYPE_WEIGHT: Record<SearchType, number> = {
  machine: 12,
  event: 8,
  character: 7,
  faction: 5,
  tag: 4,
  work: 3,
};

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return dp[b.length];
}

function fuzzy(query: string, target: string): number {
  if (query.length < 4 || target.length < 3) return 0;
  if (!/^[a-z0-9]+$/.test(query)) return 0;
  const distance = editDistance(query, target.slice(0, query.length + 2));
  if (distance <= 1) return 42;
  if (distance === 2 && query.length >= 6) return 22;
  return 0;
}

/**
 * Ranked search: exact/prefix title matches dominate, then alias/model code
 * matches, then multi-token keyword hits. A small fuzzy pass catches typos in
 * Latin model codes and character names.
 */
export function searchEntries(
  entries: SearchEntry[],
  query: string,
  dict: Dictionary,
  limit = 18,
): SearchEntry[] {
  const raw = query.trim().toLowerCase();
  const q = normalizeQuery(query);
  if (!q) return [];
  const tokens = raw.split(/[\s\-_.·・/]+/).map((token) => normalizeQuery(token)).filter(Boolean);
  const scored = entries
    .map((entry) => {
      const title = normalizeQuery(entry.title);
      const subtitle = normalizeQuery(entry.subtitle);
      let score = 0;
      if (title === q) score = 260;
      else if (subtitle === q) score = 230;
      else if (title.startsWith(q)) score = 190;
      else if (subtitle.startsWith(q)) score = 170;
      else if (title.includes(q)) score = 130;
      else if (subtitle.includes(q)) score = 108;
      else if (entry.haystack.includes(q)) score = 66;

      if (tokens.length > 1) {
        const hit = tokens.filter((token) => entry.haystack.includes(token)).length;
        if (hit === tokens.length) score = Math.max(score, 96 + tokens.length * 6);
        else if (hit > 0) score = Math.max(score, 34 + hit * 8);
      }
      score += fuzzy(q, title) || fuzzy(q, subtitle);
      if (score === 0) return null;
      score += TYPE_WEIGHT[entry.type];
      // Favor compact titles when scores tie: "ν" before "ν高达（初期型）".
      score -= Math.min(12, Math.abs(entry.title.length - q.length) * 0.6);
      return { entry, score };
    })
    .filter((item): item is { entry: SearchEntry; score: number } => item !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "zh"));
  void dict;
  return scored.slice(0, limit).map((item) => item.entry);
}

export function groupResults(entries: SearchEntry[]): { type: SearchType; items: SearchEntry[] }[] {
  const order: SearchType[] = ["machine", "tag", "character", "faction", "event", "work"];
  return order
    .map((type) => ({ type, items: entries.filter((entry) => entry.type === type) }))
    .filter((group) => group.items.length > 0);
}

export const searchTypeLabel = (dict: Dictionary, type: SearchType) => dict.search.groups[type];
