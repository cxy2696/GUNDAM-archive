"use client";

import {
  ContactShadows,
  Edges,
  Environment,
  Grid,
  Lightformer,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Machine } from "@/lib/schema";
import { buildMech, getThrusterAnchors, type ColorKey, type MechPart, type MotionMode, type Piece, type Vec3 } from "./model";
import type { MechCore } from "@/lib/mech-core";
import type { BvhPlayback, BvhPose } from "@/lib/bvh";

export type ViewName = "iso" | "front" | "side" | "back" | "top";

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function presetPosition(view: ViewName, h: number): Vec3 {
  switch (view) {
    case "front":
      return [0, h * 0.48, h * 1.86];
    case "side":
      return [h * 1.86, h * 0.48, 0];
    case "back":
      return [0, h * 0.48, -h * 1.86];
    case "top":
      return [0.01, h * 2.2, h * 0.02];
    default:
      return [h * 1.18, h * 0.57, h * 1.66];
  }
}

function radiusFor(piece: Piece) {
  if (piece.shape === "cyl" || piece.shape === "cone") return Math.min(0.06, piece.size[0] * 0.2);
  return Math.min(0.075, Math.min(piece.size[0], piece.size[1], piece.size[2]) * 0.14);
}

function PieceMesh({
  piece,
  colors,
  active,
  quantum,
  wireframe,
}: {
  piece: Piece;
  colors: Machine["viewer"]["colors"];
  active: boolean;
  quantum: number;
  wireframe: boolean;
}) {
  const baseColor = colors[piece.color as ColorKey];
  const color = useMemo(() => {
    if (quantum < 0.02 || piece.color === "eye") return baseColor;
    return new THREE.Color(baseColor).lerp(new THREE.Color("#5cc8ff"), quantum * 0.34).getStyle();
  }, [baseColor, quantum, piece.color]);
  const isEye = piece.color === "eye" || piece.emissive;
  const metalness = piece.color === "frame" ? 0.92 : piece.color === "accent" ? 0.72 : 0.68;
  const roughness = piece.color === "frame" ? 0.3 : piece.color === "accent" ? 0.26 : 0.4;
  const emissive = active || isEye ? colors.eye : "#000000";
  const emissiveIntensity = active ? 0.85 : isEye ? 1.8 : quantum * 0.55;
  const edgeColor = active
    ? "#b9e8ff"
    : wireframe
      ? "rgba(92,200,255,0.55)"
      : quantum > 0.05
        ? "rgba(92,200,255,0.22)"
        : "#050d12";

  const prismGeometry = useMemo(() => {
    if (piece.shape !== "prism" || !piece.points) return null;
    const shape = new THREE.Shape();
    piece.points.forEach(([x, y], index) => {
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: piece.size[2],
      bevelEnabled: true,
      bevelSize: 0.045,
      bevelThickness: 0.045,
      bevelSegments: 2,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -piece.size[2] / 2);
    geometry.computeVertexNormals();
    return geometry;
  }, [piece]);

  const material = (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      transparent={piece.opacity !== undefined}
      opacity={piece.opacity ?? 1}
      toneMapped={!isEye}
    />
  );

  if (piece.shape === "box") {
    return (
      <RoundedBox
        args={piece.size}
        radius={radiusFor(piece)}
        smoothness={2}
        position={piece.pos}
        rotation={piece.rot}
        castShadow
        receiveShadow
      >
        {material}
        <Edges threshold={22} color={edgeColor} scale={1.001} />
      </RoundedBox>
    );
  }

  if (piece.shape === "prism" && prismGeometry) {
    return (
      <mesh geometry={prismGeometry} position={piece.pos} rotation={piece.rot} castShadow receiveShadow>
        {material}
        <Edges threshold={24} color={edgeColor} scale={1.001} />
      </mesh>
    );
  }

  if (piece.shape === "cyl") {
    return (
      <mesh position={piece.pos} rotation={piece.rot} castShadow receiveShadow>
        <cylinderGeometry args={[piece.size[0], piece.size[1], piece.size[2], 28]} />
        {material}
        <Edges threshold={22} color={edgeColor} scale={1.001} />
      </mesh>
    );
  }

  if (piece.shape === "sphere") {
    return (
      <mesh position={piece.pos} rotation={piece.rot} castShadow receiveShadow>
        <sphereGeometry args={[piece.size[0], 26, 18]} />
        {material}
        <Edges threshold={30} color={edgeColor} scale={1.001} />
      </mesh>
    );
  }

  return (
    <mesh position={piece.pos} rotation={piece.rot} castShadow receiveShadow>
      <coneGeometry args={[piece.size[0], piece.size[1], 24]} />
      {material}
      <Edges threshold={30} color={edgeColor} scale={1.001} />
    </mesh>
  );
}


function ThrusterPlume({
  anchor,
  motion,
  enabled,
  index,
}: {
  anchor: { pos: Vec3; dir: Vec3; size: number };
  motion: MotionMode;
  enabled: boolean;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const outer = useRef<THREE.MeshBasicMaterial>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const power = motion === "boost" ? 1 : motion === "alert" ? 0.62 : 0.34;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 0.82 + Math.sin(t * (18 + index * 1.7) + index) * 0.18;
    const length = anchor.size * (0.7 + power * 2.1) * (enabled ? flicker : 0.35);
    if (group.current) {
      group.current.scale.y = length;
    }
    if (outer.current) outer.current.opacity = (0.22 + power * 0.44) * (enabled ? flicker : 0.4);
    if (core.current) core.current.opacity = (0.42 + power * 0.46) * (enabled ? flicker : 0.4);
    if (glow.current) glow.current.opacity = (0.3 + power * 0.55) * (enabled ? flicker : 0.3);
    if (light.current) light.current.intensity = 0;
  });
  return (
    <group position={anchor.pos}>
      <mesh>
        <sphereGeometry args={[0.22 * anchor.size, 14, 10]} />
        <meshBasicMaterial
          ref={glow}
          color={motion === "boost" ? "#ffb648" : "#9dd8ff"}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group ref={group}>
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26 * anchor.size, 1, 16, 1, true]} />
          <meshBasicMaterial
            ref={outer}
            color={motion === "boost" ? "#ffb648" : "#9dd8ff"}
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]} scale={[0.38, 0.72, 0.38]}>
          <coneGeometry args={[0.22 * anchor.size, 1, 12, 1, true]} />
          <meshBasicMaterial
            ref={core}
            color="#fff3d0"
            transparent
            opacity={0.45}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, -0.25, 0]} color="#ffd98a" distance={1.4} intensity={0.02} />
    </group>
  );
}

