import { z } from "zod";

/**
 * Single source of truth for the content layer.
 * Every JSON file under /content is parsed through these schemas at build time.
 * If it does not validate, the build fails — there is no "just this once".
 */

export const LANGS = ["zh", "ja", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const CANON_LEVELS = ["mainline", "side_story", "parallel", "game_original"] as const;
export type CanonLevel = (typeof CANON_LEVELS)[number];

const slug = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字与连字符");

export const localized = z.object({
  zh: z.string().min(1),
  ja: z.string().min(1),
  en: z.string().min(1).optional(),
});

export const localizedOptional = z.object({
  zh: z.string().min(1),
  ja: z.string().optional(),
  en: z.string().optional(),
});

export const sourceRef = z.object({
  label: z.string().min(2),
  /** English citation label; the original label stays for the zh/ja site. */
  labelEn: z.string().min(2).optional(),
  level: z.enum(["S", "A", "B", "C"]),
  url: z.string().url().optional(),
  note: z.string().optional(),
  /** English note shown on the English site. */
  noteEn: z.string().optional(),
});
export type SourceRef = z.infer<typeof sourceRef>;

const year = z.number().int().min(1).max(9999);
export const storyDate = z.object({
  year,
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  precision: z.enum(["year", "month", "day", "approximate"]).default("year"),
  label: z.string().optional(),
});
export type StoryDate = z.infer<typeof storyDate>;

export const eraSchema = z.object({
  id: slug,
  code: z.string().min(2),
  name: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  order: z.number().int(),
  canon: z.enum(["mainline", "parallel"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  span: z.object({ start: year, end: year }),
  /** Narrative focus used by the timeline by default. */
  window: z.object({ start: year, end: year }),
  summary: localized,
  note: localized.optional(),
});
export type Era = z.infer<typeof eraSchema>;

export const factionSchema = z.object({
  id: slug,
  name: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  short: z.string().min(1).max(8),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  eraIds: z.array(slug).min(1),
  parentId: slug.nullable().optional(),
  founded: z.string().optional(),
  dissolved: z.string().optional(),
  description: localized,
  motto: localized.optional(),
  relations: z
    .array(
      z.object({
        targetId: slug,
        type: z.enum(["affiliation", "hostility", "succession", "split", "alliance"]),
      }),
    )
    .default([]),
});
export type Faction = z.infer<typeof factionSchema>;

export const characterSchema = z.object({
  id: slug,
  name: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  aliases: z.array(z.string()).default([]),
  age: localized.optional(),
  rank: localized.optional(),
  origin: localized.optional(),
  factionId: slug,
  /** Additional affiliations with a period, used for characters who changed sides. */
  affiliations: z
    .array(z.object({ factionId: slug, period: localized }))
    .default([]),
  eraIds: z.array(slug).min(1),
  role: localized,
  status: z.enum(["alive", "dead", "unknown", "missing"]),
  bio: z.object({
    zh: z.array(z.string()).min(1),
    ja: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1).optional(),
  }),
  machineIds: z.array(slug).default([]),
  eventIds: z.array(slug).default([]),
  relations: z
    .array(
      z.object({
        targetId: slug,
        type: z.enum(["family", "mentor", "comrade", "rival", "admiration"]),
      }),
    )
    .default([]),
  appearances: z.array(slug).default([]),
});
export type Character = z.infer<typeof characterSchema>;

export const workSchema = z.object({
  id: slug,
  title: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  year: z.number().int().min(1979).max(2100),
  type: z.enum(["tv", "ova", "movie", "novel", "manga", "game"]),
  eraId: slug,
  canon: z.enum(CANON_LEVELS),
  summary: localized,
});
export type Work = z.infer<typeof workSchema>;

export const placeSchema = z.object({
  id: slug,
  name: localized,
  kind: z.enum(["earth", "colony", "space", "moon"]),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  orbit: z.enum(["L1", "L2", "L3", "L4", "L5"]).optional(),
  angle: z.number().min(0).max(360).optional(),
  description: localized,
});
export type Place = z.infer<typeof placeSchema>;

export const eventSchema = z.object({
  id: slug,
  title: localized,
  eraId: slug,
  scale: z.enum(["era", "battle", "incident"]),
  date: storyDate,
  endDate: storyDate.optional(),
  placeId: slug.optional(),
  factionIds: z.array(slug).default([]),
  machineIds: z.array(slug).default([]),
  characterIds: z.array(slug).default([]),
  summary: localized,
  /** Longer, human-readable explanation of background, course and consequences. */
  detail: z.object({
    zh: z.array(z.string()).min(1),
    ja: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1).optional(),
  }),
  outcome: localized,
  canon: z.enum(CANON_LEVELS),
  mainline: z.boolean().default(true),
  sources: z.array(sourceRef).min(1),
});
export type EventRecord = z.infer<typeof eventSchema>;

export const tagSchema = z.object({
  id: slug,
  name: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  category: z.enum(["armor", "power", "sensor", "weapon", "system", "frame"]),
  description: localized,
  /** Longer explanation: origin, mechanism, trade-offs and historical role. */
  detail: z.object({
    zh: z.array(z.string()).min(1),
    ja: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1).optional(),
  }),
});
export type Tag = z.infer<typeof tagSchema>;

