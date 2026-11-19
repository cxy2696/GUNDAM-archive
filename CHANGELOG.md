# Changelog

## [3.7.0] — 2026-11-19

### Jointed model

- Split every arm and leg into a parent limb plus a child forearm / shin joint, giving all 148 machines separate elbow and knee pivots.
- Added C++ elbow and knee targets, so idle, alert, boost, walk and crouch all bend the joints instead of rotating a rigid limb.
- Added a `Bend` control backed by a C++ crouch blend: waist lean, torso flex, elbow bend, knee bend and root drop.
- Reclassified the universal detail kit by joint height, so later-added mechanical detail follows the correct upper/lower segment.

### C++ performance

- The physics state now covers 48 joint values, integrated in two fixed substeps with per-joint stiffness/damping.
- Cached the WASM pose and root views in the browser bridge; per-frame stepping no longer allocates typed arrays.
- Pointer-driven aim, walk, crouch and recoil all run through the same C++ solver.

### Cockpit

- Control sticks rebuilt with base, shaft, grip, trigger and thumb button.
- Added power/comms/weapon buttons with active lights, screen bezels, warning lamps and a WebGL fallback to the 2D blueprint.

### Current snapshot

- 148 machines, 114 characters, 69 events, 82 factions, 12 eras, 156 atlas nodes.
- 1,280 static pages, 1,272 sitemap routes, 487 search entries per language.