function ThrusterPlumes({ config, motion, enabled }: { config: Machine["viewer"]; motion: MotionMode; enabled: boolean }) {
  const anchors = getThrusterAnchors(config);
  return (
    <group>
      {anchors.map((anchor, index) => (
        <ThrusterPlume key={`thruster-${index}`} anchor={anchor} motion={motion} enabled={enabled} index={index} />
      ))}
    </group>
  );
}

function FunnelOrbit({ motion, enabled }: { motion: MotionMode; enabled: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const speed = motion === "boost" ? 0.9 : motion === "alert" ? 0.52 : 0.22;
    group.current.rotation.y = state.clock.elapsedTime * speed * (enabled ? 1 : 0.15);
    group.current.children.forEach((child, index) => {
      child.position.y = 12.6 + Math.sin(state.clock.elapsedTime * 1.1 + index * 1.3) * 0.35;
    });
  });
  return (
    <group ref={group} position={[0, 0, 0]}>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        const radius = motion === "boost" ? 6.4 : 5.3;
        return (
          <group
            key={`funnel-${index}`}
            position={[Math.cos(angle) * radius, 12.6, Math.sin(angle) * radius]}
            rotation={[0, -angle, motion === "boost" ? 0.22 : 0.08]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.3, 1.7, 0.62]} />
              <meshStandardMaterial color="#dbe8e4" metalness={0.75} roughness={0.32} />
            </mesh>
            <mesh position={[0, -0.95, 0]}>
              <boxGeometry args={[0.18, 0.24, 0.5]} />
              <meshBasicMaterial color="#5cc8ff" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0, 0.38]}>
              <boxGeometry args={[0.12, 1.1, 0.08]} />
              <meshBasicMaterial color="#6fbcff" transparent opacity={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SaberAura({ enabled }: { enabled: boolean }) {
  const outer = useRef<THREE.MeshBasicMaterial>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 8.2) * 0.15;
    if (outer.current) outer.current.opacity = (enabled ? 0.18 : 0.08) * pulse;
    if (core.current) core.current.opacity = (enabled ? 0.7 : 0.35) * pulse;
  });
  return (
    <group position={[3.75, 9.2, 0.35]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 3.4, 16, 1, true]} />
        <meshBasicMaterial ref={outer} color="#5cc8ff" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 3.2, 10, 1, true]} />
        <meshBasicMaterial ref={core} color="#fff3d0" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#5cc8ff" intensity={8} distance={5} />
    </group>
  );
}

