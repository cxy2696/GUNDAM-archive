/*
 * GUNDAM Archive — C++ simulation core (v3.7.0)
 *
 * Freestanding WebAssembly module. It owns:
 *   - 12-part joint targets for Idle / Alert / Boost
 *   - damped spring physics and pointer-driven head/torso aiming
 *   - a two-bone IK helper used by mocap retargeting
 *
 * No C++ runtime, no libm, no heap allocation. The browser still owns
 * the WebGL draw calls; C++ owns the rig dynamics and interaction state.
 * See docs/ASSET_PIPELINE.md.
 */
extern "C" {

constexpr float PI = 3.14159265358979323846f;
constexpr int PART_COUNT = 16;
constexpr int VALUE_COUNT = PART_COUNT * 3;

static float target[VALUE_COUNT];
static float pose[VALUE_COUNT];
static float velocity[VALUE_COUNT];
static float rootOut[3];
static float ikOut[2];
static float gaitPhase = 0.0f;
static float walkBlend = 0.0f;
static float crouchBlend = 0.0f;
static int initialized = 0;

static inline float absf(float x) { return x < 0 ? -x : x; }
static inline float wrap(float x) {
  while (x > PI) x -= PI * 2.0f;
  while (x < -PI) x += PI * 2.0f;
  return x;
}
static inline float fsin(float x) {
  x = wrap(x);
  const float x2 = x * x;
  return x * (1.0f - x2 / 6.0f + x2 * x2 / 120.0f - x2 * x2 * x2 / 5040.0f);
}
static inline float fcos(float x) { return fsin(x + PI * 0.5f); }
static inline float clampf(float x, float lo, float hi) {
  return x < lo ? lo : x > hi ? hi : x;
}
static inline float fsqrt(float x) {
  if (x <= 0.0f) return 0.0f;
  float r = x > 1.0f ? x * 0.5f : 1.0f;
  for (int i = 0; i < 8; i++) r = (r + x / r) * 0.5f;
  return r;
}
static inline float fatan(float x) {
  const float ax = absf(x);
  if (ax > 1.0f) {
    const float r = PI * 0.5f - fatan(1.0f / ax);
    return x < 0.0f ? -r : r;
  }
  const float x2 = x * x;
  return x * (0.9998660f + x2 * (-0.3302995f + x2 * (0.1801410f + x2 * (-0.0851330f + x2 * 0.0208351f))));
}
static inline float fatan2(float y, float x) {
  if (x > 0.0f) return fatan(y / x);
  if (x < 0.0f) return y >= 0.0f ? fatan(y / x) + PI : fatan(y / x) - PI;
  if (y > 0.0f) return PI * 0.5f;
  if (y < 0.0f) return -PI * 0.5f;
  return 0.0f;
}
static inline float facos(float x) {
  const float c = clampf(x, -1.0f, 1.0f);
  return fatan2(fsqrt(1.0f - c * c), c);
}

__attribute__((export_name("pose_ptr"))) float* pose_ptr() { return pose; }
__attribute__((export_name("root_ptr"))) float* root_ptr() { return rootOut; }
__attribute__((export_name("ik_ptr"))) float* ik_ptr() { return ikOut; }

/* Write the unbounded target pose for the current mode and pointer. */
static void compute_target(int mode, float t, float pointerX, float pointerY, int enabled) {
  const float active = enabled ? 1.0f : 0.0f;
  const float px = clampf(pointerX, -1.0f, 1.0f);
  const float py = clampf(pointerY, -1.0f, 1.0f);
  const float boost = mode == 2 ? 1.0f : 0.0f;
  const float alert = mode == 1 ? 1.0f : 0.0f;
  const float idle = 1.0f - (boost > alert ? boost : alert);

  for (int i = 0; i < VALUE_COUNT; i++) target[i] = 0.0f;

  // 0 head: scan / alert / boost + pointer tracking
  target[0] = active * (idle * fsin(t * 0.6f + 0.4f) * 0.018f + alert * -0.035f + boost * -0.08f + py * 0.09f);
  target[1] = active * (idle * (fsin(t * 0.38f) * 0.09f + fsin(t * 0.13f + 1.2f) * 0.03f) + alert * fsin(t * 1.55f) * 0.18f + boost * (-0.05f + fsin(t * 2.1f) * 0.035f) + px * 0.24f);
  target[2] = active * px * -0.035f;

  // 1 torso follows the pointer at a smaller angle
  target[3] = active * (idle * fsin(t * 0.44f + 1.1f) * 0.006f + alert * 0.012f + boost * 0.02f + py * 0.018f + crouchBlend * 0.16f);
  target[4] = active * (idle * fsin(t * 0.31f + 0.7f) * 0.012f + alert * fsin(t * 1.05f) * 0.03f + boost * -0.025f + px * 0.075f);
  target[5] = active * px * -0.018f;

  // 2 waist
  target[6] = active * (idle * 0.008f + alert * 0.025f + boost * 0.045f + py * 0.02f + crouchBlend * 0.22f);
  target[7] = active * (idle * fsin(t * 0.29f + 1.4f) * 0.006f + boost * 0.012f + px * 0.025f);
  target[8] = 0.0f;

  // 3/4 shoulders
  target[9] = active * (alert * -0.01f + boost * 0.03f + py * 0.01f);
  target[10] = 0.0f;
  target[11] = active * -1.0f * (idle * fsin(t * 0.7f + PI) * 0.006f + alert * 0.028f + boost * 0.045f);
  target[12] = target[9];
  target[13] = 0.0f;
  target[14] = active * (idle * fsin(t * 0.7f) * 0.006f + alert * 0.028f + boost * 0.045f);

  // 5/6 arms counterweight the pointer
  target[15] = active * (idle * fsin(t * 0.8f + PI) * 0.014f + alert * -0.025f + boost * 0.085f + py * 0.025f);
  target[16] = 0.0f;
  target[17] = active * -1.0f * (idle * fsin(t * 0.5f + PI + 0.6f) * 0.006f + alert * 0.012f + boost * 0.02f) + px * -0.03f;
  target[18] = active * (idle * fsin(t * 0.8f) * 0.014f + alert * -0.025f + boost * 0.085f + py * 0.025f);
  target[19] = 0.0f;
  target[20] = active * (idle * fsin(t * 0.5f + 0.6f) * 0.006f + alert * 0.012f + boost * 0.02f) + px * -0.03f;

  // 7/8 legs brace subtly against pointer motion
  target[21] = active * (idle * fsin(t * 0.65f + PI) * 0.004f + alert * 0.008f + boost * 0.045f);
  target[22] = 0.0f;
  target[23] = active * -1.0f * boost * 0.018f + px * 0.008f;
  target[24] = active * (idle * fsin(t * 0.65f) * 0.004f + alert * 0.008f + boost * 0.045f);
  target[25] = 0.0f;
  target[26] = active * boost * 0.018f + px * 0.008f;

  // 12/13 elbows and 14/15 knees (children of arms/legs)
  const float elbowBend = 0.10f + alert * 0.08f + boost * 0.12f + walkBlend * 0.12f + crouchBlend * 0.26f;
  const float kneeBend = -0.13f - alert * 0.08f - boost * 0.10f - walkBlend * 0.16f - crouchBlend * 0.38f;
  target[36] = active * elbowBend;
  target[39] = active * elbowBend;
  target[42] = active * kneeBend;
  target[45] = active * kneeBend;

  // 9 backpack
  target[27] = active * (idle * fsin(t * 6.5f) * 0.0015f + alert * fsin(t * 8.5f) * 0.0025f + boost * fsin(t * 25.0f) * 0.007f);
  target[28] = 0.0f;
  target[29] = 0.0f;

  // 10 weapon
  target[30] = 0.0f;
  target[31] = 0.0f;
  target[32] = active * (idle * fsin(t * 1.1f) * 0.006f + alert * 0.012f + boost * -0.018f);

  // 11 shield
  target[33] = 0.0f;
  target[34] = 0.0f;
  target[35] = active * -1.0f * (idle * fsin(t * 0.9f + 0.5f) * 0.005f + alert * 0.01f + boost * 0.018f);

  // Walk gait: opposing arm/leg swing, torso counter-rotation and a
  // ground-contact bob. The phase is advanced in step_physics().
  if (walkBlend > 0.001f) {
    const float swing = fsin(gaitPhase);
    target[15] += swing * 0.24f * walkBlend;
    target[18] -= swing * 0.24f * walkBlend;
    target[21] += swing * 0.32f * walkBlend;
    target[24] -= swing * 0.32f * walkBlend;
    target[36] += (0.16f + 0.08f * swing) * walkBlend;
    target[39] += (0.16f - 0.08f * swing) * walkBlend;
    target[42] -= (0.12f + 0.18f * (0.5f + 0.5f * swing)) * walkBlend;
    target[45] -= (0.12f + 0.18f * (0.5f - 0.5f * swing)) * walkBlend;
    target[4] += swing * 0.055f * walkBlend;
    target[7] += swing * 0.035f * walkBlend;
  }
}

/*
 * Main per-frame entry point. dt is clamped and integrated in two
 * substeps for stability without a heap or libm.
 */
__attribute__((export_name("step_physics"))) void step_physics(
    int mode, float t, float dt, float pointerX, float pointerY, int enabled, int walking, float speed, int crouching) {
  const float clampedDt = clampf(dt, 0.001f, 0.05f);
  const float walkTarget = (enabled && walking) ? 1.0f : 0.0f;
  walkBlend += (walkTarget - walkBlend) * clampf(clampedDt * 5.0f, 0.0f, 1.0f);
  const float crouchTarget = (enabled && crouching) ? 1.0f : 0.0f;
  crouchBlend += (crouchTarget - crouchBlend) * clampf(clampedDt * 4.5f, 0.0f, 1.0f);
  if (walkBlend > 0.001f) {
    gaitPhase += clampedDt * clampf(speed, 0.4f, 2.2f) * 4.2f;
    if (gaitPhase > PI * 2.0f) gaitPhase -= PI * 2.0f;
  } else {
    gaitPhase = 0.0f;
  }
  compute_target(mode, t, pointerX, pointerY, enabled);
  if (!initialized) {
    for (int i = 0; i < VALUE_COUNT; i++) {
      pose[i] = target[i];
      velocity[i] = 0.0f;
    }
    initialized = 1;
    return;
  }

  const float step = clampedDt * 0.5f;
  for (int sub = 0; sub < 2; sub++) {
    for (int i = 0; i < VALUE_COUNT; i++) {
      const float stiffness = 78.0f + (i % 3) * 14.0f;
      const float damping = 15.5f;
      const float acceleration = (target[i] - pose[i]) * stiffness - velocity[i] * damping;
      velocity[i] += acceleration * step;
      pose[i] += velocity[i] * step;
      pose[i] = clampf(pose[i], -0.85f, 0.85f);
    }
  }
  const float swing = fsin(gaitPhase);
  rootOut[0] = swing * 0.035f * walkBlend;
  rootOut[1] = (1.0f - fcos(gaitPhase * 2.0f)) * 0.022f * walkBlend - crouchBlend * 0.14f;
  rootOut[2] = -swing * 0.018f * walkBlend;
}

/* A short recoil / acknowledgement impulse for real-time UI events. */
__attribute__((export_name("apply_impulse"))) void apply_impulse(float amount) {
  const float a = clampf(amount, -2.0f, 2.0f);
  velocity[0] += a * 0.5f;
  velocity[1] += a * 1.1f;
  velocity[4] += a * 0.55f;
  velocity[15] += a * 0.35f;
  velocity[18] -= a * 0.35f;
  velocity[21] += a * 0.25f;
  velocity[24] -= a * 0.25f;
  velocity[36] += a * 0.25f;
  velocity[39] -= a * 0.25f;
  velocity[42] -= a * 0.3f;
  velocity[45] += a * 0.3f;
}

__attribute__((export_name("reset_physics"))) void reset_physics() {
  initialized = 0;
  gaitPhase = 0.0f;
  walkBlend = 0.0f;
  crouchBlend = 0.0f;
  rootOut[0] = rootOut[1] = rootOut[2] = 0.0f;
  for (int i = 0; i < VALUE_COUNT; i++) {
    pose[i] = 0.0f;
    velocity[i] = 0.0f;
  }
}

/*
 * Two-bone IK for mocap retargeting.
 * Output: out[0] = shoulder / hip angle, out[1] = elbow / knee angle.
 * Angles are radians with +Y up and +X reaching forward.
 */
__attribute__((export_name("two_bone_ik"))) int two_bone_ik(
    float targetX, float targetY, float lengthA, float lengthB, float* out) {
  if (!out || lengthA <= 0.0f || lengthB <= 0.0f) return 0;
  const float dist = clampf(targetX * targetX + targetY * targetY, 0.0001f, (lengthA + lengthB) * (lengthA + lengthB));
  const float d = fsqrt(dist);
  if (d < absf(lengthA - lengthB) || d > lengthA + lengthB) return 0;
  const float base = fatan2(targetY, targetX);
  const float cosA = clampf((lengthA * lengthA + d * d - lengthB * lengthB) / (2.0f * lengthA * d), -1.0f, 1.0f);
  const float a = facos(cosA);
  out[0] = base - a;
  const float cosB = clampf((lengthA * lengthA + lengthB * lengthB - d * d) / (2.0f * lengthA * lengthB), -1.0f, 1.0f);
  out[1] = PI - facos(cosB);
  return 1;
}

}  // extern "C"
