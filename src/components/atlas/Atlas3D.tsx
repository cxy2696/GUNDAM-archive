"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { AtlasEra, AtlasNode, Faction, Lang } from "@/lib/schema";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { BODY_3D, node3D } from "@/lib/geo";
import { WORLD_LAND_RINGS } from "@/lib/world-land";

const DEG = Math.PI / 180;

function makeEarthTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0, "#03130a");
  ocean.addColorStop(0.45, "#06301a");
  ocean.addColorStop(0.55, "#052616");
  ocean.addColorStop(1, "#020d06");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  // faint latitude bands
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = (0.5 - lat / 180) * H;
    ctx.strokeStyle = `rgba(110,200,255,${lat === 0 ? 0.16 : 0.07})`;
    ctx.lineWidth = lat === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    const x = (0.5 + lng / 360) * W;
    ctx.strokeStyle = "rgba(110,200,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(38,128,132,0.85)";
  ctx.strokeStyle = "rgba(130,240,238,0.75)";
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";

  for (const ring of WORLD_LAND_RINGS) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < ring.length; i += 2) {
      const lng = ring[i];
      const lat = ring[i + 1];
      const x = (0.5 + lng / 360) * W;
      const y = (0.5 - lat / 180) * H;
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // city-light style speckle on land is approximated with a sparse noise
  for (let i = 0; i < 260; i += 1) {
    const x = (i * 811) % W;
    const y = (i * 457) % H;
    ctx.fillStyle = `rgba(255,214,140,${0.05 + (i % 5) * 0.02})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#6f9a7c";
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 97) % 512;
      const y = (i * 53) % 256;
      const r = 2 + (i % 6) * 2.4;
      ctx.fillStyle = `rgba(40,48,56,${0.16 + (i % 4) * 0.06})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(190,205,215,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const Earth = forwardRef<THREE.Mesh, { focus: { lon: number; lat: number }; onMiss: () => void }>(
  function Earth({ focus, onMiss }, ref) {
  const texture = useMemo(() => makeEarthTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group>
      <mesh ref={ref} onClick={onMiss} castShadow receiveShadow>
        <sphereGeometry args={[1, 96, 64]} />
        <meshStandardMaterial map={texture} roughness={0.76} metalness={0.12} emissive="#0a3a20" emissiveIntensity={0.28} />
      </mesh>
      <mesh scale={1.004}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial color="#58ff9d" wireframe transparent opacity={0.05} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial color="#45ffd0" transparent opacity={0.09} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[4, 3, 5]} intensity={2.2} color="#eafff0" distance={18} />
      {/* focus marker */}
      <mesh position={[Math.cos(focus.lat * DEG) * Math.cos(focus.lon * DEG) * 1.01, Math.sin(focus.lat * DEG) * 1.01, -Math.cos(focus.lat * DEG) * Math.sin(focus.lon * DEG) * 1.01]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#d8ff63" />
      </mesh>
    </group>
  );
});

function BodySphere({ body, label }: { body: string; label: string }) {
  const moonTexture = useMemo(() => (body === "moon" ? makeMoonTexture() : null), [body]);
  useEffect(() => () => moonTexture?.dispose(), [moonTexture]);
  const info = BODY_3D[body];
  if (!info) return null;
  const x = body === "moon" ? info.distance : Math.cos(info.angle * DEG) * info.distance;
  const z = body === "moon" ? 0 : Math.sin(info.angle * DEG) * info.distance;
  return (
    <group position={[x, 0, z]}>
      <mesh>
        <sphereGeometry args={[info.radius, 48, 32]} />
        {moonTexture ? (
          <meshStandardMaterial map={moonTexture} roughness={0.95} metalness={0.05} emissive="#294534" emissiveIntensity={0.35} />
        ) : (
          <meshStandardMaterial color={info.color} roughness={0.85} metalness={0.08} emissive={info.color} emissiveIntensity={0.12} />
        )}
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[info.radius, 24, 16]} />
        <meshBasicMaterial color="#9dffc4" wireframe transparent opacity={0.08} />
      </mesh>
      <Html position={[0, info.radius + 0.16, 0]} center className="atlas3d__body-label" zIndexRange={[20, 0]}>
        <span>{label}</span>
      </Html>
    </group>
  );
}

function Marker({
  node,
  position,
  color,
  active,
  label,
  onClick,
  showLabel,
  labelOffset,
  occlude,
}: {
  node: AtlasNode;
  position: [number, number, number];
  color: string;
  active: boolean;
  label: string;
  onClick: () => void;
  showLabel: boolean;
  labelOffset: [number, number, number];
  occlude: React.RefObject<THREE.Object3D | null>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * (active ? 0.16 : 0);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.4 : 0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      {(active || hovered || showLabel) && (
        <Html position={labelOffset} center occlude={[occlude as React.RefObject<THREE.Object3D>]} className={`atlas3d__label ${active ? "is-active" : ""}`} zIndexRange={[30, 0]}>
          <span>{label}</span>
        </Html>
      )}
    </group>
  );
}

function ColonyCluster({
  node,
  position,
  color,
  active,
  label,
  onClick,
  showLabel,
  labelOffset,
  occlude,
}: {
  node: AtlasNode;
  position: [number, number, number];
  color: string;
  active: boolean;
  label: string;
  onClick: () => void;
  showLabel: boolean;
  labelOffset: [number, number, number];
  occlude: React.RefObject<THREE.Object3D | null>;
}) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      rotation={[0, Math.atan2(position[2], position[0]), 0]}
    >
      <mesh>
        <torusGeometry args={[0.075, 0.006, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.2 : 0.4} />
      </mesh>
      {[0, 1, 2, 3].map((index) => {
        const theta = (index / 4) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(theta) * 0.075, Math.sin(theta) * 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.05, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
          </mesh>
        );
      })}
      {node.priority === 1 && <pointLight color={color} intensity={0.6} distance={1.4} />}
      {(active || showLabel) && (
        <Html position={labelOffset} center occlude={[occlude as React.RefObject<THREE.Object3D>]} className={`atlas3d__label ${active ? "is-active" : ""}`} zIndexRange={[30, 0]}>
          <span>{label}</span>
        </Html>
      )}
    </group>
  );
}

