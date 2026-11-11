import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "out" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".md")) files.push(full);
  }
}

walk(root);
const missing = [];
const linkPattern = /\[[^\]]*\]\(([^)\s]+)\)/g;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  let match;
  while ((match = linkPattern.exec(text))) {
    const raw = match[1].replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("mailto:")) continue;
    const clean = decodeURIComponent(raw.split("#")[0].split("?")[0]);
    if (!clean) continue;
    const target = clean.startsWith("/")
      ? path.join(root, clean)
      : path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) {
      missing.push(`${path.relative(root, file)} -> ${raw}`);
    }
  }
}

const relative = files.map((file) => path.relative(root, file)).sort();
console.log(`Checked ${relative.length} Markdown files:`);
relative.forEach((file) => console.log(`  ${file}`));

if (missing.length > 0) {
  console.error(`\n${missing.length} broken local link(s):`);
  missing.forEach((item) => console.error(`  ${item}`));
  process.exit(1);
}
console.log("\n✓ all local Markdown links resolve");
