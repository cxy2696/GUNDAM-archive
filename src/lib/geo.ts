import type { AtlasNode } from "./schema";

/** Shared 2D schematic frame. Distances are compressed for legibility. */
export const ATLAS_FRAME = {
  width: 1000,
  height: 760,
  cx: 460,
  cy: 380,
  earthR: 118,
  moonDist: 370,
  moonR: 30,
  tilt: 0.56,
};

export type Vec2 = { x: number; y: number };

const DEG = Math.PI / 180;

export function lagrangeOrbit(orbit: string): { angle: number; distance: number } {
  switch (orbit) {
    case "L1":
      return { angle: 0, distance: ATLAS_FRAME.moonDist * 0.84 };
    case "L2":
      return { angle: 0, distance: ATLAS_FRAME.moonDist * 1.17 };
    case "L3":
      return { angle: 180, distance: ATLAS_FRAME.moonDist };
    case "L4":
      return { angle: 60, distance: ATLAS_FRAME.moonDist };
    default:
      return { angle: -60, distance: ATLAS_FRAME.moonDist };
  }
}

export function planePoint(angleDeg: number, distance: number): Vec2 {
  const theta = angleDeg * DEG;
  return {
    x: ATLAS_FRAME.cx + Math.cos(theta) * distance,
    y: ATLAS_FRAME.cy + Math.sin(theta) * distance * ATLAS_FRAME.tilt,
  };
}

/** Orthographic projection of a surface coordinate onto a globe disc. */
export function globePoint(
  lat: number,
  lng: number,
  focusLat: number,
  focusLng: number,
  radius: number,
): Vec2 & { visible: boolean; depth: number } {
  const phi = lat * DEG;
  const lambda = (lng - focusLng) * DEG;
  const phi0 = focusLat * DEG;
  const cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);
  const x = radius * Math.cos(phi) * Math.sin(lambda);
  const y = -radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda));
  return { x, y, visible: cosc >= 0, depth: cosc };
}

export const BODY_ANGLES: Record<string, number> = {
  mars: 152,
  venus: 208,
  jupiter: 300,
};

export const BODY_DISTANCE: Record<string, number> = {
  mars: 430,
  venus: 395,
  jupiter: 468,
};

export const BODY_RADIUS: Record<string, number> = {
  moon: 30,
  mars: 26,
  venus: 23,
  jupiter: 34,
};

export function bodyPoint(body: string): Vec2 {
  const angle = BODY_ANGLES[body] ?? 0;
  const distance = BODY_DISTANCE[body] ?? 300;
  if (body === "moon") return planePoint(0, ATLAS_FRAME.moonDist);
  return planePoint(angle, distance);
}

export function deepPoint(distance: number, angle: number): Vec2 {
  const r = Math.min(492, ATLAS_FRAME.moonDist * (0.92 + (distance - 2) * 0.24));
  return planePoint(angle, r);
}

/** Position of an atlas node in the 2D schematic. */
export function nodePoint(
  node: AtlasNode,
  focus: { lon: number; lat: number },
  spread: number,
): Vec2 & { visible: boolean } {
  if (node.anchor === "earth") {
    const p = globePoint(node.lat ?? 0, node.lng ?? 0, focus.lat, focus.lon, ATLAS_FRAME.earthR);
    return { x: ATLAS_FRAME.cx + p.x, y: ATLAS_FRAME.cy + p.y, visible: p.visible };
  }
  if (node.anchor === "moon") {
    const p = globePoint(node.lat ?? 0, node.lng ?? 0, 8, -18, ATLAS_FRAME.moonR);
    const moon = bodyPoint("moon");
    return { x: moon.x + p.x, y: moon.y + p.y, visible: true };
  }
  if (node.anchor === "lagrange" && node.orbit) {
    const orbit = lagrangeOrbit(node.orbit);
    const p = planePoint(orbit.angle, orbit.distance);
    // Spread co-located nodes tangentially so labels do not stack.
    const theta = orbit.angle * DEG;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta) * ATLAS_FRAME.tilt;
    const tx = -Math.sin(theta);
    const ty = Math.cos(theta) * ATLAS_FRAME.tilt;
    return { x: p.x + tx * spread - nx * 0, y: p.y + ty * spread, visible: true };
  }
  if (node.anchor === "earthorbit") {
    const r = ATLAS_FRAME.earthR + 34 + Math.min(190, (node.distance ?? 1.4) * 86);
    return { ...planePoint(node.angle ?? 0, r), visible: true };
  }
  if (node.anchor === "mars" || node.anchor === "venus" || node.anchor === "jupiter") {
    const p = bodyPoint(node.anchor);
    return { x: p.x + spread * 0.7, y: p.y - 12, visible: true };
  }
  const p = deepPoint(node.distance ?? 3.2, node.angle ?? 0);
  return { x: p.x, y: p.y, visible: true };
}