function ScanSweep({ height }: { height: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const cycle = (state.clock.elapsedTime * 0.12) % 1;
    if (ring.current) ring.current.scale.setScalar(0.5 + cycle * 1.25);
    if (material.current) material.current.opacity = 0.3 * (1 - cycle);
  });
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[height * 0.38, height * 0.405, 96]} />
      <meshBasicMaterial ref={material} color="#5cc8ff" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function DustMotes({ height }: { height: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * height * 2.4;
      array[i * 3 + 1] = Math.random() * height * 1.2;
      array[i * 3 + 2] = (Math.random() - 0.5) * height * 2.4;
    }
    return array;
  }, [height]);
  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    for (let i = 0; i < 140; i += 1) {
      array[i * 3 + 1] += delta * (0.1 + ((i * 13) % 9) * 0.015);
      if (array[i * 3 + 1] > height * 1.2) array[i * 3 + 1] = 0.05;
    }
    attr.needsUpdate = true;
    if (points.current) {
      const mat = points.current.material as THREE.PointsMaterial;
      mat.opacity = 0.22 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9dd8ff" size={0.1} sizeAttenuation transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const MOCAP_PART: Partial<Record<MechPart["id"], keyof BvhPose>> = {
  head: "head",
  torso: "torso",
  arm_l: "arm_l",
  arm_r: "arm_r",
  leg_l: "leg_l",
  leg_r: "leg_r",
};

const PART_INDEX: Record<MechPart["id"], number> = {
  head: 0,
  torso: 1,
  waist: 2,
  shoulder_l: 3,
  shoulder_r: 4,
  arm_l: 5,
  arm_r: 6,
  leg_l: 7,
  leg_r: 8,
  backpack: 9,
  weapon: 10,
  shield: 11,
};

