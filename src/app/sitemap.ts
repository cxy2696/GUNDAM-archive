export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { getBundle } from "@/lib/content";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cxy2696.github.io/GUNDAM-archive").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const bundle = getBundle();
  const staticPaths = ["", "/machines", "/tech-tree", "/timeline", "/chronology", "/map", "/archive", "/search", "/about"];
  const lastModified = new Date("2026-11-11T00:00:00.000Z");

  const entries: MetadataRoute.Sitemap = [];
  for (const lang of ["zh", "ja"]) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${lang}${path}/`,
        lastModified,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/machines" ? 0.9 : 0.7,
      });
    }
    for (const machine of bundle.machines) {
      entries.push({
        url: `${base}/${lang}/machines/${machine.id}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const faction of bundle.factions) {
      entries.push({
        url: `${base}/${lang}/factions/${faction.id}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const character of bundle.characters) {
      entries.push({
        url: `${base}/${lang}/characters/${character.id}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
