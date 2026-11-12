#!/usr/bin/env node
/**
 * English coverage gate. The /en routes must never ship a Chinese paragraph
 * as a silent fallback: every displayable localized field needs an `en` value.
 * Source citations additionally need `labelEn` (and `noteEn` when a note exists).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const errors = [];
const cjk = /[\u3400-\u9fff\u3040-\u30ff]/;

const need = (label, value) => {
  if (!value || typeof value !== "object") {
    errors.push(`${label}: missing localized object`);
    return;
  }
  if (typeof value.en !== "string" || !value.en.trim()) errors.push(`${label}: missing en`);
};

const needList = (label, value) => {
  if (!Array.isArray(value?.en) || value.en.length === 0 || value.en.some((p) => !String(p).trim())) {
    errors.push(`${label}: missing en paragraph array`);
  }
};

const scanSources = (label, sources = []) => {
  sources.forEach((source, index) => {
    if (cjk.test(source.label) && !source.labelEn) errors.push(`${label}.sources[${index}]: missing labelEn`);
    if (source.note && cjk.test(source.note) && !source.noteEn) errors.push(`${label}.sources[${index}]: missing noteEn`);
  });
};

const machines = fs
  .readdirSync(path.join(root, "content/machines"))
  .filter((file) => file.endsWith(".json"))
  .map((file) => readJson(`content/machines/${file}`));

for (const machine of machines) {
  need(`machine ${machine.id}.summary`, machine.summary);
  needList(`machine ${machine.id}.description`, machine.description);
  if (machine.specs.armor) need(`machine ${machine.id}.specs.armor`, machine.specs.armor);
  machine.armament.forEach((arm, index) => need(`machine ${machine.id}.armament[${index}].name`, arm.name));
  scanSources(`machine ${machine.id}`, machine.sources);
  machine.edges.forEach((edge, index) => scanSources(`machine ${machine.id}.edges[${index}]`, edge.sources));
}

for (const character of readJson("content/characters.json")) {
  need(`character ${character.id}.role`, character.role);
  needList(`character ${character.id}.bio`, character.bio);
  for (const field of ["age", "rank", "origin"]) need(`character ${character.id}.${field}`, character[field]);
  (character.affiliations ?? []).forEach((affiliation, index) => {
    need(`character ${character.id}.affiliations[${index}].period`, affiliation.period);
  });
}

for (const event of readJson("content/events.json")) {
  need(`event ${event.id}.title`, event.title);
  need(`event ${event.id}.summary`, event.summary);
  needList(`event ${event.id}.detail`, event.detail);
  need(`event ${event.id}.outcome`, event.outcome);
  scanSources(`event ${event.id}`, event.sources);
}

for (const faction of readJson("content/factions.json")) {
  need(`faction ${faction.id}.description`, faction.description);
  if (faction.motto) need(`faction ${faction.id}.motto`, faction.motto);
}
for (const tag of readJson("content/tags.json")) {
  need(`tag ${tag.id}.description`, tag.description);
  needList(`tag ${tag.id}.detail`, tag.detail);
}
for (const work of readJson("content/works.json")) need(`work ${work.id}.summary`, work.summary);
for (const era of readJson("content/eras.json")) {
  need(`era ${era.id}.summary`, era.summary);
  if (era.note) need(`era ${era.id}.note`, era.note);
}
for (const place of readJson("content/places.json")) {
  need(`place ${place.id}.name`, place.name);
  need(`place ${place.id}.description`, place.description);
}
for (const era of readJson("content/atlas.json")) {
  need(`atlas ${era.eraId}.geography`, era.geography);
  if (era.layoutNote) need(`atlas ${era.eraId}.layoutNote`, era.layoutNote);
  era.nodes.forEach((node) => {
    need(`atlas ${era.eraId}.${node.id}.name`, node.name);
    if (node.note) need(`atlas ${era.eraId}.${node.id}.note`, node.note);
  });
  scanSources(`atlas ${era.eraId}`, era.sources);
}

if (errors.length > 0) {
  console.error(`English coverage failed: ${errors.length} issue(s)\n`);
  errors.slice(0, 100).forEach((error) => console.error(`  · ${error}`));
  if (errors.length > 100) console.error(`  … and ${errors.length - 100} more`);
  process.exit(1);
}
console.log(`✓ English coverage complete: ${machines.length} machines, 114 characters, 69 events, 12 eras, 156 atlas nodes, all source citations.`);