function Mech({
  machine,
  explode,
  quantum,
  wireframe,
  hovered,
  onHover,
  motion,
  motionEnabled,
  core,
  mocapRef,
}: {
  machine: Machine;
  explode: number;
  quantum: number;
  wireframe: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
  motion: MotionMode;
  motionEnabled: boolean;
  core: MechCore | null;
  mocapRef?: React.RefObject<BvhPlayback | null>;
}) {
  const height = machine.specs.heightOverall ?? 18;
  const scale = height / 18;
  const parts = useMemo(() => buildMech(machine.viewer), [machine.viewer]);
  const refs = useRef<Record<string, THREE.Group | null>>({});
  const innerRefs = useRef<Record<string, THREE.Group | null>>({});
  const root = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => () => core?.resetPhysics(), [core]);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-7 * delta);
    const active = motionEnabled ? 1 : 0;
    const boost = motion === "boost" ? 1 : 0;
    const cppPose = core
      ? core.stepPhysics(
          motion === "boost" ? 2 : motion === "alert" ? 1 : 0,
          t,
          delta,
          pointer.current.x,
          pointer.current.y,
          motionEnabled,
        )
      : null;
    const mocapPose = mocapRef?.current?.sample() ?? null;
    const alert = motion === "alert" ? 1 : 0;
    const idle = 1 - Math.max(boost, alert);
    if (root.current) {
      root.current.position.y += ((Math.sin(t * 0.85) * 0.018 * active) + boost * 0.1 - root.current.position.y) * k;
      const targetLean = active * (boost * -0.035 + alert * -0.012);
      root.current.rotation.x += (targetLean - root.current.rotation.x) * (k * 0.55);
      root.current.rotation.z += (Math.sin(t * 0.52) * 0.004 * active - root.current.rotation.z) * (k * 0.55);
    }

    for (const part of parts) {
      const group = refs.current[part.id];
      const inner = innerRefs.current[part.id];
      if (!group) continue;
      const push = (explode / 100) * 2.4 * part.order;
      const targetX = part.axis[0] * push;
      const targetY = part.axis[1] * push;
      const targetZ = part.axis[2] * push;
      group.position.x += (targetX - group.position.x) * k;
      group.position.y += (targetY - group.position.y) * k;
      group.position.z += (targetZ - group.position.z) * k;
      if (quantum > 0.03) {
        group.position.y += Math.sin(t * 1.6 + part.order * 4) * 0.0009;
      }
      if (!inner) continue;

      const side = part.pivot[0] < -0.1 ? -1 : part.pivot[0] > 0.1 ? 1 : 0;
      const phase = side === -1 ? Math.PI : 0;
      let rx = 0;
      let ry = 0;
      let rz = 0;

      const mocapKey = MOCAP_PART[part.id];
      const mocapRotation = mocapKey ? mocapPose?.[mocapKey] : undefined;
      if (mocapRotation) {
        rx = mocapRotation[0];
        ry = mocapRotation[1];
        rz = mocapRotation[2];
      } else if (cppPose) {
        const base = PART_INDEX[part.id] * 3;
        rx = cppPose[base];
        ry = cppPose[base + 1];
        rz = cppPose[base + 2];
      } else if (part.id === "head") {
        ry = active * (
          idle * (Math.sin(t * 0.38) * 0.09 + Math.sin(t * 0.13 + 1.2) * 0.03) +
          alert * Math.sin(t * 1.55) * 0.18 +
          boost * (-0.05 + Math.sin(t * 2.1) * 0.035)
        );
        rx = active * (
          idle * Math.sin(t * 0.6 + 0.4) * 0.018 +
          alert * -0.035 +
          boost * -0.08
        );
      } else if (part.id === "torso") {
        ry = active * (
          idle * Math.sin(t * 0.31 + 0.7) * 0.012 +
          alert * Math.sin(t * 1.05) * 0.03 +
          boost * -0.025
        );
        rz = active * (
          idle * Math.sin(t * 0.44 + 1.1) * 0.006 +
          alert * 0.012 +
          boost * 0.02
        );
      } else if (part.id === "waist") {
        ry = active * (idle * Math.sin(t * 0.29 + 1.4) * 0.006 + boost * 0.012);
      } else if (part.id === "shoulder_l" || part.id === "shoulder_r") {
        rz = side * active * (
          idle * Math.sin(t * 0.7 + phase) * 0.006 +
          alert * 0.028 +
          boost * 0.045
        );
        rx = active * (alert * -0.01 + boost * 0.03);
      } else if (part.id === "arm_l" || part.id === "arm_r") {
        rx = active * (
          idle * Math.sin(t * 0.8 + phase) * 0.014 +
          alert * -0.025 +
          boost * 0.085
        );
        rz = side * active * (
          idle * Math.sin(t * 0.5 + phase + 0.6) * 0.006 +
          alert * 0.012 +
          boost * 0.02
        );
      } else if (part.id === "leg_l" || part.id === "leg_r") {
        rx = active * (
          idle * Math.sin(t * 0.65 + phase) * 0.004 +
          alert * 0.008 +
          boost * 0.045
        );
        rz = side * active * (boost * 0.018);
      } else if (part.id === "backpack") {
        rx = active * (
          idle * Math.sin(t * 6.5) * 0.0015 +
          alert * Math.sin(t * 8.5) * 0.0025 +
          boost * Math.sin(t * 25) * 0.007
        );
      } else if (part.id === "weapon") {
        rz = active * (
          idle * Math.sin(t * 1.1) * 0.006 +
          alert * 0.012 +
          boost * -0.018
        );
      } else if (part.id === "shield") {
        rz = side * active * (
          idle * Math.sin(t * 0.9 + 0.5) * 0.005 +
          alert * 0.01 +
          boost * 0.018
        );
      }

      if (core && !mocapRotation) {
        inner.rotation.set(rx, ry, rz);
      } else {
        inner.rotation.x += (rx - inner.rotation.x) * k;
        inner.rotation.y += (ry - inner.rotation.y) * k;
        inner.rotation.z += (rz - inner.rotation.z) * k;
      }
    }
  });

  return (
    <group scale={scale}>
      <group ref={root}>
        {parts.map((part: MechPart) => (
          <group
            key={part.id}
            ref={(node) => {
              refs.current[part.id] = node;
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              onHover(part.id);
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              onHover(null);
            }}
          >
            <group
              position={part.pivot}
              ref={(node) => {
                innerRefs.current[part.id] = node;
              }}
            >
              <group position={[-part.pivot[0], -part.pivot[1], -part.pivot[2]]}>
                {part.pieces.map((piece, index) => (
                  <PieceMesh
                    key={`${part.id}-${index}`}
                    piece={piece}
                    colors={machine.viewer.colors}
                    active={hovered === part.id}
                    quantum={quantum}
                    wireframe={wireframe}
                  />
                ))}
              </group>
            </group>
          </group>
        ))}
        <ThrusterPlumes config={machine.viewer} motion={motion} enabled={motionEnabled} />
        {machine.viewer.backpack === "funnel" && <FunnelOrbit motion={motion} enabled={motionEnabled} />}
        {machine.viewer.weapon === "saber" && <SaberAura enabled={motionEnabled} />}
      </group>
    </group>
  );
}

