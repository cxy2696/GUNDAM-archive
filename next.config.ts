import type { NextConfig } from "next";

/**
 * The site is a fully static export so it can live on GitHub Pages, Cloudflare
 * Pages, S3 or any dumb file host. Dynamic concerns (search, viewer state) run
 * entirely client-side; content is compiled at build time from /content.
 *
 * For a project page on GitHub Pages set NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
