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

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

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

// Structural documentation checks. These keep the docs from silently drifting
// away from the content snapshot and the released version.
const errors = [];
const requiredDocs = [
  "README.md",
  "README.ja.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "docs/README.md",
  "docs/ARCHITECTURE.md",
  "docs/OPERATIONS.md",
  "docs/CONTENT_GUIDE.md",
  "docs/DATA_DICTIONARY.md",
  "docs/DESIGN_SYSTEM.md",
  "docs/ROADMAP.md",
  "docs/GOVERNANCE.md",
  "docs/EDITORIAL.md",
  "docs/CHRONOLOGY.md",
  "docs/MACHINE_COVERAGE.md",
  "docs/GLOSSARY.md",
  "docs/ASSET_PIPELINE.md",
  "docs/DATA_SOURCES.md",
];
for (const file of requiredDocs) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required document: ${file}`);
}

const pkg = readJson("package.json");
const readme = readText("README.md");
const changelog = readText("CHANGELOG.md");
const roadmap = readText("docs/ROADMAP.md");
const docsIndex = readText("docs/README.md");

const counts = {
  machines: fs.readdirSync(path.join(root, "content/machines")).filter((file) => file.endsWith(".json")).length,
  eras: readJson("content/eras.json").length,
  characters: readJson("content/characters.json").length,
  works: readJson("content/works.json").length,
  events: readJson("content/events.json").length,
  factions: readJson("content/factions.json").length,
  tags: readJson("content/tags.json").length,
  edges: fs
    .readdirSync(path.join(root, "content/machines"))
    .filter((file) => file.endsWith(".json"))
    .reduce((sum, file) => sum + (readJson(`content/machines/${file}`).edges?.length ?? 0), 0),
  atlasNodes: readJson("content/atlas.json").reduce((sum, era) => sum + era.nodes.length, 0),
};

const expected = [
  [`${counts.machines} 台机体`, "machine count"],
  [`${counts.eras} 个纪元`, "era count"],
  [`${counts.characters} 位人物`, "character count"],
  [`${counts.works} 部作品`, "work count"],
  [`${counts.events} 条事件`, "event count"],
  [`${counts.factions} 个势力`, "faction count"],
  [`${counts.tags} 个受控标签`, "tag count"],
  [`${counts.edges} 条谱系边`, "lineage edge count"],
  [`${counts.atlasNodes} 个地图节点`, "atlas node count"],
];
for (const [needle, label] of expected) {
  if (!readme.includes(needle)) errors.push(`README is missing the current ${label}: "${needle}"`);
}

if (!readme.includes(`v${pkg.version}`)) errors.push(`README does not mention package version v${pkg.version}`);
if (!changelog.includes(`## [${pkg.version}]`)) errors.push(`CHANGELOG has no section for version ${pkg.version}`);
if (!roadmap.includes(`v${pkg.version}`)) errors.push(`ROADMAP does not mention package version v${pkg.version}`);
if (!docsIndex.includes("OPERATIONS.md")) errors.push("docs/README.md does not link the operations runbook");

for (const file of ["README.md", "README.ja.md"]) {
  const headings = readText(file).match(/^## .+$/gm) ?? [];
  const duplicates = headings.filter((heading, index) => headings.indexOf(heading) !== index);
  if (duplicates.length > 0) {
    errors.push(`${file} has duplicate section headings: ${[...new Set(duplicates)].join(", ")}`);
  }
}

const relative = files.map((file) => path.relative(root, file)).sort();
console.log(`Checked ${relative.length} Markdown files against ${counts.machines} machines / ${counts.events} events / ${counts.atlasNodes} atlas nodes.`);
if (missing.length > 0) {
  console.error(`\n${missing.length} broken local link(s):`);
  missing.forEach((item) => console.error(`  ${item}`));
}
if (errors.length > 0) {
  console.error(`\n${errors.length} documentation consistency error(s):`);
  errors.forEach((item) => console.error(`  ${item}`));
}
if (missing.length > 0 || errors.length > 0) process.exit(1);
console.log("\n✓ all local Markdown links resolve; required docs, version and content snapshot are current");
