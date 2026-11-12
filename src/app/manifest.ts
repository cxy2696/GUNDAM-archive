export const dynamic = "force-static";

import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GUNDAM Archive — Mobile Suit Dossier",
    short_name: "GUNDAM",
    description: "An interactive, source-traced mobile suit archive.",
    start_url: `${base}/zh/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#020805",
    theme_color: "#020805",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
