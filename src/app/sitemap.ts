export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { getBundle } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gaia-archive.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const bundle = getBundle();
  const staticPaths = ["", "/machines", "/tech-tree", "/timeline", "/map", "/archive", "/search", "/about"];
  const lastModified = new Date("2026-11-11T00:00:00.000Z");

  const entries: MetadataRoute.Sitemap = [];
  for (const lang of ["zh", "ja"]) {
    for (const path of staticPaths) {
      entries.push({
        url: new URL(`/${lang}${path}/`, base).toString(),
        lastModified,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/machines" ? 0.9 : 0.7,
      });
    }
    for (const machine of bundle.machines) {
      entries.push({
        url: new URL(`/${lang}/machines/${machine.id}/`, base).toString(),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const faction of bundle.factions) {
      entries.push({
        url: new URL(`/${lang}/factions/${faction.id}/`, base).toString(),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const character of bundle.characters) {
      entries.push({
        url: new URL(`/${lang}/characters/${character.id}/`, base).toString(),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
