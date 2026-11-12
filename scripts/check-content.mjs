#!/usr/bin/env node
/**
 * Content redundancy audit. Complements schema validation: catches copy-paste
 * text, duplicate relations/sources, and event summaries that merely repeat
 * the first detail paragraph.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const machineFiles = fs.readdirSync(path.join(root, "content/machines")).filter((file) => file.endsWith(".json"));
const machines = machineFiles.map((file) => readJson(`content/machines/${file}`));
const characters = readJson("content/characters.json");
const events = readJson("content/events.json");
const factions = readJson("content/factions.json");
const tags = readJson("content/tags.json");
const works = readJson("content/works.json");
const eras = readJson("content/eras.json");

const errors = [];
const seenText = new Map();
const seenName = new Map();
const paragraphs = new Map();

function registerText(kind, id, lang, text) {
  if (typeof text !== "string" || !text.trim()) return;
  const value = text.trim();
  const key = `${lang}:${value}`;
  if (seenText.has(key)) {
    errors.push(`duplicate ${kind} text (${lang}): ${id} repeats ${seenText.get(key)}`);
  } else {
    seenText.set(key, id);
  }
}
function registerParagraph(kind, id, lang, text) {
  if (typeof text !== "string" || text.trim().length < 30) return;
  const value = text.trim();
  const key = `${lang}:${value}`;
  if (paragraphs.has(key)) {
    errors.push(`duplicate paragraph (${lang}): ${id} repeats ${paragraphs.get(key)}`);
  } else {
    paragraphs.set(key, id);
  }
}
function registerName(kind, item, id) {
  const name = item.name ?? item.title;
  if (!name) return;
  for (const lang of ["zh", "ja"]) {
    const value = name[lang];
    if (!value) continue;
    const key = `${kind}:${lang}:${value}`;
    if (seenName.has(key)) errors.push(`duplicate ${kind} name (${lang}): ${id} repeats ${seenName.get(key)}`);
    else seenName.set(key, id);
  }
}

for (const machine of machines) {
  registerName("machine", machine, machine.id);
  for (const lang of ["zh", "ja"]) {
    registerText("machine summary", machine.id, lang, machine.summary?.[lang]);
    (machine.description?.[lang] ?? []).forEach((p) => registerParagraph("machine description", machine.id, lang, p));
  }
  const sourceKeys = machine.sources?.map((s) => `${s.label}|${s.url ?? ""}`) ?? [];
  if (new Set(sourceKeys).size !== sourceKeys.length) errors.push(`duplicate source in machine ${machine.id}`);
}
for (const character of characters) {
  registerName("character", character, character.id);
  for (const lang of ["zh", "ja"]) {
    (character.bio?.[lang] ?? []).forEach((p) => registerParagraph("character bio", character.id, lang, p));
  }
  const relationKeys = (character.relations ?? []).map((r) => `${r.targetId}|${r.type}`);
  if (new Set(relationKeys).size !== relationKeys.length) errors.push(`duplicate relation in character ${character.id}`);
  const sourceKeys = character.sources?.map((s) => `${s.label}|${s.url ?? ""}`) ?? [];
  if (new Set(sourceKeys).size !== sourceKeys.length) errors.push(`duplicate source in character ${character.id}`);
}
for (const event of events) {
  registerName("event", event, event.id);
  for (const lang of ["zh", "ja"]) {
    registerText("event summary", event.id, lang, event.summary?.[lang]);
    (event.detail?.[lang] ?? []).forEach((p) => registerParagraph("event detail", event.id, lang, p));
  }
  const sourceKeys = event.sources?.map((s) => `${s.label}|${s.url ?? ""}`) ?? [];
  if (new Set(sourceKeys).size !== sourceKeys.length) errors.push(`duplicate source in event ${event.id}`);
}
for (const faction of factions) {
  registerName("faction", faction, faction.id);
  for (const lang of ["zh", "ja"]) registerText("faction description", faction.id, lang, faction.description?.[lang]);
  const relationKeys = (faction.relations ?? []).map((r) => `${r.targetId}|${r.type}`);
  if (new Set(relationKeys).size !== relationKeys.length) errors.push(`duplicate relation in faction ${faction.id}`);
}
for (const tag of tags) {
  registerName("tag", tag, tag.id);
  for (const lang of ["zh", "ja"]) {
    registerText("tag description", tag.id, lang, tag.description?.[lang]);
    (tag.detail?.[lang] ?? []).forEach((p) => registerParagraph("tag detail", tag.id, lang, p));
  }
}
for (const work of works) {
  registerName("work", work, work.id);
  for (const lang of ["zh", "ja"]) registerText("work summary", work.id, lang, work.summary?.[lang]);
}
for (const era of eras) registerName("era", era, era.id);

const grams = (text) => {
  const clean = String(text ?? "").replace(/\s+/g, "");
  const out = new Set();
  for (let i = 0; i < clean.length - 3; i += 1) out.add(clean.slice(i, i + 4));
  return out;
};
const jaccard = (a, b) => {
  const A = grams(a);
  const B = grams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let overlap = 0;
  for (const value of A) if (B.has(value)) overlap += 1;
  return overlap / (A.size + B.size - overlap);
};

for (const event of events) {
  for (const lang of ["zh", "ja"]) {
    const first = event.detail?.[lang]?.[0];
    if (!first) continue;
    const score = jaccard(event.summary?.[lang], first);
    if (score >= 0.5) {
      errors.push(`event ${event.id} (${lang}) summary/detail overlap ${(score * 100).toFixed(0)}% (max 50%)`);
    }
  }
}

console.log(`Content redundancy audit: ${machines.length} machines, ${characters.length} characters, ${events.length} events, ${factions.length} factions, ${tags.length} tags, ${works.length} works, ${eras.length} eras.`);
if (errors.length > 0) {
  console.error(`\n${errors.length} redundancy issue(s):`);
  errors.slice(0, 80).forEach((error) => console.error(`  ${error}`));
  if (errors.length > 80) console.error(`  ... and ${errors.length - 80} more`);
  process.exit(1);
}
console.log("\n✓ no duplicate names, summaries, paragraphs, relations or sources; event summaries do not repeat detail");
