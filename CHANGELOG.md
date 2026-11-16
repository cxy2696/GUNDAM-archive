# Changelog

## [3.5.0] — 2026-11-17

### C++ physics and interaction

- Replaced TypeScript pose smoothing with a C++ damped-spring solver compiled to WebAssembly.
- Added pointer-driven head, torso, waist, arm and leg targets; moving the pointer over the viewer makes the suit track it in real time.
- Added a C++ recoil impulse used when the motion mode changes.
- Added a reset entry point for the physics state; the TypeScript fallback remains.

### Redundancy pass

- Removed the retired operation console stylesheet block and unused console copy from the dictionaries.
- The viewer now exposes `C++ PHYSICS` instead of the older `C++ RIG` label.

### Current snapshot

- 148 machines, 114 characters, 69 events, 82 factions, 12 eras, 156 atlas nodes.
- 1,280 static pages, 1,272 sitemap routes, 487 search entries per language.
