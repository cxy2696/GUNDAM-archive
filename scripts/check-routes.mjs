#!/usr/bin/env node
/**
 * Export route audit.
 * Every URL in out/sitemap.xml must have a static HTML file with a title and
 * a <main> landmark. This catches pages that build but are not actually
 * reachable or render without content.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const sitemapFile = path.join(outDir, "sitemap.xml");
if (!fs.existsSync(sitemapFile)) {
  console.error("out/sitemap.xml not found — run npm run build first.");
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapFile, "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length === 0) {
  console.error("sitemap.xml contains no <loc> entries.");
  process.exit(1);
}

const missing = [];
const noTitle = [];
const noMain = [];
const basePrefixes = ["/GUNDAM-archive", ""];

for (const url of urls) {
  let pathname = "";
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }
  let relative = pathname;
  for (const prefix of basePrefixes) {
    if (prefix && relative.startsWith(`${prefix}/`)) {
      relative = relative.slice(prefix.length);
      break;
    }
  }
  relative = relative.replace(/^\/+/, "");
  const target = path.join(outDir, relative, relative.endsWith(".html") ? "" : "index.html");
  const targetFile = relative.endsWith(".html") ? path.join(outDir, relative) : target;
  if (!fs.existsSync(targetFile)) {
    missing.push(url);
    continue;
  }
  const html = fs.readFileSync(targetFile, "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
  if (!title) noTitle.push(url);
  if (!/<main[\s>]/.test(html)) noMain.push(url);
}

console.log(`Checked ${urls.length} sitemap routes`);
console.log(`  html files: ${fs.readdirSync(outDir, { recursive: true }).filter((file) => String(file).endsWith(".html")).length}`);
if (missing.length || noTitle.length || noMain.length) {
  if (missing.length) {
    console.error(`\n${missing.length} route(s) missing an export:`);
    missing.slice(0, 40).forEach((url) => console.error(`  ${url}`));
  }
  if (noTitle.length) {
    console.error(`\n${noTitle.length} route(s) without a title:`);
    noTitle.slice(0, 40).forEach((url) => console.error(`  ${url}`));
  }
  if (noMain.length) {
    console.error(`\n${noMain.length} route(s) without a <main> landmark:`);
    noMain.slice(0, 40).forEach((url) => console.error(`  ${url}`));
  }
  process.exit(1);
}
console.log("\n✓ every sitemap route has an exported document with title and <main>");
