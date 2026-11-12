import type { Machine } from "./schema";

export type TreeEdgeKind = "derive_of" | "tech_from" | "replace";

export type LayoutNode = {
  machine: Machine;
  x: number;
  y: number;
  depth: number;
  isolated: boolean;
};

export type LayoutEdge = {
  from: LayoutNode;
  to: LayoutNode;
  kind: TreeEdgeKind;
  techTag?: string;
  note: { zh: string; ja: string };
  d: string;
  labelX: number;
  labelY: number;
};

export type TreeLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
  isolatedLabelY: number;
};

const NODE_W = 176;
const GAP_Y = 112;

function edgePath(from: LayoutNode, to: LayoutNode): string {
  const x1 = from.x + NODE_W / 2;
  const y1 = from.y;
  const x2 = to.x - NODE_W / 2;
  const y2 = to.y;
  if (x2 > x1 + 10) {
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }
  const lift = Math.min(90, 40 + Math.abs(y2 - y1) * 0.2);
  return `M ${x1} ${y1} C ${x1 + 70} ${y1 - lift}, ${x2 - 70} ${y2 - lift}, ${x2} ${y2}`;
}

/**
 * Longest-path layout for the machine DAG. Machines that participate in no
 * edge (parallel-universe entries) are parked in a labelled strip at the
 * bottom instead of being forced into the U.C. lineage.
 */
export function layoutTechTree(machines: Machine[], eraOrder: string[] = [], eraId = "uc"): TreeLayout {
  // Each era has its own technology base. Layout one era at a time instead
  // of forcing every universe into the U.C. tree.
  const primary = machines.filter((machine) => machine.eraId === eraId);
  const secondary: Machine[] = [];

  const incoming = new Map<string, number>();
  primary.forEach((machine) => incoming.set(machine.id, 0));
  primary.forEach((machine) =>
    machine.edges.forEach((edge) => incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1)),
  );

  const depths = new Map<string, number>();
  const visiting = new Set<string>();
  const levelOf = (id: string): number => {
    if (depths.has(id)) return depths.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const parents = machines.filter((machine) =>
      machine.edges.some((edge) => edge.to === id && edge.kind !== "replace"),
    );
    const level = parents.length === 0 ? 0 : Math.max(...parents.map((parent) => levelOf(parent.id) + 1));
    visiting.delete(id);
    depths.set(id, level);
    return level;
  };
  primary.forEach((machine) => levelOf(machine.id));

  const levels = new Map<number, Machine[]>();
  for (const machine of primary) {
    const level = depths.get(machine.id) ?? 0;
    const hasEdge = machine.edges.length > 0 || (incoming.get(machine.id) ?? 0) > 0;
    if (!hasEdge) continue;
    const list = levels.get(level) ?? [];
    list.push(machine);
    levels.set(level, list);
  }

  const nodes: LayoutNode[] = [];
  const nodeById = new Map<string, LayoutNode>();
  const sortedLevels = Array.from(levels.entries()).sort((a, b) => a[0] - b[0]);
  for (const [level, list] of sortedLevels) {
    list.sort((a, b) => a.firstAppear.year - b.firstAppear.year || a.modelCode.localeCompare(b.modelCode));
    const total = (list.length - 1) * GAP_Y;
    const startY = Math.max(40, 224 - total / 2);
    list.forEach((machine, index) => {
      const node: LayoutNode = {
        machine,
        x: 150 + level * 226,
        y: startY + index * GAP_Y,
        depth: level,
        isolated: false,
      };
      nodes.push(node);
      nodeById.set(machine.id, node);
    });
  }

  const isolatedMachines = [
    ...secondary,
    ...primary.filter((machine) => {
      const hasEdge = machine.edges.length > 0 || (incoming.get(machine.id) ?? 0) > 0;
      return !hasEdge;
    }),
  ];
  void eraOrder;
  // Unconnected / parallel-universe machines are parked in a readable grid.
  const perRow = 6;
  const connectedBottom = nodes.length ? Math.max(...nodes.map((node) => node.y + 70)) : 0;
  const isolatedLabelY = Math.max(600, connectedBottom + 50);
  const gridStart = isolatedLabelY + 60;
  isolatedMachines.forEach((machine, index) => {
    const node: LayoutNode = {
      machine,
      x: 150 + (index % perRow) * 226,
      y: gridStart + Math.floor(index / perRow) * 96,
      depth: -1,
      isolated: true,
    };
    nodes.push(node);
    nodeById.set(machine.id, node);
  });

  const edges: LayoutEdge[] = [];
  for (const machine of primary) {
    const from = nodeById.get(machine.id);
    if (!from || from.isolated) continue;
    for (const edge of machine.edges) {
      const to = nodeById.get(edge.to);
      if (!to || to.isolated) continue;
      edges.push({
        from,
        to,
        kind: edge.kind,
        techTag: edge.techTag,
        note: edge.note,
        d: edgePath(from, to),
        labelX: (from.x + to.x) / 2,
        labelY: (from.y + to.y) / 2 - 8,
      });
    }
  }

  const width = Math.max(1280, ...nodes.map((node) => node.x + 120));
  const isolatedRows = Math.max(1, Math.ceil(isolatedMachines.length / perRow));
  const height = Math.max(710, gridStart + isolatedRows * 96 + 90);
  return { nodes, edges, width, height, isolatedLabelY };
}
