# Changelog

## [3.6.0] — 2026-11-17

### C++ walking and interaction

- Added a C++ gait controller: leg stride, opposing arm swing, torso counter-rotation and a ground-contact root bob are advanced by the physics step.
- Added `root_ptr()`; the renderer applies C++ sway, bob and lean instead of a separate JavaScript oscillation.
- Added a `Walk` control in the viewer. Motion mode changes and walk toggles inject a C++ recoil impulse.

### Cockpit detail

- Rebuilt the control sticks with a base, shaft, grip, trigger and thumb button.
- Added dedicated power/comms/weapon console buttons with active lights; the same state is available in the cockpit overlay and powers the screens.
- Added more display bezels, warning lamps and switch detail around the main console.

### Current snapshot

- 148 machines, 114 characters, 69 events, 82 factions, 12 eras, 156 atlas nodes.
- 1,280 static pages, 1,272 sitemap routes, 487 search entries per language.
