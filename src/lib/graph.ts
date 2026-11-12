import { pick } from "./i18n";
import type { Bundle, Lang } from "./schema";

export type GraphNode = {
  id: string;
  label: string;
  meta?: string;
  href?: string;
  group: string;
  groupLabel: string;
  color: string;
  kind?: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  kind?: string;
  label?: string;
};

export type GraphData = {
  center: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  total: number;
};

const C = {
  faction: "#63e6ff",
  pilots: "#ffb648",
  events: "#ff5d6c",
  tech: "#9a86ff",
  lineage: "#5ce6a6",
  works: "#8fa6b8",
  relations: "#f472b6",
  machines: "#63e6ff",
  factions: "#63e6ff",
  characters: "#ffb648",
  places: "#5ce6a6",
  eras: "#ffb648",
  relatedTags: "#9a86ff",
  parent: "#8fa6b8",
  children: "#8fa6b8",
  allies: "#5ce6a6",
  enemies: "#ff5d6c",
  members: "#63e6ff",
  related: "#8fa6b8",
};

function node(
  id: string,
  label: string,
  group: keyof typeof C,
  groupLabel: string,
  options: { href?: string; meta?: string; color?: string; kind?: string } = {},
): GraphNode {
  return {
    id,
    label,
    group,
    groupLabel,
    color: options.color ?? C[group],
    href: options.href,
    meta: options.meta,
    kind: options.kind,
  };
}

function cap<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

