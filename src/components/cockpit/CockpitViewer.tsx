"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Component, useRef, useState, type ReactNode } from "react";
import type * as THREE from "three";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

type PartKey = "seat" | "console" | "pedals" | "canopy" | "overhead" | "screen" | "stick";
type ViewMode = "3d" | "2d";
type SystemKey = "power" | "comms" | "weapon";
type Systems = Record<SystemKey, boolean>;

class CockpitCanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Screen({
  position,
  rotation,
  size,
  dim = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  dim?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0] + 0.12, size[1] + 0.12, 0.05]} radius={0.025} position={[0, 0, -0.02]}>
        <meshStandardMaterial color="#2a3f58" metalness={0.7} roughness={0.35} />
      </RoundedBox>
      <mesh>
        <boxGeometry args={[size[0], size[1], 0.06]} />
        <meshStandardMaterial
          color={dim ? "#263a58" : "#b9e8ff"}
          emissive={dim ? "#1b2a40" : "#5cc8ff"}
          emissiveIntensity={dim ? 0.35 : 2.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[size[0] * 0.9, size[1] * 0.88]} />
        <meshBasicMaterial color="#020b1a" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function ConsoleButton({
  position,
  active,
  tone = "#5cc8ff",
  onClick,
}: {
  position: [number, number, number];
  active: boolean;
  tone?: string;
  onClick: () => void;
}) {
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <RoundedBox args={[0.28, 0.12, 0.2]} radius={0.035}>
        <meshStandardMaterial color={active ? tone : "#263a58"} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.065, 0]}>
        <circleGeometry args={[0.055, 20]} />
        <meshBasicMaterial color={active ? tone : "#4e6f8f"} />
      </mesh>
      <pointLight position={[0, 0.16, 0]} intensity={active ? 0.7 : 0.08} color={tone} distance={0.8} />
    </group>
  );
}

function ControlStick({ x }: { x: number }) {
  return (
    <group position={[x, 1.4, -1.05]} rotation={[-0.12, 0, 0]}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 20]} />
        <meshStandardMaterial color="#2a3f58" metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 0.52, 12]} />
        <meshStandardMaterial color="#5f84a8" metalness={0.85} roughness={0.22} />
      </mesh>
      <RoundedBox args={[0.22, 0.28, 0.18]} radius={0.07} position={[0, 0.68, 0]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
        <meshStandardMaterial color="#1b2a40" metalness={0.6} roughness={0.38} />
      </RoundedBox>
      <mesh position={[x > 0 ? -0.11 : 0.11, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.16, 10]} />
        <meshStandardMaterial color="#9dd8ff" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.84, -0.02]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshBasicMaterial color="#8ed8ff" />
      </mesh>
    </group>
  );
}

