import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  bundleSchema,
  machineSchema,
  validateBundle,
  type Bundle,
  type Machine,
} from "./schema";

const contentDir = path.join(process.cwd(), "content");

function readJson(file: string): unknown {
  const full = path.join(contentDir, file);
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (error) {
    throw new Error(`无法读取或解析 content/${file}: ${(error as Error).message}`);
  }
}

function parseFile<T>(file: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(readJson(file));
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`content/${file} 未通过 schema 校验:\n${issues}`);
  }
  return result.data;
}

function readArray<T>(file: string, schema: z.ZodType<T>): T[] {
  const raw = readJson(file);
  if (!Array.isArray(raw)) throw new Error(`content/${file} 必须是数组`);
  return raw.map((_, index) => {
    const item = (raw as unknown[])[index];
    const result = schema.safeParse(item);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("\n");
      throw new Error(`content/${file}[${index}] 未通过 schema 校验:\n${issues}`);
    }
    return result.data;
  });
}

let cached: Bundle | null = null;

export function getBundle(): Bundle {
  if (cached) return cached;

  const machineFiles = fs
    .readdirSync(path.join(contentDir, "machines"))
    .filter((file) => file.endsWith(".json"))
    .sort();

  const bundle = bundleSchema.parse({
    eras: readArray("eras.json", bundleSchema.shape.eras.element),
    factions: readArray("factions.json", bundleSchema.shape.factions.element),
    characters: readArray("characters.json", bundleSchema.shape.characters.element),
    works: readArray("works.json", bundleSchema.shape.works.element),
    places: readArray("places.json", bundleSchema.shape.places.element),
    events: readArray("events.json", bundleSchema.shape.events.element),
    tags: readArray("tags.json", bundleSchema.shape.tags.element),
    machines: machineFiles.map((file) =>
      parseFile(`machines/${file}`, machineSchema as z.ZodType<Machine>),
    ),
  });

  const errors = validateBundle(bundle);
  if (errors.length > 0) {
    throw new Error(`内容交叉引用校验失败:\n${errors.map((e) => `  · ${e}`).join("\n")}`);
  }

  bundle.machines.sort(
    (a, b) =>
      (bundle.eras.find((e) => e.id === a.eraId)?.order ?? 0) -
        (bundle.eras.find((e) => e.id === b.eraId)?.order ?? 0) ||
      a.firstAppear.year - b.firstAppear.year ||
      a.modelCode.localeCompare(b.modelCode),
  );
  bundle.eras.sort((a, b) => a.order - b.order);
  bundle.events.sort(
    (a, b) =>
      a.date.year - b.date.year ||
      (a.date.month ?? 0) - (b.date.month ?? 0) ||
      (a.date.day ?? 0) - (b.date.day ?? 0),
  );

  cached = bundle;
  return bundle;
}

export function getMachine(id: string): Machine | undefined {
  return getBundle().machines.find((m) => m.id === id);
}

export function getMachines(): Machine[] {
  return getBundle().machines;
}

export function getEra(id: string) {
  return getBundle().eras.find((e) => e.id === id);
}

export function getFaction(id: string) {
  return getBundle().factions.find((f) => f.id === id);
}

export function getCharacter(id: string) {
  return getBundle().characters.find((c) => c.id === id);
}

export function getEvent(id: string) {
  return getBundle().events.find((e) => e.id === id);
}

export function getPlace(id: string) {
  return getBundle().places.find((p) => p.id === id);
}

export function getWork(id: string) {
  return getBundle().works.find((w) => w.id === id);
}

export function getTag(id: string) {
  return getBundle().tags.find((t) => t.id === id);
}

/** Incoming + outgoing lineage edges, resolved to machines. */
export function getLineage(id: string) {
  const bundle = getBundle();
  const node = getMachine(id);
  if (!node) return { incoming: [], outgoing: [] };
  const outgoing = node.edges
    .map((edge) => ({ edge, machine: bundle.machines.find((m) => m.id === edge.to) }))
    .filter((x): x is { edge: (typeof node.edges)[number]; machine: Machine } => Boolean(x.machine));
  const incoming = bundle.machines.flatMap((m) =>
    m.edges
      .filter((edge) => edge.to === id)
      .map((edge) => ({ edge, machine: m })),
  );
  return { incoming, outgoing };
}

/** All tags used by at least one machine, in controlled-vocabulary order. */
export function getUsedTags() {
  const used = new Set(getBundle().machines.flatMap((m) => m.tags));
  return getBundle().tags.filter((t) => used.has(t.id));
}
