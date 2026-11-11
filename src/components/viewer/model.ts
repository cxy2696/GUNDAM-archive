import type { Machine } from "@/lib/schema";

export type Vec3 = [number, number, number];
export type ColorKey = "primary" | "secondary" | "accent" | "frame" | "eye";

export type Piece = {
  shape: "box" | "cyl" | "sphere" | "cone" | "prism";
  /** box: [w,h,d]; cyl: [rTop,rBottom,h]; sphere: [r]; cone: [r,h] */
  size: [number, number, number];
  pos: Vec3;
  rot?: Vec3;
  color: ColorKey;
  emissive?: boolean;
  opacity?: number;
  /** Prism profile in local x/y, extruded along z and centred. */
  points?: [number, number][];
};

export type MechPart = {
  id:
    | "head"
    | "torso"
    | "waist"
    | "shoulder_l"
    | "shoulder_r"
    | "arm_l"
    | "arm_r"
    | "leg_l"
    | "leg_r"
    | "backpack"
    | "weapon"
    | "shield";
  axis: Vec3;
  order: number;
  pieces: Piece[];
};

export type ViewerConfig = Machine["viewer"];

const box = (
  size: Vec3,
  pos: Vec3,
  color: ColorKey,
  rot?: Vec3,
  extra: Partial<Piece> = {},
): Piece => ({ shape: "box", size, pos, color, rot, ...extra });

const cyl = (
  size: Vec3,
  pos: Vec3,
  color: ColorKey,
  rot?: Vec3,
  extra: Partial<Piece> = {},
): Piece => ({ shape: "cyl", size, pos, color, rot, ...extra });

const sphere = (r: number, pos: Vec3, color: ColorKey, extra: Partial<Piece> = {}): Piece => ({
  shape: "sphere",
  size: [r, r, r],
  pos,
  color,
  ...extra,
});

const cone = (r: number, h: number, pos: Vec3, color: ColorKey, rot?: Vec3): Piece => ({
  shape: "cone",
  size: [r, h, h],
  pos,
  color,
  rot,
});

const prism = (
  points: [number, number][],
  depth: number,
  pos: Vec3,
  color: ColorKey,
  rot?: Vec3,
): Piece => ({
  shape: "prism",
  size: [0, 0, depth],
  points,
  pos,
  color,
  rot,
});

/**
 * A parametric, part-aware stand-in for a delivered glTF LOD.
 * Every mesh is grouped by `partId`, carries an assembly axis and an
 * explosion order, which is exactly the contract described in docs/ASSET_PIPELINE.md.
 * Proportions are in metres at an 18 m reference height; the whole group is
 * scaled by the machine's actual height.
 */