function Scene({
  era,
  factions,
  lang,
  dict,
  selectedId,
  onSelect,
  autoRotate,
  showLabels = true,
}: {
  era: AtlasEra;
  factions: Faction[];
  lang: Lang;
  dict: Dictionary;
  selectedId: string | null;
  onSelect: (id: string) => void;
  autoRotate: boolean;
  showLabels?: boolean;
}) {
  const groupRefs = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const maxDistance = era.bodies.includes("jupiter") ? 8.2 : era.bodies.includes("mars") ? 6.6 : 4.4;

  const nodeData = useMemo(() => {
    const nodes = era.nodes.map((node) => {
      const spread =
        node.anchor === "lagrange"
          ? (() => {
              const group = era.nodes.filter((n) => n.anchor === "lagrange" && n.orbit === node.orbit);
              const index = group.findIndex((n) => n.id === node.id);
              return (index - (group.length - 1) / 2) * 26;
            })()
          : 0;
      const position = node3D(node, era.focus, spread);
      const faction = node.factionId ? factions.find((item) => item.id === node.factionId) : undefined;
      return { node, position, color: faction?.color ?? "#58ff9d" };
    });
    const byId = new Map(nodes.map((item) => [item.node.id, item]));
    const routes = era.routes
      .map((route) => {
        const from = byId.get(route.from);
        const to = byId.get(route.to);
        if (!from || !to) return null;
        const mid = new THREE.Vector3(
          (from.position[0] + to.position[0]) / 2,
          0.55,
          (from.position[2] + to.position[2]) / 2,
        );
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(...from.position),
          mid,
          new THREE.Vector3(...to.position),
        );
        return { key: `${route.from}-${route.to}`, points: curve.getPoints(36), kind: route.kind };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return { nodes, routes };
  }, [era, factions]);

  return (
    <>
      <color attach="background" args={["#010603"]} />
      <fog attach="fog" args={["#010603", 14, 34]} />
      <ambientLight intensity={0.55} color="#a9e8bf" />
      <directionalLight position={[6, 8, 6]} intensity={1.9} color="#eafff0" />
      <Stars radius={70} depth={40} count={1800} factor={3.2} saturation={0.35} fade speed={0.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <ringGeometry args={[1.4, 9.6, 96, 1]} />
        <meshBasicMaterial color="#1f5a35" transparent opacity={0.035} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRefs}>
        <Earth
          ref={earthRef}
          focus={era.focus}
          onMiss={() => {
            /* keep selection */
          }}
        />
        {era.bodies
          .filter((body) => body !== "earth")
          .map((body) => (
            <BodySphere key={body} body={body} label={dict.atlas.bodies[body as keyof Dictionary["atlas"]["bodies"]] ?? body} />
          ))}

        <Line
          points={Array.from({ length: 129 }, (_, index) => {
            const theta = (index / 128) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(theta) * 3.2, 0, Math.sin(theta) * 3.2);
          })}
          color="#2f7a4a"
          transparent
          opacity={0.4}
          lineWidth={0.7}
          dashed
          dashSize={0.08}
          gapSize={0.12}
        />

        {nodeData.routes.map((route) => (
          <Line
            key={route.key}
            points={route.points}
            color="#d8ff63"
            transparent
            opacity={0.55}
            lineWidth={1}
            dashed
            dashSize={0.1}
            gapSize={0.1}
          />
        ))}

        {nodeData.nodes.map(({ node, position, color }, index) =>
          node.anchor === "lagrange" || (node.anchor === "earthorbit" && node.kind === "colony") ? (
            <ColonyCluster
              key={node.id}
              node={node}
              position={position}
              color={color}
              active={node.id === selectedId}
              label={pick(node.name, lang)}
              onClick={() => onSelect(node.id)}
              showLabel={showLabels && node.priority === 1 && !["city", "region", "capital"].includes(node.kind)}
              labelOffset={[((index % 3) - 1) * 0.14, 0.2 + (index % 5) * 0.24, 0]}
              occlude={earthRef}
            />
          ) : (
            <Marker
              key={node.id}
              node={node}
              position={position}
              color={color}
              active={node.id === selectedId}
              label={pick(node.name, lang)}
              onClick={() => onSelect(node.id)}
              showLabel={showLabels && node.priority === 1 && !["city", "region", "capital"].includes(node.kind)}
              labelOffset={[((index % 3) - 1) * 0.14, 0.22 + (index % 5) * 0.24, 0]}
              occlude={earthRef}
            />
          ),
        )}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={maxDistance * 2.4}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.07}
        target={[0, 0, 0]}
      />
      <CameraRig era={era} maxDistance={maxDistance} />
    </>
  );
}

