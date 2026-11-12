"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ZoomFrame } from "@/components/ui/ZoomFrame";
import type { Dictionary } from "@/lib/i18n";
import type { GraphData, GraphNode } from "@/lib/graph";

const RelationGraph3D = dynamic(() => import("./RelationGraph3D").then((module) => module.RelationGraph3D), {
  ssr: false,
  loading: () => <div className="relation3d__fallback">LOADING 3D GRAPH</div>,
});

const W = 900;
const H = 640;
const CX = 450;
const CY = 318;

const EDGE_COLOR: Record<string, string> = {
  hostility: "#ff5d6c",
  alliance: "#5ce6a6",
  succession: "#d8ff63",
  split: "#ff9f43",
  affiliation: "#58ff9d",
  family: "#f472b6",
  mentor: "#b4ff6a",
  comrade: "#5ce6a6",
  rival: "#ff5d6c",
  admiration: "#f472b6",
  lineage: "#5ce6a6",
  event: "#ff5d6c",
};

const approxWidth = (text: string, size: number) =>
  [...text].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? size : size * 0.55), 0);

function splitLabel(text: string, max = 9): string[] {
  const chars = [...text];
  if (chars.length <= max) return [text];
  const mid = Math.ceil(chars.length / 2);
  return [chars.slice(0, mid).join(""), chars.slice(mid).join("")];
}

