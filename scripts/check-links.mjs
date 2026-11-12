#!/usr/bin/env node
/**
 * Static-export link audit.
 * Checks every internal href in out/**\/*.html resolves to an exported file and,
 * when a fragment is present, that the target document contains that id/name.
 * External links are counted but not fetched (no network in CI).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
if (!fs.existsSync(outDir)) {
  console.error("out/ not found — run npm run build first.");
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(outDir);

// GitHub Pages builds with a /<repo> base path; detect it from the exported
// asset URLs when the caller did not pass NEXT_PUBLIC_BASE_PATH.
let basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
if (!basePath && htmlFiles.length > 0) {
  const sample = fs.readFileSync(htmlFiles[0], "utf8");
  const detected = sample.match(/(?:href|src)="\/([^/"]+)\/_next\//);
  if (detected) basePath = `/${detected[1]}`;
}
const stripBase = (value) => {
  if (!basePath) return value;
  if (value === basePath) return "/";
  return value.startsWith(`${basePath}/`) ? value.slice(basePath.length) : value;
};

const idsCache = new Map();
function idsFor(file) {
  if (idsCache.has(file)) return idsCache.get(file);
  const html = fs.readFileSync(file, "utf8");
  const ids = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) ids.add(match[1]);
  for (const match of html.matchAll(/<a[^>]+name="([^"]+)"/g)) ids.add(match[1]);
  idsCache.set(file, ids);
  return ids;
}

function resolveTarget(sourceFile, href) {
  const clean = stripBase(href.split("#")[0].split("?")[0]);
  if (!clean.startsWith("/")) {
    const base = path.dirname(sourceFile);
    const resolved = path.resolve(base, clean);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      return path.join(resolved, "index.html");
    }
    return resolved;
  }
  let target = path.join(outDir, clean);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  if (!path.extname(target)) target = path.join(target, "index.html");
  return target;
}

let internal = 0;
let external = 0;
let hashes = 0;
const missing = [];
const badHashes = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const raw = match[1];
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) {
      external += 1;
      continue;
    }
    if (raw.startsWith("#")) continue;
    if (raw.startsWith("/_next/") || raw.endsWith(".css") || raw.endsWith(".js") || raw.endsWith(".png") || raw.endsWith(".svg") || raw.endsWith(".webmanifest") || raw.endsWith(".xml")) continue;
    internal += 1;
    const target = resolveTarget(file, raw);
    if (!fs.existsSync(target)) {
      missing.push({ page: path.relative(outDir, file), href: raw });
      continue;
    }
    const hash = raw.includes("#") ? decodeURIComponent(raw.split("#")[1] ?? "") : "";
    if (hash) {
      hashes += 1;
      if (target.endsWith(".html") && !idsFor(target).has(hash)) {
        badHashes.push({ page: path.relative(outDir, file), href: raw });
      }
    }
  }
}

if (basePath) console.log(`Base path: ${basePath}`);
console.log(`Checked ${htmlFiles.length} HTML files`);
console.log(`  internal links: ${internal}`);
console.log(`  external links: ${external}`);
console.log(`  fragment links: ${hashes}`);

if (missing.length || badHashes.length) {
  if (missing.length) {
    console.error(`\n${missing.length} broken internal link(s):`);
    for (const item of missing.slice(0, 80)) console.error(`  ${item.page} -> ${item.href}`);
  }
  if (badHashes.length) {
    console.error(`\n${badHashes.length} missing fragment target(s):`);
    for (const item of badHashes.slice(0, 80)) console.error(`  ${item.page} -> ${item.href}`);
  }
  process.exit(1);
}
console.log("\n✓ every internal link and fragment resolves");