export function buildMech(config: ViewerConfig): MechPart[] {
  const heavy = config.build === "heavy";
  const slim = config.build === "slim";
  const chestW = heavy ? 5.0 : slim ? 4.0 : 4.5;
  const legW = heavy ? 2.0 : slim ? 1.5 : 1.75;
  const headY = 15.15;
  const parts: MechPart[] = [];

  /* ---------------- backpack ---------------- */
  const backpackPieces: Piece[] = [
    box([2.4, 2.4, 0.85], [0, 12.45, -1.45], "frame"),
    box([2.0, 0.18, 0.9], [0, 13.55, -1.45], "secondary"),
  ];
  if (config.backpack === "thruster") {
    backpackPieces.push(
      cyl([0.34, 0.34, 0.9], [-0.72, 11.15, -1.5], "frame"),
      cyl([0.34, 0.34, 0.9], [0.72, 11.15, -1.5], "frame"),
      cyl([0.2, 0.2, 0.12], [-0.72, 10.68, -1.5], "eye", undefined, { emissive: true }),
      cyl([0.2, 0.2, 0.12], [0.72, 10.68, -1.5], "eye", undefined, { emissive: true }),
    );
  }
  if (config.backpack === "funnel") {
    for (let i = 0; i < 3; i += 1) {
      const y = 13.9 - i * 1.0;
      backpackPieces.push(
        box([0.16, 2.5, 0.78], [-2.0 - i * 0.28, y, -1.85], "secondary", [0.08, 0.1, -0.22]),
        box([0.16, 2.5, 0.78], [2.0 + i * 0.28, y, -1.85], "secondary", [0.08, -0.1, 0.22]),
        box([0.2, 0.24, 0.84], [-2.0 - i * 0.28, y + 1.1, -1.85], "accent", [0.08, 0.1, -0.22]),
        box([0.2, 0.24, 0.84], [2.0 + i * 0.28, y + 1.1, -1.85], "accent", [0.08, -0.1, 0.22]),
      );
    }
  }
  if (config.backpack === "wing") {
    backpackPieces.push(
      box([0.12, 5.4, 1.9], [-2.15, 14.5, -2.4], "secondary", [0.15, 0.2, -0.32]),
      box([0.12, 5.4, 1.9], [2.15, 14.5, -2.4], "secondary", [0.15, -0.2, 0.32]),
      box([0.05, 4.9, 0.14], [-2.32, 14.6, -1.72], "eye", [0.15, 0.2, -0.32], {
        emissive: true,
        opacity: 0.85,
      }),
      box([0.05, 4.9, 0.14], [2.32, 14.6, -1.72], "eye", [0.15, -0.2, 0.32], {
        emissive: true,
        opacity: 0.85,
      }),
      cyl([0.3, 0.3, 0.7], [-0.85, 11.2, -1.6], "frame"),
      cyl([0.3, 0.3, 0.7], [0.85, 11.2, -1.6], "frame"),
    );
  }
  parts.push({ id: "backpack", axis: [0, 0.1, -1], order: 1.15, pieces: backpackPieces });

  /* ---------------- shield ---------------- */
  if (config.shield) {
    parts.push({
      id: "shield",
      axis: [-1, 0, 0.45],
      order: 1.0,
      pieces: [
        prism(
          [[-0.98, 2.15], [0.98, 2.02], [1.02, -1.7], [0.45, -2.2], [-0.85, -2.0]],
          0.18,
          [-4.32, 8.6, 0.55],
          "primary",
          [0, 0.1, 0.03],
        ),
        prism(
          [[-0.72, 1.78], [0.72, 1.66], [0.74, -1.3], [0.3, -1.8], [-0.6, -1.62]],
          0.06,
          [-4.32, 8.6, 0.66],
          "secondary",
          [0, 0.1, 0.03],
        ),
        box([0.24, 3.7, 0.05], [-4.32, 8.6, 0.7], "accent", [0, 0.1, 0.03]),
        box([1.2, 0.24, 0.05], [-4.32, 8.9, 0.7], "accent", [0, 0.1, 0.03]),
        box([0.38, 0.38, 0.38], [-4.3, 8.35, 0.62], "frame"),
      ],
    });
  }

  /* ---------------- legs ---------------- */
  for (const side of [-1, 1] as const) {
    const x = side * (heavy ? 1.65 : slim ? 1.28 : 1.42);
    const pieces: Piece[] = [
      cyl([legW * 0.58, legW * 0.58, 1.2], [x, 9.55, 0], "frame"),
      sphere(legW * 0.5, [x, 8.95, 0], "frame"),
      prism([[-0.8 * (legW / 1.55), 1.6], [0.8 * (legW / 1.55), 1.6], [0.64 * (legW / 1.55), -1.65], [-0.64 * (legW / 1.55), -1.65]], legW * 1.02, [x, 7.2, 0], "primary"),
      box([legW * 0.38, 2.35, 0.18], [x, 7.25, legW * 0.58], "secondary"),
      prism([[-0.72 * (legW / 1.55), 0.4], [0.72 * (legW / 1.55), 0.4], [0.55 * (legW / 1.55), -0.4], [-0.55 * (legW / 1.55), -0.4]], legW * 1.1, [x, 5.62, 0.1], "secondary"),
      box([legW * 0.7, 0.22, 0.55], [x, 5.5, 0.66], "accent"),
      box([legW * 0.32, 1.75, legW * 0.7], [x + side * legW * 0.66, 7.5, -0.15], "secondary"),
      prism([[-0.7 * (legW / 1.55), 1.95], [0.7 * (legW / 1.55), 1.95], [0.95 * (legW / 1.55), 0.2], [0.55 * (legW / 1.55), -1.95], [-0.55 * (legW / 1.55), -1.95], [-0.95 * (legW / 1.55), 0.2]], legW * 1.16, [x, 3.42, 0], "primary"),
      box([legW * 0.78, 2.45, 0.14], [x, 3.5, legW * 0.63], "secondary"),
      box([legW * 0.3, 2.15, 0.1], [x, 3.45, legW * 0.72], "accent"),
      box([legW * 0.85, 0.45, 0.5], [x, 1.62, 0.22], "frame"),
      prism([[-0.85 * (legW / 1.55), 0.3], [0.85 * (legW / 1.55), 0.3], [0.65 * (legW / 1.55), -0.3], [-0.65 * (legW / 1.55), -0.3]], legW * 1.1, [x, 1.2, 0.16], "secondary"),
      box([legW * 1.05, 0.5, 2.55], [x, 0.48, 0.38], "secondary"),
      box([legW * 0.92, 0.28, 0.8], [x, 0.86, 1.0], "primary"),
      box([legW * 0.72, 0.16, 0.34], [x, 1.2, 0.95], "accent"),
    ];
    parts.push({
      id: side === -1 ? "leg_l" : "leg_r",
      axis: [side * 0.42, -1, 0],
      order: 0.75,
      pieces,
    });
  }

  /* ---------------- waist ---------------- */
  parts.push({
    id: "waist",
    axis: [0, -0.65, 0],
    order: 0.45,
    pieces: [
      prism([[-1.7, 0.7], [1.7, 0.7], [1.25, -0.8], [-1.25, -0.8]], 1.95, [0, 9.55, 0], "frame"),
      box([3.45, 0.34, 2.0], [0, 10.02, 0], "secondary"),
      prism([[-0.62, 0.95], [0.62, 0.95], [0.52, -0.95], [-0.52, -0.95]], 0.2, [-0.76, 8.78, 0.98], "primary", [0.05, 0, 0.04]),
      prism([[-0.62, 0.95], [0.62, 0.95], [0.52, -0.95], [-0.52, -0.95]], 0.2, [0.76, 8.78, 0.98], "primary", [0.05, 0, -0.04]),
      prism([[-0.55, 0.9], [0.55, 0.9], [0.4, -0.9], [-0.4, -0.9]], 0.14, [-1.75, 8.9, 0.2], "secondary", [0, 0, 0.08]),
      prism([[-0.55, 0.9], [0.55, 0.9], [0.4, -0.9], [-0.4, -0.9]], 0.14, [1.75, 8.9, 0.2], "secondary", [0, 0, -0.08]),
      box([0.65, 0.85, 0.45], [0, 8.95, 0.82], "accent"),
    ],
  });

  /* ---------------- torso ---------------- */
  parts.push({
    id: "torso",
    axis: [0, 0.35, 0],
    order: 0.35,
    pieces: [
      prism(
        [[-chestW / 2, 1.5], [chestW / 2, 1.5], [chestW / 2 - 0.6, -1.45], [-chestW / 2 + 0.6, -1.45]],
        2.5,
        [0, 12.1, 0],
        "primary",
      ),
      prism(
        [[-1.85, 0.95], [1.85, 0.95], [1.22, -1.05], [-1.22, -1.05]],
        0.2,
        [0, 12.25, 1.27],
        "secondary",
      ),
      prism([[-0.62, 0.78], [0.62, 0.78], [0.45, -0.85], [-0.45, -0.85]], 0.12, [0, 12.2, 1.4], "primary"),
      box([0.5, 0.62, 0.12], [-1.28, 12.45, 1.43], "accent"),
      box([0.5, 0.62, 0.12], [1.28, 12.45, 1.43], "accent"),
      box([2.5, 0.95, 1.85], [0, 10.45, 0], "secondary"),
      box([2.9, 0.34, 2.12], [0, 13.6, 0], "accent"),
      box([0.6, 1.25, 0.55], [-chestW / 2 - 0.1, 11.95, 0.1], "secondary"),
      box([0.6, 1.25, 0.55], [chestW / 2 + 0.1, 11.95, 0.1], "secondary"),
      box([1.8, 0.14, 0.14], [0, 11.15, 1.26], "frame"),
      box([chestW * 0.82, 2.3, 0.18], [0, 12.2, -1.28], "frame"),
      box([0.45, 0.5, 0.45], [-chestW / 2 - 0.15, 13.15, 0.4], "accent"),
      box([0.45, 0.5, 0.45], [chestW / 2 + 0.15, 13.15, 0.4], "accent"),
    ],
  });

  /* ---------------- shoulders ---------------- */
  for (const side of [-1, 1] as const) {
    const x = side * (chestW / 2 + 0.9);
    const pieces: Piece[] = [];
    if (config.shoulder === "round") {
      pieces.push(
        sphere(1.32, [x, 12.85, 0], "primary"),
        sphere(1.05, [x, 12.95, 0.42], "secondary", { opacity: 0.7 }),
        box([0.9, 0.35, 0.4], [x, 13.9, 0], "accent"),
      );
    } else if (config.shoulder === "binder") {
      pieces.push(
        box([0.25, 3.3, 1.85], [x + side * 0.85, 13.0, -0.35], "secondary", [0, 0, side * 0.08]),
        box([2.25, 2.1, 2.5], [x, 12.75, 0], "primary"),
        box([2.3, 0.22, 2.55], [x, 13.8, 0], "accent"),
        box([0.18, 2.6, 0.18], [x + side * 0.95, 13.0, 0.55], "accent"),
      );
    } else if (config.shoulder === "wing") {
      pieces.push(
        box([0.18, 3.4, 1.9], [x + side * 0.9, 13.35, -0.5], "secondary", [0.1, side * 0.18, side * 0.3]),
        box([2.2, 2.0, 2.45], [x, 12.75, 0], "primary"),
        box([2.25, 0.25, 2.5], [x, 13.7, 0], "accent"),
        box([0.06, 3.0, 0.12], [x + side * 1.05, 13.4, -0.1], "eye", undefined, { emissive: true }),
      );
    } else {
      pieces.push(
        box([0.55, 1.35, 1.2], [x - side * 1.2, 12.35, 0], "frame"),
        prism(
          [[-1.12, 1.0], [1.15, 0.9], [1.26, -0.6], [0.55, -1.12], [-1.25, -0.85]],
          2.3,
          [x, 12.8, 0],
          "primary",
          [0, 0, side * 0.05],
        ),
        box([2.25, 0.22, 2.4], [x, 13.78, 0], "secondary"),
        box([0.72, 1.05, 0.14], [x + side * 0.38, 12.65, 1.2], "accent", [0, 0, side * 0.05]),
        box([2.0, 0.18, 0.32], [x, 11.8, 1.12], "frame"),
        box([1.5, 0.6, 0.12], [x - side * 0.2, 12.15, 1.19], "secondary", [0, 0, side * 0.05]),
      );
      if (config.shoulder === "spike") {
        pieces.push(
          cone(0.22, 0.95, [x - side * 0.55, 14.35, 0.25], "secondary", [0, 0, side * 0.25]),
          cone(0.18, 0.8, [x, 14.5, -0.25], "secondary", [0, 0, side * 0.05]),
          cone(0.14, 0.65, [x + side * 0.55, 14.3, 0.2], "secondary", [0, 0, -side * 0.22]),
        );
      }
    }
    parts.push({
      id: side === -1 ? "shoulder_l" : "shoulder_r",
      axis: [side, 0.15, 0],
      order: 0.95,
      pieces,
    });
  }

  /* ---------------- arms ---------------- */
  for (const side of [-1, 1] as const) {
    const x = side * (chestW / 2 + 1.25);
    parts.push({
      id: side === -1 ? "arm_l" : "arm_r",
      axis: [side, 0.1, 0],
      order: 1.35,
      pieces: [
        sphere(0.58, [x, 12.1, 0], "frame"),
        box([0.92, 2.3, 0.95], [x, 10.9, 0], "frame"),
        box([1.12, 1.2, 1.2], [x, 9.65, 0], "primary"),
        sphere(0.5, [x, 9.3, 0], "frame"),
        box([1.18, 2.2, 1.3], [x, 8.3, 0.06], "primary"),
        box([0.9, 1.3, 0.12], [x, 8.35, 0.74], "secondary"),
        box([0.3, 0.9, 0.08], [x, 8.3, 0.8], "accent"),
        box([0.66, 0.62, 0.58], [x, 7.0, 0.1], "frame"),
      ],
    });
  }

  /* ---------------- head ---------------- */
  const headPieces: Piece[] = [
    cyl([0.4, 0.46, 0.7], [0, 13.9, 0], "frame"),
    box([1.92, 2.0, 1.82], [0, headY, 0], "primary"),
    box([1.46, 0.82, 0.12], [0, 14.98, 0.94], "frame"),
    box([1.28, 0.2, 0.08], [0, 15.33, 1.005], "frame"),
    box([1.62, 0.24, 0.34], [0, 15.66, 0.82], "primary"),
    box([0.7, 0.26, 0.42], [0, 14.45, 0.72], "accent"),
    prism([[-0.34, 0.55], [0.34, 0.55], [0.26, -0.55], [-0.26, -0.55]], 0.5, [-0.9, 14.95, 0.35], "primary", [0, 0, 0.08]),
    prism([[-0.34, 0.55], [0.34, 0.55], [0.26, -0.55], [-0.26, -0.55]], 0.5, [0.9, 14.95, 0.35], "primary", [0, 0, -0.08]),
    box([0.16, 0.55, 0.46], [-0.94, 15.35, 0.12], "secondary"),
    box([0.16, 0.55, 0.46], [0.94, 15.35, 0.12], "secondary"),
    cyl([0.12, 0.12, 0.2], [-0.86, 15.55, 0.72], "frame", [Math.PI / 2, 0, 0.2]),
    cyl([0.12, 0.12, 0.2], [0.86, 15.55, 0.72], "frame", [Math.PI / 2, 0, -0.2]),
  ];
  if (config.head === "mono") {
    headPieces.push(
      cyl([0.25, 0.25, 0.12], [0, 15.16, 1.0], "eye", [Math.PI / 2, 0, 0], { emissive: true }),
      cyl([0.31, 0.31, 0.06], [0, 15.16, 0.95], "frame", [Math.PI / 2, 0, 0]),
      box([0.8, 0.42, 0.5], [0, 14.7, 0.7], "secondary"),
      cone(0.09, 0.5, [-0.5, 16.25, 0.1], "accent"),
      cone(0.09, 0.55, [0, 16.35, 0.1], "accent"),
      cone(0.09, 0.5, [0.5, 16.25, 0.1], "accent"),
    );
  } else if (config.head === "unicorn") {
    headPieces.push(
      box([0.95, 0.16, 0.08], [0, 15.18, 1.01], "eye", undefined, { emissive: true }),
      cone(0.14, 1.4, [0, 16.8, 0.42], "accent", [-0.16, 0, 0]),
      box([0.2, 0.6, 0.3], [0, 16.1, 0.6], "accent"),
    );
  } else if (config.head === "mustache") {
    headPieces.push(
      box([1.1, 0.14, 0.08], [0, 15.2, 1.01], "eye", undefined, { emissive: true }),
      box([1.5, 0.12, 0.38], [-1.15, 15.02, 0.55], "accent", [0, 0, 0.24]),
      box([1.5, 0.12, 0.38], [1.15, 15.02, 0.55], "accent", [0, 0, -0.24]),
      box([1.7, 0.22, 0.3], [0, 15.65, 0.5], "secondary"),
    );
  } else if (config.head === "fin") {
    headPieces.push(
      box([0.32, 0.12, 0.06], [-0.26, 15.25, 1.01], "eye", undefined, { emissive: true }),
      box([0.32, 0.12, 0.06], [0.26, 15.25, 1.01], "eye", undefined, { emissive: true }),
      box([0.14, 1.15, 0.55], [0, 16.55, 0.2], "accent", [0.18, 0, 0]),
    );
  } else {
    headPieces.push(
      box([0.42, 0.18, 0.08], [-0.31, 15.16, 1.045], "eye", undefined, { emissive: true }),
      box([0.42, 0.18, 0.08], [0.31, 15.16, 1.045], "eye", undefined, { emissive: true }),
      box([0.9, 0.16, 0.12], [0, 15.16, 0.99], "frame"),
      box([2.55, 0.15, 0.24], [-0.92, 16.62, 0.94], "accent", [0, 0, 0.38]),
      box([2.55, 0.15, 0.24], [0.92, 16.62, 0.94], "accent", [0, 0, -0.38]),
      box([0.18, 0.72, 0.26], [0, 16.55, 1.0], "accent"),
      box([0.3, 0.22, 0.14], [0, 15.7, 0.98], "eye", undefined, { emissive: true }),
      box([0.34, 0.34, 0.1], [-0.62, 14.72, 0.95], "accent"),
      box([0.34, 0.34, 0.1], [0.62, 14.72, 0.95], "accent"),
    );
  }
  parts.push({ id: "head", axis: [0, 1, 0], order: 1.25, pieces: headPieces });

  /* ---------------- weapon ---------------- */
  if (config.weapon !== "none") {
    const pieces: Piece[] = [];
    if (config.weapon === "rifle") {
      pieces.push(
        box([0.4, 0.58, 2.5], [3.5, 7.95, 1.45], "frame"),
        box([0.46, 0.34, 0.8], [3.5, 7.72, 0.15], "secondary"),
        box([0.24, 0.24, 1.05], [3.5, 8.38, 1.25], "accent"),
        cyl([0.11, 0.11, 2.1], [3.5, 8.02, 3.35], "frame", [Math.PI / 2, 0, 0]),
        cyl([0.16, 0.16, 0.3], [3.5, 8.02, 4.4], "secondary", [Math.PI / 2, 0, 0]),
        box([0.2, 0.55, 0.38], [3.5, 7.62, 1.9], "secondary"),
        box([0.52, 0.42, 0.4], [3.5, 7.2, 1.1], "secondary"),
        box([0.5, 0.5, 0.5], [3.45, 7.0, 0.1], "frame"),
      );
    } else if (config.weapon === "bazooka") {
      pieces.push(
        cyl([0.3, 0.3, 3.4], [3.4, 8.7, 1.4], "frame", [Math.PI / 2, 0, 0]),
        cyl([0.36, 0.36, 0.5], [3.4, 8.7, 2.9], "secondary", [Math.PI / 2, 0, 0]),
        box([0.4, 0.7, 0.5], [3.4, 8.2, 0.8], "secondary"),
        box([0.55, 0.55, 0.55], [3.4, 7.0, 0.1], "frame"),
      );
    } else if (config.weapon === "saber") {
      pieces.push(
        cyl([0.09, 0.09, 3.1], [3.75, 9.2, 0.35], "eye", undefined, { emissive: true }),
        cyl([0.14, 0.14, 0.45], [3.75, 7.55, 0.35], "frame"),
        box([0.5, 0.5, 0.5], [3.45, 7.0, 0.1], "frame"),
      );
    } else if (config.weapon === "mace") {
      pieces.push(
        cyl([0.1, 0.13, 3.5], [3.7, 7.6, 0.45], "frame"),
        box([0.95, 0.95, 0.95], [3.7, 5.6, 0.45], "secondary"),
        cone(0.16, 0.55, [3.7, 4.9, 0.45], "accent", [Math.PI, 0, 0]),
        box([0.4, 0.3, 0.4], [3.7, 6.2, 0.45], "accent"),
        box([0.5, 0.5, 0.5], [3.45, 7.0, 0.1], "frame"),
      );
    }
    parts.push({ id: "weapon", axis: [0.55, 0.15, 1], order: 1.45, pieces });
  }

  return parts;
}

export const PART_LABELS = {
  head: { zh: "头部", ja: "頭部" },
  torso: { zh: "胸部 / 躯干", ja: "胸部・胴体" },
  waist: { zh: "腰部 / 裙甲", ja: "腰部・スカート" },
  shoulder_l: { zh: "左肩甲", ja: "左肩アーマー" },
  shoulder_r: { zh: "右肩甲", ja: "右肩アーマー" },
  arm_l: { zh: "左臂", ja: "左腕" },
  arm_r: { zh: "右臂", ja: "右腕" },
  leg_l: { zh: "左腿", ja: "左脚" },
  leg_r: { zh: "右腿", ja: "右脚" },
  backpack: { zh: "背包 / 推进器", ja: "バックパック・スラスター" },
  weapon: { zh: "主武器", ja: "主武装" },
  shield: { zh: "盾牌", ja: "シールド" },
} as const;

export type PartId = keyof typeof PART_LABELS;
