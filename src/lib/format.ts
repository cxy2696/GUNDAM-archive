import type { Lang, StoryDate } from "./schema";

export function padYear(year: number): string {
  return String(year).padStart(4, "0");
}

export function formatStoryDate(date: StoryDate, eraCode: string, lang: Lang): string {
  const y = `${eraCode}${padYear(date.year)}`;
  if (date.precision === "year" || !date.month) return y;
  const m = `.${String(date.month).padStart(2, "0")}`;
  if (date.precision === "month" || !date.day) return `${y}${m}`;
  return `${y}${m}.${String(date.day).padStart(2, "0")}`;
}

export function dateFraction(date: StoryDate): number {
  const month = date.month ?? 1;
  const day = date.day ?? 1;
  return date.year + (month - 1) / 12 + (day - 1) / 365;
}

export function formatNumber(value: number, lang: Lang, digits = 1): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(digits);
  return lang === "zh" ? rounded : rounded;
}

export function formatSpecValue(
  field: "heightOverall" | "heightHead" | "weightEmpty" | "weightFull" | "powerOutput" | "thrust" | "sensorRadius",
  value: number | null | undefined,
  lang: Lang,
): string {
  if (value === null || value === undefined) return lang === "zh" ? "资料未载" : lang === "ja" ? "資料未載" : "Not documented";
  switch (field) {
    case "heightOverall":
    case "heightHead":
    case "sensorRadius":
      return `${formatNumber(value, lang, 2)} m`;
    case "weightEmpty":
    case "weightFull":
      return `${formatNumber(value, lang, 1)} t`;
    case "powerOutput":
      return `${formatNumber(value, lang, 0)} kW`;
    case "thrust":
      return `${formatNumber(value, lang, 0)} kgf`;
  }
}

/** A human reference for the height, as required by the readability rules. */
export function heightReference(height: number | null | undefined, lang: Lang): string | null {
  if (!height) return null;
  const floors = Math.max(1, Math.round(height / 3));
  return lang === "zh" ? `约 ${floors} 层楼高` : lang === "ja" ? `約${floors}階建て相当` : `About ${floors} storeys tall`;
}

export const specFields = [
  "heightOverall",
  "heightHead",
  "weightEmpty",
  "weightFull",
  "powerOutput",
  "thrust",
  "sensorRadius",
] as const;
export type SpecField = (typeof specFields)[number];

export function canonAccent(canon: string): string {
  switch (canon) {
    case "mainline":
      return "var(--accent-quantum)";
    case "side_story":
      return "var(--accent-warn)";
    case "parallel":
      return "var(--accent-violet)";
    default:
      return "var(--text-secondary)";
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ν/g, "nu")
    .replace(/α/g, "alpha")
    .replace(/β/g, "beta")
    .replace(/γ/g, "gamma")
    .replace(/δ/g, "delta")
    .replace(/ε/g, "epsilon")
    .replace(/ζ/g, "zeta")
    .replace(/η/g, "eta")
    .replace(/θ/g, "theta")
    .replace(/ξ/g, "xi")
    .replace(/σ/g, "sigma")
    .replace(/φ/g, "phi")
    .replace(/ω/g, "omega")
    .replace(/[\s\-_.·・]/g, "")
    .trim();
}
