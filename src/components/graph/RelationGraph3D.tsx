"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Dictionary } from "@/lib/i18n";
import type { GraphData, GraphNode } from "@/lib/graph";

const EDGE_COLOR: Record<string, string> = {
  hostility: "#ff7164",
  alliance: "#6bff9f",
  succession: "#d8ff63",
  split: "#d8ff63",
  affiliation: "#58ff9d",
  family: "#f472b6",
  mentor: "#b4ff6a",
  comrade: "#6bff9f",
  rival: "#ff7164",
  admiration: "#f472b6",
  lineage: "#6bff9f",
  event: "#ff7164",
};

type Positioned = { node: GraphNode; position: [number, number, number]; angle: number; radius: number };

function layout(data: GraphData): { nodes: Positioned[]; groups: { label: string; color: string; angle: number; radius: number }[] } {
  const groups: { key: string; label: string; color: string; nodes: GraphNode[] }[] = [];
  for (const node of data.nodes) {
    let group = groups.find((item) => item.key === node.group);
    if (!group) {
      group = { key: node.group, label: node.groupLabel, color: node.color, nodes: [] };
      groups.push(group);
    }
    group.nodes.push(node);
  }
  const total = groups.reduce((sum, group) => sum + group.nodes.length + 1.2, 0);
  let cursor = -Math.PI / 2;
  const positioned: Positioned[] = [];
  const labels: { label: string; color: string; angle: number; radius: number }[] = [];
  groups.forEach((group, groupIndex) => {
    const span = ((group.nodes.length + 1.2) / total) * Math.PI * 2;
    const start = cursor + 0.06;
    const end = cursor + span - 0.06;
    group.nodes.forEach((node, index) => {
      const ratio = (index + 0.5) / group.nodes.length;
      const angle = start + (end - start) * ratio;
      const radius = 2.5 + (index % 2) * 0.42 + (groupIndex % 2) * 0.14;
      positioned.push({
        node,
        position: [Math.cos(angle) * radius, ((index % 3) - 1) * 0.3 + (groupIndex % 2) * 0.12, Math.sin(angle) * radius],
        angle,
        radius,
      });
    });
    labels.push({ label: group.label, color: group.color, angle: (start + end) / 2, radius: 3.25 });
    cursor += span;
  });
  return { nodes: positioned, groups: labels };
}

function GraphScene({
  data,
  dict,
  autoRotate,
  showLabels,
  onNavigate,
}: {
  data: GraphData;
  dict: Dictionary;
  autoRotate: boolean;
  showLabels: boolean;
  onNavigate: (href: string) => void;
}) {
  const layoutData = useMemo(() => layout(data), [data]);
  const [hovered, setHovered] = useState<string | null>(null);
  const centerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (centerRef.current) {
      centerRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  const byId = new Map(layoutData.nodes.map((item) => [item.node.id, item]));

  return (
    <>
      <color attach="background" args={["#010603"]} />
      <ambientLight intensity={0.8} color="#a9e8bf" />
      <pointLight position={[4, 6, 5]} intensity={2.4} color="#eafff0" />
      <pointLight position={[-5, -2, -4]} intensity={1.6} color="#b4ff6a" />
      <Stars radius={60} depth={36} count={1400} factor={3} saturation={0.35} fade speed={0.3} />

      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 4.6, 96]} />
        <meshBasicMaterial color="#1f5a35" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={centerRef}>
        <octahedronGeometry args={[0.46, 1]} />
        <meshStandardMaterial color={data.center.color} emissive={data.center.color} emissiveIntensity={0.9} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.78, 24, 16]} />
        <meshBasicMaterial color={data.center.color} wireframe transparent opacity={0.16} />
      </mesh>


      {data.edges.map((edge, index) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        const points = [
          new THREE.Vector3(...from.position),
          new THREE.Vector3((from.position[0] + to.position[0]) / 2, Math.max(from.position[1], to.position[1]) + 0.32, (from.position[2] + to.position[2]) / 2),
          new THREE.Vector3(...to.position),
        ];
        const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]);
        const isLineage = edge.kind === "lineage";
        return (
          <Line
            key={`edge-${edge.from}-${edge.to}-${index}`}
            points={curve.getPoints(24)}
            color={EDGE_COLOR[edge.kind ?? ""] ?? groupColor(byId.get(edge.to)?.node ?? data.center)}
            transparent
            opacity={edge.from === data.center.id || edge.to === data.center.id ? 0.4 : 0.75}
            lineWidth={isLineage ? 1.5 : 1.1}
            dashed={isLineage || edge.kind === "event"}
            dashSize={0.06}
            gapSize={0.06}
          />
        );
      })}

      {layoutData.nodes.map(({ node, position }, index) => {
        const active = hovered === node.id;
        return (
          <group key={node.id} position={position}>
            <mesh
              scale={active ? 1.4 : 1}
              onClick={(event) => {
                event.stopPropagation();
                if (node.href) onNavigate(node.href);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(node.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={active ? 1.6 : 0.7} roughness={0.32} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.12} />
            </mesh>
            {(showLabels || active) && (
              <Html position={[0, 0.2 + (index % 3) * 0.09, 0]} center className={`relation3d__label ${active ? "is-active" : ""}`} zIndexRange={[20, 0]}>
                <span>{node.label}</span>
              </Html>
            )}
          </group>
        );
      })}

      {layoutData.groups.map((group) => (
        <Html
          key={`group-${group.label}`}
          position={[Math.cos(group.angle) * group.radius, 1.5, Math.sin(group.angle) * group.radius]}
          center
          className="relation3d__group"
          zIndexRange={[10, 0]}
        >
          <span style={{ color: group.color }}>{group.label}</span>
        </Html>
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        maxDistance={14}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />
      <Html position={[0, -1.2, 0]} center className="relation3d__hint" zIndexRange={[10, 0]}>
        <span>{dict.graph.hint}</span>
      </Html>
    </>
  );
}

function groupColor(node: GraphNode): string {
  return node.color ?? "#58ff9d";
}

export function RelationGraph3D({
  data,
  dict,
  autoRotate,
  showLabels = true,
}: {
  data: GraphData;
  dict: Dictionary;
  autoRotate: boolean;
  showLabels?: boolean;
}) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="relation3d__fallback">{dict.graph.hint}</div>;
  }
  return (
    <div className="relation3d">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [4.8, 3.4, 5.8], fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", () => setFailed(true))}
      >
        <GraphScene data={data} dict={dict} autoRotate={autoRotate} showLabels={showLabels} onNavigate={(href) => router.push(href)} />
      </Canvas>
      <span className="relation3d__center-badge">
        <b>{data.center.label}</b>
        <span>{data.center.meta}</span>
      </span>
      <span className="relation3d__badge">RELATION / 3D</span>
    </div>
  );
}
