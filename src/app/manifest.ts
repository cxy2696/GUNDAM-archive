export const dynamic = "force-static";

import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GAIA Archive — 机动战士档案",
    short_name: "GAIA",
    description: "可交互、可追溯的机动战士档案馆。",
    start_url: `${base}/zh/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#060b10",
    theme_color: "#060b10",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
