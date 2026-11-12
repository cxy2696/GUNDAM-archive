"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AtlasEra, AtlasNode, Faction, Lang } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import {
  ATLAS_FRAME,
  BODY_ANGLES,
  BODY_DISTANCE,
  BODY_RADIUS,
  bodyPoint,
  globePoint,
  graticule,
  landPath,
  lagrangeOrbit,
  nodePoint,
  planePoint,
  spreadFor,
} from "@/lib/geo";
import { WORLD_LAND_RINGS } from "@/lib/world-land";

type Rect = { x: number; y: number; w: number; h: number };

const approxWidth = (text: string, size: number) =>
  [...text].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 255 ? size : size * 0.56), 0);

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const KIND_SHAPE: Record<string, string> = {
  capital: "diamond",
  city: "diamond",
  colony: "circle",
  station: "square",
  fortress: "square",
  battlefield: "cross",
  elevator: "triangle",
  region: "hex",
  fleet: "tri",
};

function equirectPath(rings: number[][], width: number, height: number): string {
  const chunks: string[] = [];
  for (const ring of rings) {
    let seg = "";
    let prev: number | null = null;
    for (let i = 0; i < ring.length; i += 2) {
      const lng = ring[i];
      const lat = ring[i + 1];
      if (prev !== null && Math.abs(lng - prev) > 180) {
        if (seg) chunks.push(seg);
        seg = "";
      }
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      seg += `${seg ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)} `;
      prev = lng;
    }
    if (seg) chunks.push(seg);
  }
  return chunks.join(" ");
}

