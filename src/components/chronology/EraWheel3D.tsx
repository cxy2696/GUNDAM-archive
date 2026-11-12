"use client";

import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Era, Lang } from "@/lib/schema";

export type EraWheelItem = {
  era: Era;
  machines: number;
  events: number;
  works: number;
};

function Ring({
  item,
  index,
  active,
  onSelect,
  lang,
}: {
  item: EraWheelItem;
  index: number;
  active: boolean;
  onSelect: () => void;
  lang: Lang;
}) {
  const radius = 1.05 + index * 0.2;
  const y = 2.9 - index * 0.54;
  const [hovered, setHovered] = useState(false);
  const color = item.era.color;
  return (
    <group position={[0, y, 0]}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusGeometry args={[radius, active ? 0.035 : hovered ? 0.022 : 0.014, 8, 96]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.7 : hovered ? 0.9 : 0.35}
          roughness={0.4}
          transparent
          opacity={active ? 1 : 0.78}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.04, radius, 64]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.1 : 0.025} side={THREE.DoubleSide} />
      </mesh>
      {active && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.09, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      )}
      <Html position={[radius + 0.12, 0, 0]} center className={`era-wheel__label ${active ? "is-active" : ""}`} zIndexRange={[20, 0]}>
        <span className="era-wheel__code" style={{ color }}>
          {item.era.code}
        </span>
        {active && <span className="era-wheel__name">{pick(item.era.name, lang)}</span>}
        <span className="era-wheel__count">{item.machines}</span>
      </Html>
      <Html position={[0, 0, 0]} center className="era-wheel__axis-label" zIndexRange={[10, 0]}>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </Html>
    </group>
  );
}

function WheelScene({
  items,
  selectedId,
  onSelect,
  lang,
  autoRotate,
}: {
  items: EraWheelItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  lang: Lang;
  autoRotate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(
    () =>
      items.map((_, index) => {
        const radius = 1.05 + index * 0.2;
        const y = 2.9 - index * 0.54;
        const theta = index * 0.55;
        return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
      }),
    [items],
  );

  return (
    <>
      <color attach="background" args={["#03060e"]} />
      <ambientLight intensity={0.8} color="#9cc7e8" />
      <pointLight position={[4, 8, 6]} intensity={2.4} color="#eaf6ff" />
      <pointLight position={[-5, -4, -5]} intensity={1.4} color="#9a86ff" />
      <Stars radius={50} depth={30} count={1400} factor={3} saturation={0.35} fade speed={0.3} />

      <group ref={group}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 6.6, 16]} />
          <meshStandardMaterial color="#63e6ff" emissive="#63e6ff" emissiveIntensity={0.9} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -3.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 3.9, 96]} />
          <meshBasicMaterial color="#1e4468" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        <Line points={points} color="#ffb648" transparent opacity={0.28} lineWidth={1} dashed dashSize={0.08} gapSize={0.14} />

        {items.map((item, index) => (
          <Ring
            key={item.era.id}
            item={item}
            index={index}
            active={item.era.id === selectedId}
            onSelect={() => onSelect(item.era.id)}
            lang={lang}
          />
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
        target={[0, -0.2, 0]}
      />
    </>
  );
}

export function EraWheel3D({
  items,
  selectedId,
  onSelect,
  lang,
  autoRotate,
}: {
  items: EraWheelItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  lang: Lang;
  autoRotate: boolean;
}) {
  return (
    <div className="era-wheel">
      <Canvas dpr={[1, 1.6]} camera={{ position: [7.0, 3.4, 7.8], fov: 42, near: 0.1, far: 80 }} gl={{ antialias: true }}>
        <WheelScene items={items} selectedId={selectedId} onSelect={onSelect} lang={lang} autoRotate={autoRotate} />
      </Canvas>
      <div className="era-wheel__hint" aria-hidden>
        DRAG / ORBIT · CLICK / SELECT
      </div>
    </div>
  );
}