const specNumber = z.number().positive().nullable().optional();

export const machineSchema = z.object({
  id: slug,
  modelCode: z.string().min(2),
  name: z.object({ zh: z.string(), ja: z.string(), en: z.string() }),
  aliases: z.array(z.string()).default([]),
  unitType: z.enum(["prototype", "mass_production", "limited", "ship", "mobile_armor"]),
  eraId: slug,
  factionId: slug,
  canon: z.enum(CANON_LEVELS),
  firstAppear: storyDate,
  summary: localized,
  description: z.object({
    zh: z.array(z.string()).min(1),
    ja: z.array(z.string()).min(1),
    en: z.array(z.string()).min(1).optional(),
  }),
  specs: z.object({
    heightOverall: specNumber,
    heightHead: specNumber,
    weightEmpty: specNumber,
    weightFull: specNumber,
    powerOutput: specNumber,
    thrust: specNumber,
    sensorRadius: specNumber,
    armor: localized.optional(),
  }),
  armament: z
    .array(
      z.object({
        name: localized,
        type: z.enum(["beam", "kinetic", "melee", "special"]),
      }),
    )
    .default([]),
  tags: z.array(slug).default([]),
  pilots: z
    .array(z.object({ characterId: slug, note: localized.optional() }))
    .default([]),
  eventIds: z.array(slug).default([]),
  workIds: z.array(slug).default([]),
  edges: z
    .array(
      z.object({
        to: slug,
        kind: z.enum(["derive_of", "tech_from", "replace"]),
        techTag: slug.optional(),
        note: localized,
        sources: z.array(sourceRef).min(1),
      }),
    )
    .default([]),
  viewer: z.object({
    head: z.enum(["vfin", "mono", "unicorn", "mustache", "fin"]),
    build: z.enum(["standard", "heavy", "slim"]),
    shoulder: z.enum(["block", "spike", "round", "binder", "wing"]),
    backpack: z.enum(["thruster", "funnel", "wing", "none"]),
    weapon: z.enum(["rifle", "bazooka", "saber", "mace", "none"]),
    shield: z.boolean(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      eye: z.string(),
      frame: z.string(),
    }),
  }),
  sources: z.array(sourceRef).min(1),
  disputed: z.boolean().default(false),
  dataQuality: z.enum(["seed", "verified"]).default("seed"),
  updatedAt: z.string(),
});
export type Machine = z.infer<typeof machineSchema>;

/* ------------------------------------------------------------------
   ATLAS — per-era universe geography for the 2D / 3D map.
   Positions are schematic: Lagrange assignments and relative order
   follow the setting, distances are compressed for legibility.
   ------------------------------------------------------------------ */

export const ATLAS_ANCHORS = ["earth", "moon", "mars", "venus", "jupiter", "lagrange", "earthorbit", "deep"] as const;
export const ATLAS_KINDS = [
  "capital",
  "city",
  "colony",
  "station",
  "fortress",
  "battlefield",
  "elevator",
  "region",
  "fleet",
] as const;

export const atlasNodeSchema = z.object({
  id: slug,
  name: localized,
  kind: z.enum(ATLAS_KINDS),
  anchor: z.enum(ATLAS_ANCHORS),
  orbit: z.enum(["L1", "L2", "L3", "L4", "L5"]).optional(),
  /** Degrees around the Earth–Moon plane for Lagrange / deep anchors. */
  angle: z.number().min(0).max(360).optional(),
  /** Surface coordinates for earth / moon / planet anchors. */
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  /** Distance from Earth in Earth radii, used by the far anchors. */
  distance: z.number().positive().optional(),
  factionId: slug.optional(),
  placeId: slug.optional(),
  note: localized.optional(),
  /** 1 = always label, 2 = label on focus, 3 = list only. */
  priority: z.number().int().min(1).max(3).default(2),
});
export type AtlasNode = z.infer<typeof atlasNodeSchema>;

export const atlasRouteSchema = z.object({
  from: slug,
  to: slug,
  kind: z.enum(["supply", "invasion", "migration"]),
  label: localized.optional(),
});