function CameraRig({ era, maxDistance }: { era: AtlasEra; maxDistance: number }) {
  const { camera } = useThree();
  useEffect(() => {
    const dir = new THREE.Vector3(
      Math.cos(era.focus.lat * DEG) * Math.cos(era.focus.lon * DEG),
      Math.sin(era.focus.lat * DEG) + 0.22,
      -Math.cos(era.focus.lat * DEG) * Math.sin(era.focus.lon * DEG),
    ).normalize();
    const distance = maxDistance * 1.12;
    camera.position.copy(dir.multiplyScalar(distance)).add(new THREE.Vector3(0, maxDistance * 0.95, 0));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, era.eraId, era.focus.lat, era.focus.lon, maxDistance]);
  return null;
}


export function Atlas3D({
  era,
  factions,
  lang,
  dict,
  selectedId,
  onSelect,
  autoRotate,
  showLabels = true,
}: {
  era: AtlasEra;
  factions: Faction[];
  lang: Lang;
  dict: Dictionary;
  selectedId: string | null;
  onSelect: (id: string) => void;
  autoRotate: boolean;
  showLabels?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="atlas3d__fallback">{dict.atlas.fallback}</div>;
  }
  return (
    <div className="atlas3d">
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 6, 11], fov: 42, near: 0.1, far: 120 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setFailed(true));
        }}
      >
        <Scene
          era={era}
          factions={factions}
          lang={lang}
          dict={dict}
          selectedId={selectedId}
          onSelect={onSelect}
          autoRotate={autoRotate}
          showLabels={showLabels}
        />
      </Canvas>
      <div className="atlas3d__hint" aria-hidden>
        {dict.atlas.globeHint}
      </div>
    </div>
  );
}
