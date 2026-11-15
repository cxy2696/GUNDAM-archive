/**
 * Small BVH reader + retarget map for the procedural mecha rig.
 * It reads standard BVH HIERARCHY/MOTION blocks and exposes per-part
 * local rotations. No third-party parser is required.
 */
export type BvhData = {
  joints: string[];
  channels: Record<string, string[]>;
  frames: number[][];
  frameTime: number;
  frameCount: number;
};

export type BvhPose = Partial<Record<"head" | "torso" | "arm_l" | "arm_r" | "leg_l" | "leg_r", [number, number, number]>>;

export class BvhPlayback {
  readonly data: BvhData;
  private startedAt = 0;

  constructor(data: BvhData) {
    this.data = data;
  }

  start(now = performance.now()) {
    this.startedAt = now;
  }

  sample(now = performance.now()): BvhPose {
    if (this.data.frameCount === 0) return {};
    const frameTime = this.data.frameTime || 1 / 30;
    const elapsed = Math.max(0, (now - this.startedAt) / 1000);
    const index = Math.floor(elapsed / frameTime) % this.data.frameCount;
    const frame = this.data.frames[index];
    return rotationsFromFrame(this.data, frame);
  }
}

const MAP: Record<keyof BvhPose, string[]> = {
  head: ["Head", "Neck", "Neck1"],
  torso: ["Chest", "Spine1", "Spine", "Hips"],
  arm_l: ["LeftArm", "LeftShoulder", "LeftForeArm"],
  arm_r: ["RightArm", "RightShoulder", "RightForeArm"],
  leg_l: ["LeftUpLeg", "LeftLeg", "LeftFoot"],
  leg_r: ["RightUpLeg", "RightLeg", "RightFoot"],
};

const DEG = Math.PI / 180;

export function parseBvh(text: string): BvhData {
  const lines = text.split(/\r?\n/);
  const joints: string[] = [];
  const channels: Record<string, string[]> = {};
  let current = "";
  let motionLine = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "MOTION") {
      motionLine = i;
      break;
    }
    const jointMatch = /^(ROOT|JOINT)\s+(.+)$/.exec(line);
    if (jointMatch) {
      current = jointMatch[2].trim();
      joints.push(current);
    } else if (line.startsWith("CHANNELS") && current) {
      channels[current] = line.split(/\s+/).slice(2);
    }
  }

  if (motionLine < 0) throw new Error("BVH: MOTION block not found");
  let frameTime = 1 / 30;
  let frameCount = 0;
  let dataStart = motionLine + 1;
  for (let i = motionLine + 1; i < Math.min(lines.length, motionLine + 6); i += 1) {
    const line = lines[i].trim();
    if (line.startsWith("Frames:")) frameCount = Number(line.split(":")[1]);
    if (line.startsWith("Frame Time:")) frameTime = Number(line.split(":")[1]);
    if (line.startsWith("Frame Time:")) dataStart = i + 1;
  }
  const values = lines.slice(dataStart).join(" ").trim().split(/\s+/).filter(Boolean).map(Number);
  const channelCount = joints.reduce((sum, joint) => sum + (channels[joint]?.length ?? 0), 0);
  const frames: number[][] = [];
  if (channelCount > 0) {
    const available = Math.floor(values.length / channelCount);
    const total = frameCount > 0 ? Math.min(frameCount, available) : available;
    for (let f = 0; f < total; f += 1) {
      frames.push(values.slice(f * channelCount, (f + 1) * channelCount));
    }
  }

  return { joints, channels, frames, frameTime, frameCount: frames.length };
}

function rotationsFromFrame(data: BvhData, frame: number[]): BvhPose {
  let cursor = 0;
  const local: Record<string, [number, number, number]> = {};
  for (const joint of data.joints) {
    const names = data.channels[joint] ?? [];
    const values = frame.slice(cursor, cursor + names.length);
    cursor += names.length;
    const rotation: [number, number, number] = [0, 0, 0];
    names.forEach((name, index) => {
      if (name === "Xrotation") rotation[0] = (values[index] ?? 0) * DEG;
      if (name === "Yrotation") rotation[1] = (values[index] ?? 0) * DEG;
      if (name === "Zrotation") rotation[2] = (values[index] ?? 0) * DEG;
    });
    local[joint] = rotation;
  }

  const pose: BvhPose = {};
  for (const part of Object.keys(MAP) as (keyof BvhPose)[]) {
    const names = MAP[part];
    const found = names.map((name) => local[name]).find(Boolean);
    if (found) pose[part] = found;
  }
  return pose;
}