/** Orthographic land-ring path for the SVG globe. */
export function landPath(
  rings: number[][],
  focusLat: number,
  focusLng: number,
  radius: number,
  cx: number,
  cy: number,
): string {
  const chunks: string[] = [];
  for (const ring of rings) {
    let drawing = false;
    let segment = "";
    for (let i = 0; i < ring.length; i += 2) {
      const lat = ring[i + 1];
      const lng = ring[i];
      const p = globePoint(lat, lng, focusLat, focusLng, radius);
      if (p.visible) {
        segment += `${drawing ? "L" : "M"} ${(cx + p.x).toFixed(1)} ${(cy + p.y).toFixed(1)} `;
        drawing = true;
      } else {
        drawing = false;
      }
    }
    if (segment) chunks.push(segment);
  }
  return chunks.join(" ");
}

export function graticule(focusLat: number, focusLng: number, radius: number, cx: number, cy: number): string {
  const out: string[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    let seg = "";
    for (let lng = -180; lng <= 180; lng += 4) {
      const p = globePoint(lat, lng, focusLat, focusLng, radius);
      if (p.visible) seg += `${seg ? "L" : "M"} ${(cx + p.x).toFixed(1)} ${(cy + p.y).toFixed(1)} `;
    }
    if (seg) out.push(seg);
  }
  for (let lng = -150; lng <= 180; lng += 30) {
    let seg = "";
    for (let lat = -88; lat <= 88; lat += 3) {
      const p = globePoint(lat, lng, focusLat, focusLng, radius);
      if (p.visible) seg += `${seg ? "L" : "M"} ${(cx + p.x).toFixed(1)} ${(cy + p.y).toFixed(1)} `;
    }
    if (seg) out.push(seg);
  }
  return out.join(" ");
}

export function spreadFor(nodes: AtlasNode[], node: AtlasNode, key: "orbit" | "body"): number {
  if (key === "orbit") {
    const group = nodes.filter((n) => n.anchor === "lagrange" && n.orbit === node.orbit);
    const index = group.findIndex((n) => n.id === node.id);
    if (group.length <= 1) return 0;
    return (index - (group.length - 1) / 2) * 30;
  }
  const group = nodes.filter((n) => n.anchor === node.anchor);
  const index = group.findIndex((n) => n.id === node.id);
  if (group.length <= 1) return 0;
  return (index - (group.length - 1) / 2) * 22;
}

/** 3D coordinates (Earth radius = 1) used by the WebGL globe. */
export function node3D(node: AtlasNode, focus: { lon: number; lat: number }, spread: number): [number, number, number] {
  const D = 3.2;
  if (node.anchor === "earth") {
    const lat = (node.lat ?? 0) * DEG;
    const lng = (node.lng ?? 0) * DEG;
    const r = 1.015;
    return [r * Math.cos(lat) * Math.cos(lng), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lng)];
  }
  if (node.anchor === "moon") {
    const lat = (node.lat ?? 0) * DEG;
    const lng = (node.lng ?? 0) * DEG;
    const r = 0.31;
    return [D + r * Math.cos(lat) * Math.cos(lng), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lng)];
  }
  if (node.anchor === "lagrange" && node.orbit) {
    const orbit = lagrangeOrbit(node.orbit);
    const dist = (orbit.distance / ATLAS_FRAME.moonDist) * D;
    const theta = orbit.angle * DEG;
    const tx = -Math.sin(theta);
    const tz = -Math.cos(theta);
    return [Math.cos(theta) * dist + (tx * spread) / 150, 0.03, Math.sin(theta) * dist + (tz * spread) / 150];
  }
  if (node.anchor === "earthorbit") {
    const angle = (node.angle ?? 0) * DEG;
    const dist = 1.25 + (node.distance ?? 1.4) * 0.42;
    return [Math.cos(angle) * dist, 0.04, Math.sin(angle) * dist];
  }
  if (node.anchor === "mars" || node.anchor === "venus" || node.anchor === "jupiter") {
    const angle = (BODY_ANGLES[node.anchor] ?? 0) * DEG;
    const dist = 5.4;
    return [Math.cos(angle) * dist + spread / 160, 0, Math.sin(angle) * dist];
  }
  const angle = (node.angle ?? 0) * DEG;
  const dist = 3.2 * (0.95 + (node.distance ?? 3.2) * 0.22);
  return [Math.cos(angle) * dist, 0.1, Math.sin(angle) * dist];
}

export const BODY_3D: Record<string, { radius: number; angle: number; distance: number; color: string }> = {
  earth: { radius: 1, angle: 0, distance: 0, color: "#2f7fbf" },
  moon: { radius: 0.27, angle: 0, distance: 3.2, color: "#9aa4ad" },
  mars: { radius: 0.38, angle: 152, distance: 5.4, color: "#b4552f" },
  venus: { radius: 0.34, angle: 208, distance: 4.6, color: "#c9a45c" },
  jupiter: { radius: 0.62, angle: 300, distance: 6.4, color: "#c8a37a" },
};