export const atlasEraSchema = z.object({
  eraId: slug,
  bodies: z.array(z.enum(["earth", "moon", "mars", "venus", "jupiter"])).min(1),
  /** Orthographic globe centre used by the 2D Earth view. */
  focus: z.object({ lon: z.number(), lat: z.number() }).default({ lon: 105, lat: 20 }),
  nodes: z.array(atlasNodeSchema).min(3),
  routes: z.array(atlasRouteSchema).default([]),
  geography: localized,
  layoutNote: localized.optional(),
  sources: z.array(sourceRef).min(1),
});
export type AtlasEra = z.infer<typeof atlasEraSchema>;

export const bundleSchema = z.object({
  eras: z.array(eraSchema).min(1),
  atlas: z.array(atlasEraSchema).min(1),
  factions: z.array(factionSchema),
  characters: z.array(characterSchema),
  works: z.array(workSchema),
  places: z.array(placeSchema),
  events: z.array(eventSchema),
  tags: z.array(tagSchema),
  machines: z.array(machineSchema),
});
export type Bundle = z.infer<typeof bundleSchema>;

/** Cross-file checks that a per-file schema cannot express. */
export function validateBundle(bundle: Bundle): string[] {
  const errors: string[] = [];
  const uniq = (name: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${name}: 重复 id "${id}"`);
      seen.add(id);
    }
  };
  uniq("eras", bundle.eras.map((e) => e.id));
  uniq("factions", bundle.factions.map((f) => f.id));
  uniq("characters", bundle.characters.map((c) => c.id));
  uniq("works", bundle.works.map((w) => w.id));
  uniq("places", bundle.places.map((p) => p.id));
  uniq("events", bundle.events.map((e) => e.id));
  uniq("tags", bundle.tags.map((t) => t.id));
  uniq("machines", bundle.machines.map((m) => m.id));
  uniq("atlas", bundle.atlas.map((a) => a.eraId));

  const eraIds = new Set(bundle.eras.map((e) => e.id));
  const factionIds = new Set(bundle.factions.map((f) => f.id));
  const characterIds = new Set(bundle.characters.map((c) => c.id));
  const workIds = new Set(bundle.works.map((w) => w.id));
  const placeIds = new Set(bundle.places.map((p) => p.id));
  const eventIds = new Set(bundle.events.map((e) => e.id));
  const tagIds = new Set(bundle.tags.map((t) => t.id));
  const machineIds = new Set(bundle.machines.map((m) => m.id));

  const checkRef = (label: string, id: string, set: Set<string>) => {
    if (!set.has(id)) errors.push(`${label}: 引用了不存在的 id "${id}"`);
  };

  for (const f of bundle.factions) {
    f.eraIds.forEach((id) => checkRef(`faction ${f.id}.eraIds`, id, eraIds));
    if (f.parentId) checkRef(`faction ${f.id}.parentId`, f.parentId, factionIds);
    f.relations.forEach((r) => {
      checkRef(`faction ${f.id}.relations`, r.targetId, factionIds);
      if (r.targetId === f.id) errors.push(`faction ${f.id}: 不能与自身建立关系`);
    });
  }
  for (const c of bundle.characters) {
    checkRef(`character ${c.id}.factionId`, c.factionId, factionIds);
    c.eraIds.forEach((id) => checkRef(`character ${c.id}.eraIds`, id, eraIds));
    c.machineIds.forEach((id) => checkRef(`character ${c.id}.machineIds`, id, machineIds));
    c.eventIds.forEach((id) => checkRef(`character ${c.id}.eventIds`, id, eventIds));
    c.appearances.forEach((id) => checkRef(`character ${c.id}.appearances`, id, workIds));
    c.relations.forEach((r) => checkRef(`character ${c.id}.relations`, r.targetId, characterIds));
    c.affiliations.forEach((a) => checkRef(`character ${c.id}.affiliations`, a.factionId, factionIds));
    c.eventIds.forEach((id) => {
      const event = bundle.events.find((item) => item.id === id);
      if (event && !event.characterIds.includes(c.id)) {
        errors.push(`character ${c.id}: 事件 ${id} 未回指该人物`);
      }
    });
  }
  for (const w of bundle.works) checkRef(`work ${w.id}.eraId`, w.eraId, eraIds);
  for (const e of bundle.events) {
    checkRef(`event ${e.id}.eraId`, e.eraId, eraIds);
    if (e.placeId) checkRef(`event ${e.id}.placeId`, e.placeId, placeIds);
    e.factionIds.forEach((id) => checkRef(`event ${e.id}.factionIds`, id, factionIds));
    e.machineIds.forEach((id) => checkRef(`event ${e.id}.machineIds`, id, machineIds));
    e.characterIds.forEach((id) => checkRef(`event ${e.id}.characterIds`, id, characterIds));
  }

  for (const t of bundle.tags) {
    if (!t.detail.zh.length || !t.detail.ja.length) {
      errors.push(`tag ${t.id}: 缺少人类可读的长解释 detail`);
    }
  }
  for (const e of bundle.events) {
    if (!e.detail.zh.length || !e.detail.ja.length) {
      errors.push(`event ${e.id}: 缺少人类可读的事件解释 detail`);
    }
  }
  for (const c of bundle.characters) {
    for (const field of ["age", "rank", "origin"] as const) {
      if (!c[field]) errors.push(`character ${c.id}: 缺少 ${field}`);
    }
  }

  const atlasEraIds = new Set(bundle.atlas.map((a) => a.eraId));
  for (const era of bundle.eras) {
    if (!atlasEraIds.has(era.id)) errors.push(`atlas: 缺少纪元 ${era.id} 的地图`);
  }
  for (const map of bundle.atlas) {
    checkRef(`atlas ${map.eraId}.eraId`, map.eraId, eraIds);
    const nodeIds = new Set(map.nodes.map((node) => node.id));
    if (nodeIds.size !== map.nodes.length) errors.push(`atlas ${map.eraId}: 节点 id 重复`);
    for (const node of map.nodes) {
      if (node.factionId) checkRef(`atlas ${map.eraId}.${node.id}.factionId`, node.factionId, factionIds);
      if (node.placeId) checkRef(`atlas ${map.eraId}.${node.id}.placeId`, node.placeId, placeIds);
      if (node.anchor === "lagrange" && !node.orbit) errors.push(`atlas ${map.eraId}.${node.id}: Lagrange 节点缺少 orbit`);
      if ((node.anchor === "earth" || node.anchor === "moon") && (node.lat === undefined || node.lng === undefined)) {
        errors.push(`atlas ${map.eraId}.${node.id}: 地表节点缺少 lat/lng`);
      }
    }
    for (const route of map.routes) {
      checkRef(`atlas ${map.eraId}.routes.from`, route.from, nodeIds);
      checkRef(`atlas ${map.eraId}.routes.to`, route.to, nodeIds);
    }
  }

  for (const m of bundle.machines) {
    checkRef(`machine ${m.id}.eraId`, m.eraId, eraIds);
    checkRef(`machine ${m.id}.factionId`, m.factionId, factionIds);
    m.tags.forEach((id) => checkRef(`machine ${m.id}.tags`, id, tagIds));
    m.eventIds.forEach((id) => checkRef(`machine ${m.id}.eventIds`, id, eventIds));
    m.workIds.forEach((id) => checkRef(`machine ${m.id}.workIds`, id, workIds));
    m.pilots.forEach((p) => checkRef(`machine ${m.id}.pilots`, p.characterId, characterIds));
    m.edges.forEach((edge) => {
      checkRef(`machine ${m.id}.edges.to`, edge.to, machineIds);
      if (edge.to === m.id) errors.push(`machine ${m.id}: 谱系边不能指向自身`);
      if (edge.techTag) checkRef(`machine ${m.id}.edges.techTag`, edge.techTag, tagIds);
    });
  }

  // Tech tree must be a DAG. `replace` edges are task-succession, not descent,
  // so they are excluded from the cycle check (see spec 4.2 / 8.2).
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (id: string, path: string[]): void => {
    const s = state.get(id) ?? 0;
    if (s === 1) {
      errors.push(`谱系出现环: ${[...path, id].join(" → ")}`);
      return;
    }
    if (s === 2) return;
    state.set(id, 1);
    const machine = bundle.machines.find((m) => m.id === id);
    for (const edge of machine?.edges ?? []) {
      if (edge.kind === "replace") continue;
      visit(edge.to, [...path, id]);
    }
    state.set(id, 2);
  };
  bundle.machines.forEach((m) => visit(m.id, []));

  // Every machine reference should be reciprocal, otherwise the "who piloted
  // what" panel and the character page silently disagree.
  for (const m of bundle.machines) {
    for (const p of m.pilots) {
      const c = bundle.characters.find((x) => x.id === p.characterId);
      if (c && !c.machineIds.includes(m.id)) {
        errors.push(`machine ${m.id}: 驾驶员 ${c.id} 未在其 machineIds 中回指该机体`);
      }
    }
    for (const id of m.eventIds) {
      const e = bundle.events.find((x) => x.id === id);
      if (e && !e.machineIds.includes(m.id)) {
        errors.push(`machine ${m.id}: 事件 ${id} 未回指该机体`);
      }
    }
  }

  return errors;
}
