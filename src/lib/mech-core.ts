/**
 * Thin browser bridge to the freestanding C++ rig core (engine/mech_core.cpp).
 * The module is built by `npm run build:wasm`. When it cannot load, the viewer
 * keeps its TypeScript fallback so the page never hard-fails.
 */
export type MechCore = {
  solvePose: (mode: 0 | 1 | 2, time: number, enabled: boolean) => Float32Array;
  solveIk: (targetX: number, targetY: number, lengthA: number, lengthB: number) => [number, number] | null;
};

type CoreExports = WebAssembly.Exports & {
  memory: WebAssembly.Memory;
  pose_ptr: () => number;
  ik_ptr: () => number;
  solve_pose: (mode: number, time: number, enabled: number) => void;
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
      const ikPtr = exports.ik_ptr();
      return {
        solvePose(mode, time, enabled) {
          exports.solve_pose(mode, time, enabled ? 1 : 0);
          return new Float32Array(exports.memory.buffer, posePtr, 36);
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