function QuantumField({ height, amount }: { height: number; amount: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmount: { value: 0 },
      uColorA: { value: new THREE.Color("#5cc8ff") },
      uColorB: { value: new THREE.Color("#6fbcff") },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uAmount.value = amount;
  });

  return (
    <mesh position={[0, height * 0.5, 0]} scale={[1, 1.22, 1]} renderOrder={2}>
      <sphereGeometry args={[height * 0.53, 48, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            vPos = position;
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uAmount;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.2);
            float bands = smoothstep(0.35, 0.75, sin(vPos.y * 1.4 - uTime * 0.9) * 0.5 + 0.5);
            vec3 col = mix(uColorA, uColorB, bands * 0.65 + fres * 0.35);
            float alpha = uAmount * (fres * 1.05 + bands * 0.12);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}

function QuantumRings({ height, amount }: { height: number; amount: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.35;
    group.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      mesh.rotation.z = state.clock.elapsedTime * (0.18 + index * 0.07);
    });
  });
  return (
    <group ref={group} position={[0, height * 0.48, 0]} renderOrder={2}>
      {[0.22, 0.34, 0.46].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, (index - 1) * height * 0.16, 0]}>
          <torusGeometry args={[height * radius, 0.018, 8, 96]} />
          <meshBasicMaterial
            color={index === 1 ? "#6fbcff" : "#5cc8ff"}
            transparent
            opacity={amount * (0.45 - index * 0.08)}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function QuantumParticles({ height, amount }: { height: number; amount: number }) {
  const count = 1200;
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = height * (0.18 + Math.random() * 0.42);
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = Math.random() * height * 1.35;
      array[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return array;
  }, [height]);

  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    const speed = 0.22 + amount * 1.4;
    for (let i = 0; i < count; i += 1) {
      const y = i * 3 + 1;
      array[y] += delta * speed * (0.4 + ((i * 37) % 10) / 10);
      array[i * 3] += Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.0015;
      if (array[y] > height * 1.4) {
        array[y] = 0.2;
      }
    }
    attr.needsUpdate = true;
    if (points.current) {
      const mat = points.current.material as THREE.PointsMaterial;
      mat.opacity = amount * 0.95;
    }
  });

  return (
    <points ref={points} renderOrder={3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#7dd3fc"
        size={0.16}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraRig({
  view,
  nonce,
  height,
  controls,
  autoRotate,
}: {
  view: ViewName;
  nonce: number;
  height: number;
  controls: React.RefObject<any>;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const animation = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!controls.current) return;
    const to = new THREE.Vector3(...presetPosition(view, height));
    const toTarget = new THREE.Vector3(0, height * 0.5, 0);
    if (first.current) {
      first.current = false;
      camera.position.copy(to);
      controls.current.target.copy(toTarget);
      controls.current.update();
      return;
    }
    animation.current = {
      from: camera.position.clone(),
      to,
      fromTarget: controls.current.target.clone(),
      toTarget,
      t: 0,
    };
    controls.current.enabled = false;
  }, [view, nonce, height, camera, controls]);

  useFrame((_, delta) => {
    const anim = animation.current;
    if (!anim || !controls.current) return;
    anim.t = Math.min(1, anim.t + delta / 0.85);
    const e = easeInOut(anim.t);
    camera.position.lerpVectors(anim.from, anim.to, e);
    controls.current.target.lerpVectors(anim.fromTarget, anim.toTarget, e);
    controls.current.update();
    if (anim.t >= 1) {
      animation.current = null;
      controls.current.enabled = true;
      controls.current.autoRotate = autoRotate;
    }
  });

  return null;
}