export function RelationGraph({
  data,
  dict,
  title,
  lead,
  showIndex = true,
}: {
  data: GraphData;
  dict: Dictionary;
  title?: string;
  lead?: string;
  showIndex?: boolean;
}) {
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const groups: { key: string; label: string; color: string; nodes: GraphNode[] }[] = [];
  for (const node of data.nodes) {
    let group = groups.find((item) => item.key === node.group);
    if (!group) {
      group = { key: node.group, label: node.groupLabel, color: node.color, nodes: [] };
      groups.push(group);
    }
    group.nodes.push(node);
  }

  const totalWeight = groups.reduce((sum, group) => sum + group.nodes.length + 1.1, 0);
  let angle = -Math.PI / 2;
  const positions = new Map<string, { x: number; y: number; angle: number; radius: number }>();
  const groupArcs: { group: (typeof groups)[number]; start: number; end: number }[] = [];

  for (const group of groups) {
    const weight = group.nodes.length + 1.1;
    const span = (weight / totalWeight) * Math.PI * 2;
    const start = angle + 0.045;
    const end = angle + span - 0.045;
    groupArcs.push({ group, start, end });
    group.nodes.forEach((node, index) => {
      const ratio = (index + 0.5) / group.nodes.length;
      const theta = start + (end - start) * ratio;
      const radius = 178 + (index % 2) * 42 + (groups.indexOf(group) % 2) * 10;
      positions.set(node.id, {
        x: CX + Math.cos(theta) * radius,
        y: CY + Math.sin(theta) * radius,
        angle: theta,
        radius,
      });
    });
    angle += span;
  }

  const labelRects: { x: number; y: number; w: number; h: number }[] = [];
  // Reserve the group captions so node labels never run into them.
  groupArcs.forEach(({ group, start, end }) => {
    const mid = (start + end) / 2;
    const text = `${group.label} / ${group.nodes.length}`;
    const w = approxWidth(text, 10.5);
    const gx = CX + Math.cos(mid) * 284;
    const gy = CY + Math.sin(mid) * 284 + 4;
    const anchor = Math.cos(mid) > 0.2 ? "start" : Math.cos(mid) < -0.2 ? "end" : "middle";
    const left = anchor === "start" ? gx : anchor === "end" ? gx - w : gx - w / 2;
    labelRects.push({ x: left - 2, y: gy - 12, w: w + 4, h: 18 });
  });
  const labels: { node: GraphNode; x: number; y: number; anchor: "start" | "end" | "middle" }[] = [];
  for (const node of data.nodes) {
    const position = positions.get(node.id);
    if (!position) continue;
    const text = node.label;
    const w = approxWidth(text, 12.5);
    const anchor = Math.cos(position.angle) > 0.2 ? "start" : Math.cos(position.angle) < -0.2 ? "end" : "middle";
    const lx = position.x + Math.cos(position.angle) * 15;
    const ly = position.y + Math.sin(position.angle) * 15 + 4;
    const left = anchor === "start" ? lx : anchor === "end" ? lx - w : lx - w / 2;
    const rect = { x: left - 2, y: ly - 12, w: w + 4, h: 18 };
    if (labelRects.some((other) => rect.x < other.x + other.w && rect.x + rect.w > other.x && rect.y < other.y + other.h && rect.y + rect.h > other.y)) {
      continue;
    }
    labelRects.push(rect);
    labels.push({ node, x: lx, y: ly, anchor });
  }

  const edgePath = (fromId: string, toId: string) => {
    const from = positions.get(fromId);
    const to = positions.get(toId);
    if (!from || !to) return null;
    if (fromId === data.center.id) return `M ${CX} ${CY} Q ${(CX + to.x) / 2 + (to.y - CY) * 0.08} ${(CY + to.y) / 2 - (to.x - CX) * 0.08} ${to.x} ${to.y}`;
    if (toId === data.center.id) return `M ${from.x} ${from.y} Q ${(from.x + CX) / 2} ${(from.y + CY) / 2} ${CX} ${CY}`;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const cx = mx + (mx - CX) * 0.22;
    const cy = my + (my - CY) * 0.22;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  };

  const centerLines = splitLabel(data.center.label, 8);

  return (
    <div className="relation-graph-block">
      <div className="relation-graph__head">
        <div>
          <span className="micro">RELATION CLUSTER</span>
          <h3>{title ?? dict.graph.title}</h3>
        </div>
        <p>{lead ?? dict.graph.lead}</p>
        <div className="relation-graph__viewbar">
          <div className="seg" role="group" aria-label={dict.graph.title}>
            <button type="button" className={view === "2d" ? "is-active" : ""} onClick={() => setView("2d")}>2D</button>
            <button type="button" className={view === "3d" ? "is-active" : ""} onClick={() => setView("3d")}>3D</button>
          </div>
          {view === "3d" && (
            <>
              <button type="button" className={`chip ${autoRotate ? "is-active" : ""}`} onClick={() => setAutoRotate((value) => !value)}>
                {autoRotate ? dict.eraDemo.stopRotate : dict.eraDemo.rotate}
              </button>
              <button type="button" className={`chip ${showLabels ? "is-active" : ""}`} onClick={() => setShowLabels((value) => !value)}>
                LABELS
              </button>
            </>
          )}
        </div>
      </div>
      {view === "2d" ? (
      <ZoomFrame label={dict.graph.title} min={0.8} max={2.2}>
      <div className="relation-graph__scroll">
        <svg className="relation-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${dict.graph.title}: ${data.center.label}`}>
          <defs>
            <radialGradient id="graph-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={data.center.color} stopOpacity="0.34" />
              <stop offset="100%" stopColor={data.center.color} stopOpacity="0" />
            </radialGradient>
            <marker id="graph-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill="#5ce6a6" />
            </marker>
          </defs>

          <circle cx={CX} cy={CY} r={250} fill="none" stroke="rgba(120,170,210,0.08)" strokeDasharray="2 8" />
          <circle cx={CX} cy={CY} r={196} fill="none" stroke="rgba(120,170,210,0.06)" strokeDasharray="2 8" />

          {groupArcs.map(({ group, start, end }) => {
            const mid = (start + end) / 2;
            const r = 262;
            const x1 = CX + Math.cos(start) * r;
            const y1 = CY + Math.sin(start) * r;
            const x2 = CX + Math.cos(end) * r;
            const y2 = CY + Math.sin(end) * r;
            const large = end - start > Math.PI ? 1 : 0;
            return (
              <g key={`arc-${group.key}`}>
                <path
                  d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={group.color}
                  strokeOpacity={0.26}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <text
                  x={CX + Math.cos(mid) * (r + 22)}
                  y={CY + Math.sin(mid) * (r + 22) + 4}
                  textAnchor={Math.cos(mid) > 0.2 ? "start" : Math.cos(mid) < -0.2 ? "end" : "middle"}
                  className="relation-graph__group"
                  fill={group.color}
                >
                  {group.label} / {group.nodes.length}
                </text>
              </g>
            );
          })}

          {data.edges.map((edge, index) => {
            const path = edgePath(edge.from, edge.to);
            if (!path) return null;
            const color = EDGE_COLOR[edge.kind ?? ""] ?? "rgba(140,190,220,0.42)";
            const isLineage = edge.kind === "lineage";
            return (
              <path
                key={`edge-${edge.from}-${edge.to}-${index}`}
                d={path}
                fill="none"
                stroke={color}
                strokeOpacity={edge.from === data.center.id || edge.to === data.center.id ? 0.34 : 0.55}
                strokeWidth={edge.kind && edge.from !== data.center.id && edge.to !== data.center.id ? 1.5 : 1}
                strokeDasharray={isLineage || edge.kind === "event" ? "4 5" : undefined}
                markerEnd={isLineage ? "url(#graph-arrow)" : undefined}
              />
            );
          })}

          <circle cx={CX} cy={CY} r={94} fill="url(#graph-core)" />
          <circle cx={CX} cy={CY} r={58} fill="#050c18" stroke={data.center.color} strokeWidth={1.6} />
          <circle cx={CX} cy={CY} r={48} fill="none" stroke={data.center.color} strokeOpacity={0.25} strokeDasharray="2 4" />
          <path d={`M ${CX - 70} ${CY} H ${CX - 62} M ${CX + 62} ${CY} H ${CX + 70} M ${CX} ${CY - 70} V ${CY - 62} M ${CX} ${CY + 62} V ${CY + 70}`} stroke={data.center.color} strokeOpacity={0.55} />
          <text x={CX} y={CY - (centerLines.length > 1 ? 5 : 2)} textAnchor="middle" className="relation-graph__center" fill="#f2fbf9">
            {centerLines.map((line, index) => (
              <tspan key={line} x={CX} dy={index === 0 ? 0 : 17}>
                {line}
              </tspan>
            ))}
          </text>
          <text x={CX} y={CY + (centerLines.length > 1 ? 26 : 18)} textAnchor="middle" className="relation-graph__center-meta">
            {data.center.meta ?? ""}
          </text>

          {data.nodes.map((node) => {
            const position = positions.get(node.id);
            if (!position) return null;
            return (
              <g key={node.id} className="relation-graph__node">
                <circle cx={position.x} cy={position.y} r={9} fill={node.color} fillOpacity={0.16} />
                <circle cx={position.x} cy={position.y} r={5} fill={node.color} stroke="#04101c" strokeWidth={1.2} />
                <circle cx={position.x} cy={position.y} r={14} fill="transparent">
                  <title>{`${node.label}${node.meta ? ` · ${node.meta}` : ""}`}</title>
                </circle>
                {node.href && (
                  <Link href={node.href} aria-label={node.label}>
                    <circle cx={position.x} cy={position.y} r={14} fill="transparent" />
                  </Link>
                )}
              </g>
            );
          })}

          {labels.map(({ node, x, y, anchor }) => (
            <g key={`label-${node.id}`} className="relation-graph__label">
              {node.href ? (
                <Link href={node.href}>
                  <text x={x} y={y} textAnchor={anchor} className="relation-graph__text">
                    {node.label}
                  </text>
                </Link>
              ) : (
                <text x={x} y={y} textAnchor={anchor} className="relation-graph__text">
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      </ZoomFrame>
      ) : (
        <ZoomFrame label="3D" min={0.85} max={2}>
          <RelationGraph3D data={data} dict={dict} autoRotate={autoRotate} showLabels={showLabels} />
        </ZoomFrame>
      )}
      <div className="relation-graph__legend">
        {groups.map((group) => (
          <span key={group.key} style={{ "--c": group.color } as React.CSSProperties}>
            <i />
            {group.label} <b>{group.nodes.length}</b>
          </span>
        ))}
        <em>{dict.graph.hint}</em>
      </div>
      {showIndex && (
        <div className="relation-index">
          <div className="relation-index__head">
            <span className="micro">{dict.graph.indexTitle}</span>
            <span className="mono">
              {String(data.nodes.length).padStart(2, "0")} {dict.graph.nodes} / {String(data.edges.length).padStart(2, "0")} {dict.graph.edges}
            </span>
          </div>
          <div className="relation-index__cols">
            {groups.map((group) => (
              <div key={group.key} className="relation-index__group">
                <span className="relation-index__label" style={{ color: group.color }}>
                  {group.label}
                </span>
                {group.nodes.map((node) =>
                  node.href ? (
                    <Link key={node.id} href={node.href}>
                      {node.label}
                      {node.meta && <span>{node.meta}</span>}
                    </Link>
                  ) : (
                    <span key={node.id} className="relation-index__plain">
                      {node.label}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
