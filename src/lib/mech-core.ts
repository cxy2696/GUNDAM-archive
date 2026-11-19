/**
 * Thin browser bridge to the freestanding C++ rig core (engine/mech_core.cpp).
 * The module is built by `npm run build:wasm`. When it cannot load, the viewer
 * keeps its TypeScript fallback so the page never hard-fails.
 */
export type MechCore = {
  stepPhysics: (
    mode: 0 | 1 | 2,
    time: number,
    dt: number,
    pointerX: number,
    pointerY: number,
    enabled: boolean,
    walking: boolean,
    speed: number,
    crouching: boolean,
  ) => Float32Array;
  getRoot: () => Float32Array;
  applyImpulse: (amount: number) => void;
  resetPhysics: () => void;
  solveIk: (targetX: number, targetY: number, lengthA: number, lengthB: number) => [number, number] | null;
};

type CoreExports = WebAssembly.Exports & {
  memory: WebAssembly.Memory;
  pose_ptr: () => number;
  root_ptr: () => number;
  ik_ptr: () => number;
  step_physics: (mode: number, time: number, dt: number, px: number, py: number, enabled: number, walking: number, speed: number, crouching: number) => void;
  apply_impulse: (amount: number) => void;
  reset_physics: () => void;
  two_bone_ik: (x: number, y: number, a: number, b: number, out: number) => number;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
let loading: Promise<MechCore | null> | null = null;

export function loadMechCore(): Promise<MechCore | null> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const response = await fetch(`${BASE_PATH}/mech-core.wasm`);
      if (!response.ok) return null;
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, {});
      const exports = instance.exports as CoreExports;
      const posePtr = exports.pose_ptr();
      const rootPtr = exports.root_ptr();
      const ikPtr = exports.ik_ptr();
      const poseView = new Float32Array(exports.memory.buffer, posePtr, 48);
      const rootView = new Float32Array(exports.memory.buffer, rootPtr, 3);
      return {
        stepPhysics(mode, time, dt, pointerX, pointerY, enabled, walking, speed, crouching) {
          exports.step_physics(
            mode,
            time,
            dt,
            pointerX,
            pointerY,
            enabled ? 1 : 0,
            walking ? 1 : 0,
            speed,
            crouching ? 1 : 0,
          );
          return poseView;
        },
        getRoot() {
          return rootView;
        },
        applyImpulse(amount) {
          exports.apply_impulse(amount);
        },
        resetPhysics() {
          exports.reset_physics();
        },
        solveIk(targetX, targetY, lengthA, lengthB) {
          const ok = exports.two_bone_ik(targetX, targetY, lengthA, lengthB, ikPtr);
          if (!ok) return null;
          const out = new Float32Array(exports.memory.buffer, ikPtr, 2);
          return [out[0], out[1]];
        },
      };
    } catch {
      return null;
    }
  })();
  return loading;
}