export function buildMachineGraph(machineId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const machine = bundle.machines.find((item) => item.id === machineId);
  if (!machine) return null;
  const era = bundle.eras.find((item) => item.id === machine.eraId);
  const faction = bundle.factions.find((item) => item.id === machine.factionId);
  const pilots = machine.pilots
    .map((pilot) => bundle.characters.find((character) => character.id === pilot.characterId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const events = machine.eventIds
    .map((id) => bundle.events.find((event) => event.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const tags = machine.tags
    .map((id) => bundle.tags.find((tag) => tag.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const works = machine.workIds
    .map((id) => bundle.works.find((work) => work.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const incoming = bundle.machines.filter((item) => item.edges.some((edge) => edge.to === machine.id));
  const outgoing = machine.edges
    .map((edge) => ({ edge, target: bundle.machines.find((item) => item.id === edge.to) }))
    .filter((item): item is { edge: (typeof machine.edges)[number]; target: NonNullable<typeof item.target> } => Boolean(item.target));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  if (faction) {
    nodes.push(node(faction.id, pick(faction.name, lang), "faction", dict.graph.groups.faction, {
      href: `/${lang}/factions/${faction.id}`,
      meta: faction.short,
      color: faction.color,
    }));
    edges.push({ from: machine.id, to: faction.id });
  }
  cap(pilots, 6).forEach((character) => {
    nodes.push(node(character.id, pick(character.name, lang), "pilots", dict.graph.groups.pilots, {
      href: `/${lang}/characters/${character.id}`,
      meta: pick(character.role, lang),
    }));
    edges.push({ from: machine.id, to: character.id });
  });
  cap(events, 6).forEach((event) => {
    const eventEra = bundle.eras.find((item) => item.id === event.eraId);
    nodes.push(node(event.id, pick(event.title, lang), "events", dict.graph.groups.events, {
      href: `/${lang}/events/${event.id}`,
      meta: eventEra?.code,
    }));
    edges.push({ from: machine.id, to: event.id, kind: "event" });
  });
  cap(tags, 8).forEach((tag) => {
    nodes.push(node(tag.id, pick(tag.name, lang), "tech", dict.graph.groups.tech, {
      href: `/${lang}/glossary#tag-${tag.id}`,
      meta: tag.category,
    }));
    edges.push({ from: machine.id, to: tag.id });
  });
  cap(incoming, 4).forEach((source) => {
    nodes.push(node(source.id, pick(source.name, lang), "lineage", dict.graph.groups.lineage, {
      href: `/${lang}/machines/${source.id}`,
      meta: source.modelCode,
    }));
    edges.push({ from: source.id, to: machine.id, kind: "lineage" });
  });
  cap(outgoing, 4).forEach(({ target }) => {
    nodes.push(node(target.id, pick(target.name, lang), "lineage", dict.graph.groups.lineage, {
      href: `/${lang}/machines/${target.id}`,
      meta: target.modelCode,
    }));
    edges.push({ from: machine.id, to: target.id, kind: "lineage" });
  });
  cap(works, 3).forEach((work) => {
    nodes.push(node(work.id, pick(work.title, lang), "works", dict.graph.groups.works, {
      href: `/${lang}/archive#works`,
      meta: String(work.year),
    }));
    edges.push({ from: machine.id, to: work.id });
  });

  return {
    center: {
      id: machine.id,
      label: pick(machine.name, lang),
      meta: machine.modelCode,
      href: `/${lang}/machines/${machine.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: faction?.color ?? era?.color ?? "#63e6ff",
    },
    nodes,
    edges,
    total: nodes.length,
  };
}

export function buildCharacterGraph(characterId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const character = bundle.characters.find((item) => item.id === characterId);
  if (!character) return null;
  const faction = bundle.factions.find((item) => item.id === character.factionId);
  const relations = character.relations
    .map((relation) => ({ ...relation, target: bundle.characters.find((item) => item.id === relation.targetId) }))
    .filter((item): item is typeof item & { target: NonNullable<typeof item.target> } => Boolean(item.target));
  const machines = character.machineIds
    .map((id) => bundle.machines.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const events = character.eventIds
    .map((id) => bundle.events.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const works = character.appearances
    .map((id) => bundle.works.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  if (faction) {
    nodes.push(node(faction.id, pick(faction.name, lang), "factions", dict.graph.groups.factions, {
      href: `/${lang}/factions/${faction.id}`,
      meta: faction.short,
      color: faction.color,
    }));
    edges.push({ from: character.id, to: faction.id });
  }
  cap(relations, 6).forEach((relation) => {
    nodes.push(node(relation.target.id, pick(relation.target.name, lang), "relations", dict.graph.groups.relations, {
      href: `/${lang}/characters/${relation.target.id}`,
      meta: dict.graph.edgeKinds[relation.type] ?? relation.type,
    }));
    edges.push({ from: character.id, to: relation.target.id, kind: relation.type, label: dict.graph.edgeKinds[relation.type] });
  });
  cap(machines, 6).forEach((machine) => {
    nodes.push(node(machine.id, pick(machine.name, lang), "machines", dict.graph.groups.machines, {
      href: `/${lang}/machines/${machine.id}`,
      meta: machine.modelCode,
    }));
    edges.push({ from: character.id, to: machine.id });
  });
  cap(events, 6).forEach((event) => {
    nodes.push(node(event.id, pick(event.title, lang), "events", dict.graph.groups.events, {
      href: `/${lang}/events/${event.id}`,
      meta: String(event.date.year),
    }));
    edges.push({ from: character.id, to: event.id, kind: "event" });
  });
  cap(works, 4).forEach((work) => {
    nodes.push(node(work.id, pick(work.title, lang), "works", dict.graph.groups.works, {
      href: `/${lang}/archive#works`,
      meta: String(work.year),
    }));
    edges.push({ from: character.id, to: work.id });
  });

  return {
    center: {
      id: character.id,
      label: pick(character.name, lang),
      meta: pick(character.role, lang),
      href: `/${lang}/characters/${character.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: faction?.color ?? "#63e6ff",
    },
    nodes,
    edges,
    total: nodes.length,
  };
}

export function buildEventGraph(eventId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const event = bundle.events.find((item) => item.id === eventId);
  if (!event) return null;
  const era = bundle.eras.find((item) => item.id === event.eraId);
  const factions = event.factionIds
    .map((id) => bundle.factions.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const machines = event.machineIds
    .map((id) => bundle.machines.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const characters = event.characterIds
    .map((id) => bundle.characters.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const place = event.placeId ? bundle.places.find((item) => item.id === event.placeId) : undefined;
  const eraEvents = bundle.events.filter((item) => item.eraId === event.eraId);
  const index = eraEvents.findIndex((item) => item.id === event.id);
  const neighbors = [eraEvents[index - 1], eraEvents[index + 1]].filter(Boolean);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  cap(factions, 5).forEach((faction) => {
    nodes.push(node(faction.id, pick(faction.name, lang), "factions", dict.graph.groups.factions, {
      href: `/${lang}/factions/${faction.id}`,
      meta: faction.short,
      color: faction.color,
    }));
    edges.push({ from: event.id, to: faction.id });
  });
  cap(machines, 6).forEach((machine) => {
    nodes.push(node(machine.id, pick(machine.name, lang), "machines", dict.graph.groups.machines, {
      href: `/${lang}/machines/${machine.id}`,
      meta: machine.modelCode,
    }));
    edges.push({ from: event.id, to: machine.id });
  });
  cap(characters, 6).forEach((character) => {
    nodes.push(node(character.id, pick(character.name, lang), "characters", dict.graph.groups.characters, {
      href: `/${lang}/characters/${character.id}`,
      meta: pick(character.role, lang),
    }));
    edges.push({ from: event.id, to: character.id });
  });
  if (place) {
    nodes.push(node(place.id, pick(place.name, lang), "places", dict.graph.groups.places, {
      meta: place.orbit ?? place.kind,
    }));
    edges.push({ from: event.id, to: place.id });
  }
  neighbors.forEach((neighbor) => {
    nodes.push(node(neighbor.id, pick(neighbor.title, lang), "events", dict.graph.groups.events, {
      href: `/${lang}/events/${neighbor.id}`,
      meta: String(neighbor.date.year),
    }));
    edges.push({ from: event.id, to: neighbor.id, kind: "event" });
  });

  return {
    center: {
      id: event.id,
      label: pick(event.title, lang),
      meta: era?.code,
      href: `/${lang}/events/${event.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: era?.color ?? "#63e6ff",
    },
    nodes,
    edges,
    total: nodes.length,
  };
}

export function buildFactionGraph(factionId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const faction = bundle.factions.find((item) => item.id === factionId);
  if (!faction) return null;
  const era = bundle.eras.find((item) => item.id === faction.eraIds[0]);
  const parent = faction.parentId ? bundle.factions.find((item) => item.id === faction.parentId) : undefined;
  const children = bundle.factions.filter((item) => item.parentId === faction.id);
  const relations = faction.relations
    .map((relation) => ({ ...relation, target: bundle.factions.find((item) => item.id === relation.targetId) }))
    .filter((item): item is typeof item & { target: NonNullable<typeof item.target> } => Boolean(item.target));
  const machines = bundle.machines.filter((machine) => machine.factionId === faction.id);
  const characters = bundle.characters.filter(
    (character) =>
      character.factionId === faction.id || character.affiliations.some((affiliation) => affiliation.factionId === faction.id),
  );
  const events = bundle.events.filter((event) => event.factionIds.includes(faction.id));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  if (parent) {
    nodes.push(node(parent.id, pick(parent.name, lang), "parent", dict.graph.groups.parent, {
      href: `/${lang}/factions/${parent.id}`,
      meta: parent.short,
      color: parent.color,
    }));
    edges.push({ from: faction.id, to: parent.id, kind: "affiliation" });
  }
  cap(children, 5).forEach((child) => {
    nodes.push(node(child.id, pick(child.name, lang), "children", dict.graph.groups.children, {
      href: `/${lang}/factions/${child.id}`,
      meta: child.short,
      color: child.color,
    }));
    edges.push({ from: faction.id, to: child.id, kind: "affiliation" });
  });
  cap(relations, 7).forEach((relation) => {
    nodes.push(node(relation.target.id, pick(relation.target.name, lang), "related", dict.graph.groups.related, {
      href: `/${lang}/factions/${relation.target.id}`,
      meta: dict.graph.edgeKinds[relation.type] ?? relation.type,
      color: relation.target.color,
    }));
    edges.push({ from: faction.id, to: relation.target.id, kind: relation.type, label: dict.graph.edgeKinds[relation.type] });
  });
  cap(machines, 6).forEach((machine) => {
    nodes.push(node(machine.id, pick(machine.name, lang), "machines", dict.graph.groups.machines, {
      href: `/${lang}/machines/${machine.id}`,
      meta: machine.modelCode,
    }));
    edges.push({ from: faction.id, to: machine.id });
  });
  cap(characters, 6).forEach((character) => {
    nodes.push(node(character.id, pick(character.name, lang), "characters", dict.graph.groups.characters, {
      href: `/${lang}/characters/${character.id}`,
      meta: pick(character.role, lang),
    }));
    edges.push({ from: faction.id, to: character.id });
  });
  cap(events, 4).forEach((event) => {
    nodes.push(node(event.id, pick(event.title, lang), "events", dict.graph.groups.events, {
      href: `/${lang}/events/${event.id}`,
      meta: String(event.date.year),
    }));
    edges.push({ from: faction.id, to: event.id, kind: "event" });
  });

  return {
    center: {
      id: faction.id,
      label: pick(faction.name, lang),
      meta: faction.short,
      href: `/${lang}/factions/${faction.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: faction.color,
    },
    nodes,
    edges,
    total: nodes.length,
  };
}

export function buildTagGraph(tagId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const tag = bundle.tags.find((item) => item.id === tagId);
  if (!tag) return null;
  const machines = bundle.machines.filter((machine) => machine.tags.includes(tag.id));
  const eras = [...new Set(machines.map((machine) => machine.eraId))]
    .map((id) => bundle.eras.find((era) => era.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const factions = [...new Set(machines.map((machine) => machine.factionId))]
    .map((id) => bundle.factions.find((faction) => faction.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedTags = bundle.tags
    .filter((item) => item.id !== tag.id)
    .map((item) => ({
      tag: item,
      count: machines.filter((machine) => machine.tags.includes(item.id)).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  cap(machines, 9).forEach((machine) => {
    nodes.push(node(machine.id, pick(machine.name, lang), "machines", dict.graph.groups.machines, {
      href: `/${lang}/machines/${machine.id}`,
      meta: machine.modelCode,
    }));
    edges.push({ from: tag.id, to: machine.id });
  });
  cap(eras, 5).forEach((era) => {
    nodes.push(node(era.id, `${era.code} ${pick(era.name, lang)}`, "eras", dict.graph.groups.eras, {
      href: `/${lang}/chronology?era=${era.id}`,
      meta: era.code,
      color: era.color,
    }));
    edges.push({ from: tag.id, to: era.id });
  });
  cap(factions, 5).forEach((faction) => {
    nodes.push(node(faction.id, pick(faction.name, lang), "factions", dict.graph.groups.factions, {
      href: `/${lang}/factions/${faction.id}`,
      meta: faction.short,
      color: faction.color,
    }));
    edges.push({ from: tag.id, to: faction.id });
  });
  relatedTags.forEach(({ tag: related }) => {
    nodes.push(node(related.id, pick(related.name, lang), "relatedTags", dict.graph.groups.relatedTags, {
      href: `/${lang}/glossary#tag-${related.id}`,
      meta: `${machines.filter((machine) => machine.tags.includes(related.id)).length} MS`,
    }));
    edges.push({ from: tag.id, to: related.id });
  });

  return {
    center: {
      id: tag.id,
      label: pick(tag.name, lang),
      meta: tag.category,
      href: `/${lang}/glossary#tag-${tag.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: "#9a86ff",
    },
    nodes,
    edges,
    total: nodes.length,
  };
}

export function buildEraFactionGraph(eraId: string, bundle: Bundle, lang: Lang, dict: any): GraphData | null {
  const era = bundle.eras.find((item) => item.id === eraId);
  if (!era) return null;
  const factions = bundle.factions.filter((faction) => faction.eraIds.includes(era.id));
  const factionIds = new Set(factions.map((faction) => faction.id));
  const nodes: GraphNode[] = factions.map((faction) => {
    const machines = bundle.machines.filter((machine) => machine.factionId === faction.id).length;
    const crew = bundle.characters.filter((character) => character.factionId === faction.id).length;
    return node(faction.id, pick(faction.name, lang), "factions", dict.graph.groups.factions, {
      href: `/${lang}/factions/${faction.id}`,
      meta: `${machines} MS / ${crew} CREW`,
      color: faction.color,
    });
  });
  const edges: GraphEdge[] = [];
  factions.forEach((faction) => {
    edges.push({ from: `era-${era.id}`, to: faction.id });
    faction.relations.forEach((relation) => {
      if (factionIds.has(relation.targetId)) {
        edges.push({ from: faction.id, to: relation.targetId, kind: relation.type, label: dict.graph.edgeKinds[relation.type] });
      }
    });
  });

  return {
    center: {
      id: `era-${era.id}`,
      label: pick(era.name, lang),
      meta: era.code,
      href: `/${lang}/chronology?era=${era.id}`,
      group: "center",
      groupLabel: dict.graph.center,
      color: era.color,
    },
    nodes,
    edges,
    total: nodes.length,
  };
}
