# Changelog

## [3.7.1] — 2026-11-19

### Fixed

- Corrected the elbow and knee rotation direction. The model faces +Z, so +X moves a downward segment toward -Z; elbows now flex negative (forward) and knees positive (heel back).
- Synced the walk, crouch, recoil impulse and no-WebAssembly fallback joint signs.
- Corrected the cockpit seat orientation: the backrest and headrest now sit behind the cushion at +Z, so the pilot faces the console and screens at -Z. The inspection camera moved to a side view so the interior remains readable.
- Verified idle elbows at `-0.100 rad`, knees at `+0.130 rad`; crouch elbows at `-0.359 rad`, knees at `+0.509 rad`.

### Current snapshot

- 148 machines, 114 characters, 69 events, 82 factions, 12 eras, 156 atlas nodes.
- 1,280 static pages, 1,272 sitemap routes, 487 search entries per language.
