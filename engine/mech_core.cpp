/*
 * GUNDAM Archive — C++ rig core (v3.3.1)
 *
 * Freestanding WebAssembly module. It owns the joint-rotation target
 * solver used by the procedural mecha rig:
 *   - 12 part rotations for Idle / Alert / Boost
 *   - a two-bone IK helper for future BVH / mocap retargeting
 *
 * No C++ runtime, no libm, no heap allocation. The browser still owns
 * the WebGL draw calls; this module owns the rig math and smoothing
 * targets. See docs/ASSET_PIPELINE.md.
 */
extern "C" {

constexpr float PI = 3.14159265358979323846f;
constexpr int PART_COUNT = 12;

static float pose[PART_COUNT * 3];
static float ikOut[2];

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
__attribute__((export_name("ik_ptr"))) float* ik_ptr() { return ikOut; }

__attribute__((export_name("solve_pose"))) void solve_pose(int mode, float t, int enabled) {
  const float active = enabled ? 1.0f : 0.0f;
  const float boost = mode == 2 ? 1.0f : 0.0f;
  const float alert = mode == 1 ? 1.0f : 0.0f;
  const float idle = 1.0f - (boost > alert ? boost : alert);

  for (int i = 0; i < PART_COUNT * 3; i++) pose[i] = 0.0f;

  // 0 head: scanning yaw + alert/boost pitch
  pose[0] = active * (idle * fsin(t * 0.6f + 0.4f) * 0.018f + alert * -0.035f + boost * -0.08f);
  pose[1] = active * (idle * (fsin(t * 0.38f) * 0.09f + fsin(t * 0.13f + 1.2f) * 0.03f) + alert * fsin(t * 1.55f) * 0.18f + boost * (-0.05f + fsin(t * 2.1f) * 0.035f));
  pose[2] = 0.0f;

  // 1 torso
  pose[3] = active * (idle * fsin(t * 0.44f + 1.1f) * 0.006f + alert * 0.012f + boost * 0.02f);
  pose[4] = active * (idle * fsin(t * 0.31f + 0.7f) * 0.012f + alert * fsin(t * 1.05f) * 0.03f + boost * -0.025f);
  pose[5] = 0.0f;

  // 2 waist
  pose[6] = 0.0f;
  pose[7] = active * (idle * fsin(t * 0.29f + 1.4f) * 0.006f + boost * 0.012f);
  pose[8] = 0.0f;

  // 3/4 shoulders
  pose[9] = active * (alert * -0.01f + boost * 0.03f);
  pose[10] = 0.0f;
  pose[11] = active * -1.0f * (idle * fsin(t * 0.7f + PI) * 0.006f + alert * 0.028f + boost * 0.045f);
  pose[12] = pose[9];
  pose[13] = 0.0f;
  pose[14] = active * (idle * fsin(t * 0.7f) * 0.006f + alert * 0.028f + boost * 0.045f);

  // 5/6 arms
  pose[15] = active * (idle * fsin(t * 0.8f + PI) * 0.014f + alert * -0.025f + boost * 0.085f);
  pose[16] = 0.0f;
  pose[17] = active * -1.0f * (idle * fsin(t * 0.5f + PI + 0.6f) * 0.006f + alert * 0.012f + boost * 0.02f);
  pose[18] = active * (idle * fsin(t * 0.8f) * 0.014f + alert * -0.025f + boost * 0.085f);
  pose[19] = 0.0f;
  pose[20] = active * (idle * fsin(t * 0.5f + 0.6f) * 0.006f + alert * 0.012f + boost * 0.02f);

  // 7/8 legs
  pose[21] = active * (idle * fsin(t * 0.65f + PI) * 0.004f + alert * 0.008f + boost * 0.045f);
  pose[22] = 0.0f;
  pose[23] = active * -1.0f * boost * 0.018f;
  pose[24] = active * (idle * fsin(t * 0.65f) * 0.004f + alert * 0.008f + boost * 0.045f);
  pose[25] = 0.0f;
  pose[26] = active * boost * 0.018f;

  // 9 backpack
  pose[27] = active * (idle * fsin(t * 6.5f) * 0.0015f + alert * fsin(t * 8.5f) * 0.0025f + boost * fsin(t * 25.0f) * 0.007f);
  pose[28] = 0.0f;
  pose[29] = 0.0f;

  // 10 weapon
  pose[30] = 0.0f;
  pose[31] = 0.0f;
  pose[32] = active * (idle * fsin(t * 1.1f) * 0.006f + alert * 0.012f + boost * -0.018f);

  // 11 shield
  pose[33] = 0.0f;
  pose[34] = 0.0f;
  pose[35] = active * -1.0f * (idle * fsin(t * 0.9f + 0.5f) * 0.005f + alert * 0.01f + boost * 0.018f);
}

/*
 * Two-bone IK for future mocap retargeting.
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
