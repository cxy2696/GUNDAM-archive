export const dynamic = "force-static";

import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gaia-archive.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: new URL(base).origin,
  };
}