function StageScene({
  machine,
  explode,
  quantum,
  wireframe,
  autoRotate,
  view,
  nonce,
  hovered,
  onHover,
  motion,
  motionEnabled,
  core,
  mocapRef,
  transparent = false,
}: {
  machine: Machine;
  explode: number;
  quantum: number;
  wireframe: boolean;
  autoRotate: boolean;
  view: ViewName;
  nonce: number;
  hovered: string | null;
  onHover: (id: string | null) => void;
  motion: MotionMode;
  motionEnabled: boolean;
  core: MechCore | null;
  mocapRef?: React.RefObject<BvhPlayback | null>;
  transparent?: boolean;
}) {
  const height = machine.specs.heightOverall ?? 18;
  const controls = useRef<any>(null);

  return (
    <>
      {!transparent && <color attach="background" args={["#04090d"]} />}
      <fog attach="fog" args={["#04090d", height * 2.6, height * 5.6]} />
      <ambientLight intensity={0.14} />
      <hemisphereLight args={["#d8ecff", "#020a18", 0.42]} />
      <directionalLight
        position={[height * 1.35, height * 1.7, height * 1.5]}
        intensity={3.6}
        color="#fff6e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={height * 6}
        shadow-camera-left={-height * 1.2}
        shadow-camera-right={height * 1.2}
        shadow-camera-top={height * 1.4}
        shadow-camera-bottom={-height * 0.4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-height * 1.6, height * 0.9, -height * 0.9]} intensity={1.35} color="#9dd8ff" />
      <directionalLight position={[height * 0.4, height * 0.3, -height * 1.8]} intensity={0.55} color="#8ed8ff" />
      <pointLight position={[0, height * 0.7, height * 1.6]} intensity={height * 1.3} color="#d8ecff" distance={height * 2.5} />

      <Environment resolution={192} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.6} position={[0, height * 0.8, -height * 0.9]} scale={[height, height, 1]} color="#bfe9ff" />
        <Lightformer form="rect" intensity={1.4} position={[-height * 0.9, height * 0.5, height * 0.4]} rotation-y={Math.PI / 2} scale={[height * 0.7, height * 0.5, 1]} color="#5cc8ff" />
        <Lightformer form="ring" intensity={2.2} position={[height * 0.8, height * 0.6, height * 0.6]} scale={height * 0.22} color="#f5a623" />
      </Environment>

      <Mech
        machine={machine}
        explode={explode}
        quantum={quantum}
        wireframe={wireframe}
        hovered={hovered}
        onHover={onHover}
        motion={motion}
        motionEnabled={motionEnabled}
        core={core}
        mocapRef={mocapRef}
      />

      <ScanSweep height={height} />
      <DustMotes height={height} />

      {quantum > 0.01 && <QuantumField height={height} amount={quantum} />}
      {quantum > 0.01 && <QuantumRings height={height} amount={quantum} />}
      {quantum > 0.01 && <QuantumParticles height={height} amount={quantum} />}
      {quantum > 0.01 && (
        <pointLight position={[0, height * 0.55, 0]} intensity={quantum * height * 1.1} color="#5cc8ff" distance={height * 2.2} />
      )}

      <Grid
        args={[height * 6, height * 6]}
        cellSize={1}
        cellThickness={0.45}
        cellColor="#0f2f52"
        sectionSize={5}
        sectionThickness={0.9}
        sectionColor="#1c4f8a"
        fadeDistance={height * 4.2}
        fadeStrength={2.2}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[height * 0.44, height * 0.452, 96]} />
        <meshBasicMaterial color="#5cc8ff" transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[height * 0.58, height * 0.585, 96]} />
        <meshBasicMaterial color="#5cc8ff" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      <group position={[0, 0.018, 0]}>
        {Array.from({ length: 36 }, (_, index) => {
          const angle = (index / 36) * Math.PI * 2;
          const radius = height * 0.66;
          return (
            <mesh
              key={`bearing-${index}`}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.04, 0.012, index % 3 === 0 ? 0.58 : 0.3]} />
              <meshBasicMaterial color="#5cc8ff" transparent opacity={index % 3 === 0 ? 0.42 : 0.2} />
            </mesh>
          );
        })}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[height * 0.72, height * 0.724, 96]} />
          <meshBasicMaterial color="#5cc8ff" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-height * 0.92, height * 0.5, -height * 0.55]}>
          <boxGeometry args={[0.035, height, 0.035]} />
          <meshBasicMaterial color="#5cc8ff" transparent opacity={0.22} />
        </mesh>
        {Array.from({ length: 9 }, (_, index) => (
          <mesh
            key={`ruler-${index}`}
            position={[-height * 0.92, height * (0.1 + index * 0.1), -height * 0.55]}
          >
            <boxGeometry args={[index % 5 === 0 ? 0.6 : 0.32, 0.025, 0.025]} />
            <meshBasicMaterial color="#5cc8ff" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.62}
        scale={height * 2.1}
        blur={2.6}
        far={height * 0.55}
        resolution={512}
        color="#000000"
      />

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={height * 1.2}
        maxDistance={height * 3.6}
        maxPolarAngle={Math.PI * 0.94}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        target={[0, height * 0.5, 0]}
      />
      <CameraRig view={view} nonce={nonce} height={height} controls={controls} autoRotate={autoRotate} />
    </>
  );
}