function Radar() {
  const sweep = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (sweep.current) sweep.current.rotation.z = state.clock.elapsedTime * 0.8;
  });
  return (
    <group position={[1.45, 1.55, -1.95]} rotation={[-0.18, 0, 0]}>
      <mesh>
        <circleGeometry args={[0.46, 48]} />
        <meshBasicMaterial color="#020a18" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.4, 0.42, 48]} />
        <meshBasicMaterial color="#5cc8ff" transparent opacity={0.65} />
      </mesh>
      <mesh ref={sweep} position={[0, 0, 0.02]}>
        <circleGeometry args={[0.39, 32, 0, Math.PI / 3]} />
        <meshBasicMaterial color="#5cc8ff" transparent opacity={0.22} side={2} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.12, 0.13, 40]} />
        <meshBasicMaterial color="#6fbcff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Canopy({ open }: { open: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = open ? 0.9 : 0;
    group.current.position.y += (target - group.current.position.y) * (1 - Math.exp(-4 * delta));
    group.current.rotation.x += ((open ? -0.18 : 0) - group.current.rotation.x) * (1 - Math.exp(-4 * delta));
  });
  return (
    <group ref={group}>
      {[-1.7, 0, 1.7].map((x) => (
        <mesh key={x} position={[x, 2.6, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.45, 0.055, 8, 36, Math.PI]} />
          <meshStandardMaterial color="#3d5678" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.02, 8, 40, Math.PI]} />
        <meshBasicMaterial color="#5cc8ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function CockpitScene({
  open,
  labels,
  selected,
  autoRotate,
  systems,
  onSelect,
  onSystem,
}: {
  open: boolean;
  labels: boolean;
  selected: PartKey;
  autoRotate: boolean;
  systems: Systems;
  onSelect: (part: PartKey) => void;
  onSystem: (key: SystemKey) => void;
}) {
  const select = (part: PartKey) => (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(part);
  };
  return (
    <>
      <color attach="background" args={["#01050f"]} />
      <fog attach="fog" args={["#01050f", 6, 18]} />
      <ambientLight intensity={0.85} />
      <pointLight position={[3, 4, 4]} intensity={24} color="#eaf7ff" distance={16} />
      <pointLight position={[-3, 2, -3]} intensity={16} color="#9dd8ff" distance={14} />
      <directionalLight position={[0, 5, 2]} intensity={3.2} color="#8ed8ff" />

      <group onClick={select("seat")}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.3, 64]} />
          <meshStandardMaterial color="#04101f" metalness={0.5} roughness={0.6} />
        </mesh>
        {Array.from({ length: 18 }, (_, index) => (
          <mesh key={`floor-${index}`} position={[0, 0.03, -3.6 + index * 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.4, 0.012]} />
            <meshBasicMaterial color="#5cc8ff" transparent opacity={0.06} />
          </mesh>
        ))}
      </group>

      <group onClick={select("seat")}>
        <RoundedBox args={[1.25, 0.22, 1.15]} radius={0.12} position={[0, 0.86, 0.45]} castShadow>
          <meshStandardMaterial color="#6d8fb8" metalness={0.38} roughness={0.38} />
        </RoundedBox>
        <RoundedBox args={[1.1, 1.6, 0.24]} radius={0.12} position={[0, 1.62, 1.0]} rotation={[0.16, 0, 0]} castShadow>
          <meshStandardMaterial color="#4e6f8f" metalness={0.38} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.72, 0.38, 0.25]} radius={0.1} position={[0, 2.45, 1.06]} rotation={[0.16, 0, 0]} castShadow>
          <meshStandardMaterial color="#53769a" metalness={0.45} roughness={0.38} />
        </RoundedBox>
        {[-0.78, 0.78].map((x) => (
          <RoundedBox key={x} args={[0.24, 0.2, 1.2]} radius={0.06} position={[x, 1.04, 0.5]} castShadow>
            <meshStandardMaterial color="#405a7a" metalness={0.5} roughness={0.34} />
          </RoundedBox>
        ))}
      </group>

      <group onClick={select("console")}>
        <RoundedBox args={[3.8, 0.35, 1.2]} radius={0.08} position={[0, 1.32, -1.55]} rotation={[-0.15, 0, 0]} castShadow>
          <meshStandardMaterial color="#466a96" metalness={0.45} roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[3.9, 0.12, 1.05]} radius={0.05} position={[0, 1.52, -1.55]} rotation={[-0.15, 0, 0]}>
          <meshStandardMaterial color="#6e93b8" metalness={0.4} roughness={0.26} />
        </RoundedBox>
        <Screen position={[-1.2, 1.6, -1.93]} rotation={[-0.18, 0.18, 0]} size={[1.1, 0.44]} dim={!systems.power} />
        <Screen position={[0, 1.62, -1.98]} rotation={[-0.18, 0, 0]} size={[1.25, 0.5]} dim={!systems.power} />
        <Screen position={[1.2, 1.6, -1.93]} rotation={[-0.18, -0.18, 0]} size={[1.1, 0.44]} dim={!systems.power} />
        <Radar />
        <group position={[0, 1.43, -2.02]}>
          <ConsoleButton position={[-1.1, 0, 0]} active={systems.power} tone="#5cc8ff" onClick={() => onSystem("power")} />
          <ConsoleButton position={[0, 0, 0]} active={systems.comms} tone="#6fbcff" onClick={() => onSystem("comms")} />
          <ConsoleButton position={[1.1, 0, 0]} active={systems.weapon} tone="#ffb45e" onClick={() => onSystem("weapon")} />
        </group>
      </group>

      <group onClick={select("pedals")}>
        {[-0.48, 0.48].map((x) => (
          <group key={x} position={[x, 0.42, -1.1]}>
            <RoundedBox args={[0.42, 0.08, 0.72]} radius={0.03} rotation={[0.18, 0, 0]}>
              <meshStandardMaterial color="#425a7a" metalness={0.7} roughness={0.3} />
            </RoundedBox>
            <mesh position={[0, 0.12, -0.3]}>
              <boxGeometry args={[0.28, 0.16, 0.28]} />
              <meshStandardMaterial color="#1b2a40" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      <group onClick={select("stick")}>
        <ControlStick x={-0.95} />
        <ControlStick x={0.95} />
      </group>

      <group onClick={select("overhead")}>
        <RoundedBox args={[3.6, 0.2, 0.5]} radius={0.05} position={[0, 3.15, -0.2]} rotation={[0.12, 0, 0]}>
          <meshStandardMaterial color="#2a3f58" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        {[-0.9, 0, 0.9].map((x) => (
          <Screen key={x} position={[x, 3.03, -0.12]} rotation={[0.12, 0, 0]} size={[0.64, 0.24]} dim={!systems.power} />
        ))}
        {([
          [-1.55, systems.power, "#5cc8ff"],
          [-1.38, systems.comms, "#6fbcff"],
          [1.38, systems.weapon, "#ffb45e"],
        ] as const).map(([x, active, tone]) => (
          <mesh key={String(x)} position={[x, 3.01, 0.02]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshBasicMaterial color={active ? tone : "#263a58"} />
          </mesh>
        ))}
      </group>

      <group onClick={select("screen")}>
        <mesh position={[0, 2.6, -3.4]}>
          <planeGeometry args={[5.6, 2.55]} />
          <meshBasicMaterial color="#020a18" />
        </mesh>
        {Array.from({ length: 7 }, (_, index) => (
          <mesh key={`scan-${index}`} position={[0, 1.5 + index * 0.32, -3.35]}>
            <planeGeometry args={[5.2, 0.012]} />
            <meshBasicMaterial color="#5cc8ff" transparent opacity={0.1} />
          </mesh>
        ))}
        <Screen position={[0, 3.6, -3.28]} size={[2.4, 0.2]} dim={!systems.power} />
      </group>

      <group aria-hidden>
        {[-2.8, 2.8].map((x) => (
          <RoundedBox key={`wall-${x}`} args={[0.28, 2.4, 3.2]} radius={0.08} position={[x, 1.55, -1.5]} rotation={[0, x > 0 ? -0.1 : 0.1, 0]}>
            <meshStandardMaterial color="#263a58" metalness={0.6} roughness={0.45} />
          </RoundedBox>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[2.1, 2.14, 64]} />
          <meshBasicMaterial color="#5cc8ff" transparent opacity={0.35} side={2} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3.2, 3.215, 64]} />
          <meshBasicMaterial color="#5cc8ff" transparent opacity={0.14} side={2} />
        </mesh>
      </group>

      <Canopy open={open} />

      {labels && (
        <group>
          {([
            ["seat", [0, 2.1, 1.5]],
            ["console", [0, 1.25, -2.2]],
            ["canopy", [0, 3.8, 0]],
          ] as const).map(([part, position]) => (
            <mesh key={part} position={[position[0], position[1], position[2]]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color={selected === part ? "#8ed8ff" : "#5cc8ff"} />
            </mesh>
          ))}
        </group>
      )}

      <OrbitControls target={[0, 1.4, -0.2]} enablePan={false} minDistance={3.2} maxDistance={9.5} maxPolarAngle={Math.PI * 0.78} autoRotate={autoRotate} autoRotateSpeed={0.55} />
    </>
  );
}

export default function CockpitViewer({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const [view, setView] = useState<ViewMode>("3d");
  const [selected, setSelected] = useState<PartKey>("seat");
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [systems, setSystems] = useState<Systems>({ power: true, comms: true, weapon: false });
  const toggleSystem = (key: SystemKey) => setSystems((current) => ({ ...current, [key]: !current[key] }));
  const labelsMap = dict.cockpitBay.parts;
  const partKeys = Object.keys(labelsMap) as PartKey[];

  return (
    <section className="cockpit-bay" aria-labelledby="cockpit-bay-title">
      <div className="cockpit-bay__head">
        <div>
          <div className="eyebrow">{dict.cockpitBay.eyebrow}</div>
          <h2 id="cockpit-bay-title">{dict.cockpitBay.bayTitle}</h2>
        </div>
        <p>{dict.cockpitBay.lead}</p>
      </div>

      <div className="cockpit-bay__toolbar">
        <div className="seg" role="group">
          {(["3d", "2d"] as const).map((mode) => (
            <button key={mode} type="button" className={view === mode ? "is-active" : ""} onClick={() => setView(mode)}>
              {mode === "3d" ? dict.cockpitBay.view3d : dict.cockpitBay.view2d}
            </button>
          ))}
        </div>
        {view === "3d" && (
          <>
            <button type="button" className={`chip ${autoRotate ? "is-active" : ""}`} onClick={() => setAutoRotate((value) => !value)}>
              {dict.cockpitBay.autoRotate}
            </button>
            <button type="button" className={`chip ${open ? "is-active" : ""}`} onClick={() => setOpen((value) => !value)}>
              {dict.cockpitBay.hatch} · {open ? dict.cockpitBay.open : dict.cockpitBay.close}
            </button>
            <button type="button" className={`chip ${labels ? "is-active" : ""}`} onClick={() => setLabels((value) => !value)}>
              {dict.cockpitBay.labels}
            </button>
          </>
        )}
        <span className="cockpit-bay__selected micro">{dict.cockpitBay.selected}: <b>{labelsMap[selected]}</b></span>
      </div>

      <div className="cockpit-bay__stage">
        {view === "3d" ? (
          <div className="cockpit-bay__canvas">
            <CockpitCanvasBoundary
              fallback={
                <Blueprint labels={labelsMap} selected={selected} onSelect={setSelected} />
              }
            >
              <Canvas camera={{ position: [6.4, 3.4, 0.6], fov: 44 }} shadows dpr={[1, 1.6]} gl={{ antialias: true }}>
                <CockpitScene
                  open={open}
                  labels={labels}
                  selected={selected}
                  autoRotate={autoRotate}
                  systems={systems}
                  onSelect={setSelected}
                  onSystem={toggleSystem}
                />
              </Canvas>
            </CockpitCanvasBoundary>
            <div className="cockpit-bay__systems" aria-label={dict.cockpitBay.systems}>
              <span className="micro">{dict.cockpitBay.systems}</span>
              {(["power", "comms", "weapon"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={systems[key] ? "is-active" : ""}
                  onClick={() => toggleSystem(key)}
                  aria-pressed={systems[key]}
                  data-system={key}
                >
                  <i />
                  <span>{dict.cockpitBay[key]}</span>
                  <b>{systems[key] ? dict.cockpitBay.systemOn : dict.cockpitBay.systemOff}</b>
                </button>
              ))}
            </div>
            <div className="cockpit-bay__part-list">
              {partKeys.map((part) => (
                <button key={part} type="button" className={selected === part ? "is-active" : ""} onClick={() => setSelected(part)}>
                  <span />
                  {labelsMap[part]}
                </button>
              ))}
            </div>
            <span className="cockpit-bay__hint">DRAG TO ORBIT / SCROLL TO ZOOM</span>
          </div>
        ) : (
          <Blueprint labels={labelsMap} selected={selected} onSelect={setSelected} />
        )}
      </div>
      <p className="cockpit-bay__note micro">{dict.cockpitBay.note}</p>
    </section>
  );
}

function Blueprint({
  labels,
  selected,
  onSelect,
}: {
  labels: Dictionary["cockpitBay"]["parts"];
  selected: PartKey;
  onSelect: (part: PartKey) => void;
}) {
  const part = (key: PartKey, children: React.ReactNode) => (
    <g className={selected === key ? "is-active" : ""} onClick={() => onSelect(key)} role="button" tabIndex={0} aria-label={labels[key]}>
      {children}
    </g>
  );
  return (
    <svg className="cockpit-blueprint" viewBox="0 0 760 460" role="img" aria-label="Cockpit blueprint">
      <rect width="760" height="460" fill="#030b18" />
      <defs>
        <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(92,200,255,.09)" strokeWidth=".6" />
        </pattern>
      </defs>
      <rect width="760" height="460" fill="url(#bp-grid)" />
      <g className="bp-annot">
        <text x="24" y="28">COCKPIT / FRONT ELEVATION · SCHEMATIC</text>
        <text x="736" y="28" textAnchor="end">SCALE 1:20 · UNIT m</text>
      </g>
      {part("canopy", <path d="M170 260 Q235 70 380 62 Q525 70 590 260" fill="none" stroke="rgba(92,200,255,.55)" strokeWidth="1.4" />)}
      {part("overhead", <g><rect x="230" y="105" width="300" height="18" fill="none" stroke="rgba(92,200,255,.55)" /><path d="M250 123v34M510 123v34" stroke="rgba(92,200,255,.35)" /></g>)}
      {part("screen", <g><path d="M190 260 Q380 200 570 260 L550 320 Q380 290 210 320Z" fill="rgba(92,200,255,.08)" stroke="rgba(92,200,255,.55)" /><path d="M240 270 Q380 238 520 270" stroke="rgba(92,200,255,.4)" /></g>)}
      {part("seat", <g><path d="M305 290 Q380 270 455 290 L470 360 Q380 385 290 360Z" fill="rgba(92,200,255,.12)" stroke="rgba(92,200,255,.6)" /><path d="M310 230 Q380 210 450 230 L455 286 Q380 302 305 286Z" fill="none" stroke="rgba(92,200,255,.55)" /><rect x="338" y="200" width="84" height="44" fill="none" stroke="rgba(92,200,255,.45)" /></g>)}
      {part("console", <g><path d="M190 336 L570 336 L590 366 L170 366Z" fill="none" stroke="rgba(92,200,255,.6)" /><rect x="270" y="342" width="54" height="18" fill="rgba(92,200,255,.15)" /><rect x="436" y="342" width="54" height="18" fill="rgba(92,200,255,.15)" /></g>)}
      {part("stick", <g><path d="M260 310v52M500 310v52" stroke="rgba(92,200,255,.6)" strokeWidth="2" /><circle cx="260" cy="304" r="7" fill="none" stroke="rgba(92,200,255,.6)" /><circle cx="500" cy="304" r="7" fill="none" stroke="rgba(92,200,255,.6)" /></g>)}
      {part("pedals", <g><path d="M270 382h42M448 382h42" stroke="rgba(92,200,255,.6)" strokeWidth="2" /><path d="M270 394h34M456 394h34" stroke="rgba(92,200,255,.35)" /></g>)}
      <g className="bp-labels">
        {[
          ["seat", 570, 248],
          ["console", 570, 354],
          ["screen", 120, 238],
          ["canopy", 628, 150],
          ["stick", 120, 310],
          ["pedals", 120, 390],
          ["overhead", 548, 112],
        ].map(([key, x, y]) => (
          <text key={String(key)} x={Number(x)} y={Number(y)} onClick={() => onSelect(key as PartKey)}>
            {labels[key as PartKey]}
          </text>
        ))}
      </g>
      <g className="bp-dim" aria-hidden>
        <line x1="640" y1="62" x2="640" y2="404" />
        <line x1="632" y1="62" x2="648" y2="62" />
        <line x1="632" y1="404" x2="648" y2="404" />
        <text x="654" y="238" transform="rotate(90 654 238)" textAnchor="middle">3.4 m</text>
      </g>
    </svg>
  );
}