export function Atlas2D({
  era,
  factions,
  lang,
  dict,
  selectedId,
  onSelect,
}: {
  era: AtlasEra;
  factions: Faction[];
  lang: Lang;
  dict: Dictionary;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [focus, setFocus] = useState(era.focus);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; lon: number; lat: number } | null>(null);

  useEffect(() => {
    setFocus(era.focus);
  }, [era.eraId, era.focus]);

  const globe = useMemo(
    () => ({
      land: landPath(WORLD_LAND_RINGS, focus.lat, focus.lon, ATLAS_FRAME.earthR, ATLAS_FRAME.cx, ATLAS_FRAME.cy),
      grid: graticule(focus.lat, focus.lon, ATLAS_FRAME.earthR, ATLAS_FRAME.cx, ATLAS_FRAME.cy),
    }),
    [focus],
  );

  const strip = useMemo(() => {
    const width = 392;
    const height = 118;
    return {
      width,
      height,
      path: equirectPath(WORLD_LAND_RINGS, width, height),
    };
  }, []);

  const nodes = useMemo(
    () =>
      era.nodes.map((node) => {
        const point = nodePoint(
          node,
          focus,
          node.anchor === "lagrange"
            ? spreadFor(era.nodes, node, "orbit")
            : node.anchor === "mars" || node.anchor === "venus" || node.anchor === "jupiter"
              ? spreadFor(era.nodes, node, "body")
              : 0,
        );
        const faction = node.factionId ? factions.find((item) => item.id === node.factionId) : undefined;
        return { node, ...point, faction };
      }),
    [era.nodes, focus, factions],
  );

  const visibleNodes = nodes.filter((item) => item.visible);
  const selected = nodes.find((item) => item.node.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const node = era.nodes.find((item) => item.id === selectedId);
    if (!node || node.anchor !== "earth") return;
    const projected = globePoint(node.lat ?? 0, node.lng ?? 0, focus.lat, focus.lon, ATLAS_FRAME.earthR);
    if (!projected.visible) {
      setFocus({ lon: node.lng ?? 0, lat: Math.max(-55, Math.min(55, node.lat ?? 0)) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const labels = useMemo(() => {
    const placed: { item: (typeof nodes)[number]; rect: Rect; x: number; y: number; anchor: "start" | "end" | "middle" }[] = [];
    const taken: Rect[] = [
      { x: ATLAS_FRAME.cx - ATLAS_FRAME.earthR * 0.9, y: ATLAS_FRAME.cy + ATLAS_FRAME.earthR + 8, w: 80, h: 26 },
      { x: bodyPoint("moon").x - 30, y: bodyPoint("moon").y + 26, w: 60, h: 26 },
    ];
    const size = 13;
    const sorted = [...visibleNodes].sort((a, b) => {
      if (a.node.id === selectedId) return -1;
      if (b.node.id === selectedId) return 1;
      return a.node.priority - b.node.priority;
    });
    for (const item of sorted) {
      if (item.node.priority > 2 && item.node.id !== selectedId) continue;
      const name = pick(item.node.name, lang);
      const w = approxWidth(name, size) + 12;
      const h = 18;
      const bodyX = item.node.anchor === "moon" ? bodyPoint("moon").x : item.node.anchor === "earth" ? ATLAS_FRAME.cx : ATLAS_FRAME.cx;
      const bodyY = item.node.anchor === "moon" ? bodyPoint("moon").y : item.node.anchor === "earth" ? ATLAS_FRAME.cy : ATLAS_FRAME.cy;
      const outward = Math.atan2(item.y - bodyY, item.x - bodyX);
      let preferred = outward;
      if (item.node.anchor === "moon") preferred = Math.PI / 2;
      else if (item.node.orbit === "L1") preferred = -Math.PI / 2;
      else if (item.node.orbit === "L2") preferred = 0;
      else if (item.node.orbit === "L3") preferred = Math.PI;
      else if (item.node.orbit === "L4") preferred = Math.PI / 2;
      else if (item.node.orbit === "L5") preferred = -Math.PI / 2;
      const order = [0, -0.42, 0.42, -0.85, 0.85, -1.25, 1.25].map(
        (offset) => preferred + offset,
      );
      order.push(outward, outward + Math.PI);
      let done = false;
      for (const radius of [18, 36, 58, 82]) {
        if (done) break;
        for (const offset of order) {
          const angle = outward + offset;
          const x = item.x + Math.cos(angle) * radius;
          const y = item.y + Math.sin(angle) * radius + 4;
          const anchor = Math.cos(angle) > 0.24 ? ("start" as const) : Math.cos(angle) < -0.24 ? ("end" as const) : ("middle" as const);
          const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
          const rect = { x: left - 2, y: y - 13, w: w + 4, h: h + 5 };
          if (rect.x < 8 || rect.y < 8 || rect.x + rect.w > ATLAS_FRAME.width - 8 || rect.y + rect.h > ATLAS_FRAME.height - 8) {
            continue;
          }
          if (taken.some((other) => overlaps(rect, other))) continue;
          taken.push(rect);
          placed.push({ item, rect, x, y, anchor });
          done = true;
          break;
        }
      }
    }
    return placed;
  }, [visibleNodes, lang, selectedId]);

  const onPointerDown = (event: React.PointerEvent<SVGElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY, lon: focus.lon, lat: focus.lat };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    setFocus({
      lon: ((start.lon - dx * 0.45 + 540) % 360) - 180,
      lat: Math.max(-62, Math.min(62, start.lat + dy * 0.32)),
    });
  };

  const selectSurface = (node: (typeof era.nodes)[number]) => {
    onSelect(node.id);
    setFocus({ lon: node.lng ?? 0, lat: Math.max(-55, Math.min(55, node.lat ?? 0)) });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const moon = bodyPoint("moon");

  return (
    <div className="atlas2d">
      <div className="atlas2d__hud" aria-hidden>
        <span>{dict.atlas.globeHint}</span>
        <span className="mono">
          LAT {focus.lat.toFixed(0)}° / LON {focus.lon.toFixed(0)}°
        </span>
      </div>
      <svg
        viewBox={`0 0 ${ATLAS_FRAME.width} ${ATLAS_FRAME.height}`}
        className="atlas2d__svg"
        role="img"
        aria-label={`${pick(era.geography, lang)}`}
      >
        <defs>
          <radialGradient id="atlas-ocean" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#123a56" />
            <stop offset="52%" stopColor="#0a2136" />
            <stop offset="100%" stopColor="#04101f" />
          </radialGradient>
          <radialGradient id="atlas-atmo" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="rgba(90,200,255,0.16)" />
            <stop offset="100%" stopColor="rgba(90,200,255,0)" />
          </radialGradient>
          <radialGradient id="atlas-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(154,134,255,0.34)" />
            <stop offset="100%" stopColor="rgba(154,134,255,0)" />
          </radialGradient>
          <linearGradient id="atlas-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,182,72,0.1)" />
            <stop offset="50%" stopColor="rgba(255,182,72,0.75)" />
            <stop offset="100%" stopColor="rgba(255,182,72,0.1)" />
          </linearGradient>
          <clipPath id="atlas-globe-clip">
            <circle cx={ATLAS_FRAME.cx} cy={ATLAS_FRAME.cy} r={ATLAS_FRAME.earthR} />
          </clipPath>
          <marker id="atlas-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" fill="rgba(255,182,72,0.85)" />
          </marker>
        </defs>

        <g className="atlas2d__stars" aria-hidden>
          {Array.from({ length: 64 }).map((_, index) => (
            <circle
              key={index}
              cx={((index * 173) % ATLAS_FRAME.width) + 6}
              cy={((index * 97) % ATLAS_FRAME.height) + 4}
              r={index % 9 === 0 ? 1.3 : 0.7}
              fill="#cfe7ff"
              opacity={0.12 + (index % 5) * 0.05}
            />
          ))}
        </g>

        {/* orbital plane rings */}
        <g className="atlas2d__orbits" aria-hidden>
          <ellipse
            cx={ATLAS_FRAME.cx}
            cy={ATLAS_FRAME.cy}
            rx={ATLAS_FRAME.moonDist}
            ry={ATLAS_FRAME.moonDist * ATLAS_FRAME.tilt}
            fill="none"
            stroke="rgba(120,190,255,0.2)"
            strokeDasharray="3 7"
          />
          {era.bodies
            .filter((body) => body !== "earth" && body !== "moon")
            .map((body) => (
              <ellipse
                key={body}
                cx={ATLAS_FRAME.cx}
                cy={ATLAS_FRAME.cy}
                rx={BODY_DISTANCE[body]}
                ry={BODY_DISTANCE[body] * ATLAS_FRAME.tilt}
                fill="none"
                stroke="rgba(120,190,255,0.1)"
                strokeDasharray="2 10"
              />
            ))}
          {["L1", "L2", "L3", "L4", "L5"].map((orbit) => {
            const info = lagrangeOrbit(orbit);
            const p = planePoint(info.angle, info.distance);
            const dist = Math.hypot(p.x - ATLAS_FRAME.cx, p.y - ATLAS_FRAME.cy);
            const angle = Math.atan2(p.y - ATLAS_FRAME.cy, p.x - ATLAS_FRAME.cx);
            return (
              <g key={orbit} className="atlas2d__lpoint">
                <line
                  x1={ATLAS_FRAME.cx}
                  y1={ATLAS_FRAME.cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(120,190,255,0.1)"
                  strokeDasharray="2 6"
                />
                <text
                  x={p.x + Math.cos(angle) * 12}
                  y={p.y + Math.sin(angle) * 12 + 4}
                  textAnchor={Math.cos(angle) >= 0 ? "start" : "end"}
                  className="atlas2d__lpoint-label"
                >
                  {orbit}
                </text>
                <circle cx={p.x} cy={p.y} r={dist > 0 ? 2 : 0} fill="rgba(120,190,255,0.45)" />
              </g>
            );
          })}
        </g>

        {/* planets */}
        {era.bodies
          .filter((body) => body !== "earth")
          .map((body) => {
            const p = body === "moon" ? moon : bodyPoint(body);
            const r = BODY_RADIUS[body] ?? 24;
            return (
              <g key={body} className={`atlas2d__body atlas2d__body--${body}`}>
                <circle cx={p.x} cy={p.y} r={r + 10} fill={`url(#atlas-glow)`} opacity={body === "moon" ? 0.5 : 0.4} />
                <circle cx={p.x} cy={p.y} r={r} fill="#0a1524" stroke="rgba(170,210,240,0.5)" strokeWidth={1.1} />
                <circle cx={p.x + r * 0.55} cy={p.y - r * 0.5} r={r * 0.18} fill="rgba(255,255,255,0.12)" />
                <text x={p.x} y={p.y + r + 16} textAnchor="middle" className="atlas2d__body-label">
                  {dict.atlas.bodies[body]}
                </text>
              </g>
            );
          })}

        {/* Earth */}
        <g
          className={`atlas2d__globe ${dragging ? "is-dragging" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          <circle cx={ATLAS_FRAME.cx} cy={ATLAS_FRAME.cy} r={ATLAS_FRAME.earthR + 26} fill="url(#atlas-atmo)" />
          <circle cx={ATLAS_FRAME.cx} cy={ATLAS_FRAME.cy} r={ATLAS_FRAME.earthR} fill="url(#atlas-ocean)" />
          <g clipPath="url(#atlas-globe-clip)">
            <path d={globe.land} fill="rgba(44,130,134,0.42)" stroke="rgba(120,230,240,0.55)" strokeWidth={0.85} strokeLinejoin="round" />
            <path d={globe.grid} fill="none" stroke="rgba(120,190,255,0.16)" strokeWidth={0.55} />
            <ellipse
              cx={ATLAS_FRAME.cx - ATLAS_FRAME.earthR * 0.34}
              cy={ATLAS_FRAME.cy - ATLAS_FRAME.earthR * 0.38}
              rx={ATLAS_FRAME.earthR * 0.8}
              ry={ATLAS_FRAME.earthR * 0.5}
              fill="rgba(255,255,255,0.05)"
              transform={`rotate(-24 ${ATLAS_FRAME.cx} ${ATLAS_FRAME.cy})`}
            />
          </g>
          <circle cx={ATLAS_FRAME.cx} cy={ATLAS_FRAME.cy} r={ATLAS_FRAME.earthR} fill="none" stroke="rgba(120,220,255,0.5)" strokeWidth={1.1} />
          <circle cx={ATLAS_FRAME.cx} cy={ATLAS_FRAME.cy} r={ATLAS_FRAME.earthR + 4} fill="none" stroke="rgba(120,220,255,0.14)" strokeWidth={3} />
          <text x={ATLAS_FRAME.cx - ATLAS_FRAME.earthR * 0.9} y={ATLAS_FRAME.cy + ATLAS_FRAME.earthR + 24} textAnchor="start" className="atlas2d__body-label">
            {dict.atlas.bodies.earth}
          </text>
        </g>

        {/* routes */}
        <g className="atlas2d__routes" aria-hidden>
          {era.routes.map((route) => {
            const from = nodes.find((item) => item.node.id === route.from);
            const to = nodes.find((item) => item.node.id === route.to);
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.hypot(dx, dy) || 1;
            const ctrlX = mx - (dy / len) * 34;
            const ctrlY = my + (dx / len) * 34;
            return (
              <path
                key={`${route.from}-${route.to}-${route.kind}`}
                d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                fill="none"
                stroke="url(#atlas-route)"
                strokeWidth={1.3}
                strokeDasharray={route.kind === "supply" ? "4 7" : route.kind === "migration" ? "1 8" : undefined}
                markerEnd="url(#atlas-arrow)"
                opacity={0.8}
              />
            );
          })}
        </g>

        {/* markers */}
        <g className="atlas2d__markers">
          {visibleNodes.map(({ node, x, y, faction }) => {
            const active = node.id === selectedId;
            const color = faction?.color ?? "#58ff9d";
            const shape = KIND_SHAPE[node.kind] ?? "circle";
            return (
              <g
                key={node.id}
                className={`atlas2d__marker ${active ? "is-active" : ""}`}
                transform={`translate(${x} ${y})`}
                onClick={() => onSelect(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(node.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={pick(node.name, lang)}
              >
                {active && <circle r={12} fill="none" stroke={color} strokeWidth={1} opacity={0.65} className="atlas2d__ring" />}
                {shape === "circle" && <circle r={5} fill={color} stroke="#04101c" strokeWidth={1.2} />}
                {shape === "square" && <rect x={-4.6} y={-4.6} width={9.2} height={9.2} fill={color} stroke="#04101c" strokeWidth={1.1} transform="rotate(45)" />}
                {shape === "diamond" && <path d="M0 -5.4 L5.4 0 L0 5.4 L-5.4 0 Z" fill={color} stroke="#04101c" strokeWidth={1.1} />}
                {shape === "triangle" && <path d="M0 -5.8 L5.6 4.8 L-5.6 4.8 Z" fill={color} stroke="#04101c" strokeWidth={1.1} />}
                {shape === "cross" && (
                  <path d="M-5 0 H5 M0 -5 V5" stroke={color} strokeWidth={2.1} strokeLinecap="round" />
                )}
                {shape === "hex" && <path d="M0 -6 L5.2 -3 L5.2 3 L0 6 L-5.2 3 L-5.2 -3 Z" fill={color} stroke="#04101c" strokeWidth={1} />}
                {shape === "tri" && <path d="M0 -5 L5.4 4 L-5.4 4 Z" fill="none" stroke={color} strokeWidth={1.6} />}
                <circle r={11} fill="transparent" />
                <title>{`${pick(node.name, lang)} · ${dict.atlas.kinds[node.kind]}`}</title>
              </g>
            );
          })}
        </g>

        {/* labels (collision-aware) */}
        <g className="atlas2d__labels" aria-hidden>
          {labels.map(({ item, x, y, anchor }) => (
            <g key={`label-${item.node.id}`} className={`atlas2d__label ${item.node.id === selectedId ? "is-active" : ""}`}>
              <line
                x1={item.x}
                y1={item.y}
                x2={x}
                y2={y - 4}
                stroke={item.faction?.color ?? "rgba(140,210,240,0.55)"}
                strokeWidth={0.7}
                opacity={0.5}
              />
              <text
                x={x}
                y={y}
                textAnchor={anchor}
                fill={item.node.id === selectedId ? "#ffffff" : "rgba(214,236,244,0.9)"}
              >
                {pick(item.node.name, lang)}
              </text>
            </g>
          ))}
        </g>

        <g className="atlas2d__strip" aria-label={dict.atlas.surface}>
          <rect x={22} y={604} width={strip.width + 20} height={strip.height + 42} fill="rgba(4,10,20,0.78)" stroke="rgba(120,170,210,0.24)" />
          <text x={34} y={622} className="atlas2d__strip-title">
            SURFACE / {dict.atlas.surface}
          </text>
          <g transform={`translate(32, 632)`}>
            <rect x={0} y={0} width={strip.width} height={strip.height} fill="rgba(10,26,42,0.55)" stroke="rgba(120,170,210,0.18)" />
            <path d={strip.path} fill="rgba(44,130,134,0.28)" stroke="rgba(120,220,235,0.35)" strokeWidth={0.6} strokeLinejoin="round" />
            {era.nodes
              .filter((node) => node.anchor === "earth")
              .map((node) => {
                const x = (((node.lng ?? 0) + 180) / 360) * strip.width;
                const y = ((90 - (node.lat ?? 0)) / 180) * strip.height;
                const active = node.id === selectedId;
                return (
                  <g
                    key={`strip-${node.id}`}
                    transform={`translate(${x} ${y})`}
                    className={`atlas2d__strip-marker ${active ? "is-active" : ""}`}
                    onClick={() => selectSurface(node)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") selectSurface(node);
                    }}
                    aria-label={pick(node.name, lang)}
                  >
                    <circle r={active ? 4.2 : 2.8} fill={active ? "#d8ff63" : "rgba(99,230,255,0.85)"} stroke="#04101c" strokeWidth={0.8} />
                    <circle r={8} fill="transparent" />
                    <title>{pick(node.name, lang)}</title>
                  </g>
                );
              })}
          </g>
          <text x={34} y={604 + strip.height + 30} className="atlas2d__strip-note">
            {dict.atlas.formatNote}
          </text>
        </g>

        {selected && selected.node.kind !== "region" && (
          <g className="atlas2d__target" aria-hidden>
            <line x1={selected.x} y1={selected.y - 14} x2={selected.x} y2={selected.y - 46} stroke={selected.faction?.color ?? "#58ff9d"} strokeWidth={0.9} />
            <text x={selected.x} y={selected.y - 52} textAnchor="middle" className="atlas2d__target-label">
              TARGET LOCK
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