export function MechStage({
  machine,
  explode,
  quantum,
  wireframe,
  autoRotate,
  view,
  nonce,
  hovered,
  onHover,
  onReady,
  motion = "idle",
  motionEnabled = true,
  core = null,
  mocapRef,
  className = "",
  transparent = false,
}: {
  machine: Machine;
  explode: number;
  quantum: number;
  wireframe: boolean;
  autoRotate: boolean;
  view: ViewName;
  nonce: number;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onReady?: () => void;
  motion?: MotionMode;
  motionEnabled?: boolean;
  core?: MechCore | null;
  mocapRef?: React.RefObject<BvhPlayback | null>;
  className?: string;
  transparent?: boolean;
}) {
  const height = machine.specs.heightOverall ?? 18;
  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: transparent, powerPreference: "high-performance" }}
      camera={{ position: presetPosition("iso", height), fov: 30, near: 0.1, far: height * 12 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#04090d", transparent ? 0 : 1);
        onReady?.();
      }}
      onPointerMissed={() => onHover(null)}
      aria-label="Interactive 3D mobile suit viewer"
    >
      <StageScene
        machine={machine}
        explode={explode}
        quantum={quantum}
        wireframe={wireframe}
        autoRotate={autoRotate}
        view={view}
        nonce={nonce}
        hovered={hovered}
        onHover={onHover}
        motion={motion}
        motionEnabled={motionEnabled}
        core={core}
        mocapRef={mocapRef}
        transparent={transparent}
      />
    </Canvas>
  );
}
