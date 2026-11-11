# Changelog

All notable changes to GAIA Archive are documented here.  
Format: [Keep a Changelog](https://keepachangelog.com/); versioning: SemVer.

## [1.0.0] — 2026-11-11

### Added

- **Archive application** with 100 statically exported pages in Chinese and Japanese.
- **Content layer**: 12 machines, 7 eras, 23 events, 17 factions, 12 characters, 14 works, 15 places, 19 controlled tags, 8 lineage edges.
- **Zod schema** (`src/lib/schema.ts`) as the single source of truth, with cross-file validation for references, DAG acyclicity, and reciprocal pilot/event links.
- **3D viewer** (`MechViewer` / `MechStage`): orbit controls, camera presets, explode slider, part hover, wireframe edges, procedural LOD-P geometry, contact shadows, procedural environment.
- **Quantum form**: continuous 0–100 intensity, particle field, energy rings, cyan color shift, emissive armor, wireframe aura.
- **2D design sheet**: layered SVG with `data-part`, 3D/2D/split modes, synchronized hover, engineering mode.
- **Tech tree**: longest-path DAG layout, three edge kinds, tag highlighting, parallel-universe strip, cycle validation.
- **Timeline**: seven era lanes with local scales, collision-aware event labels, year/decade/century ticks, U.C. full-history toggle, event drawer.
- **Orbital map**: schematic Earth sphere, L1–L5 orbits, Earth/colony/deep-space markers, battle event panel.
- **Dossiers**: faction organization tree and relations; character affiliations, machines, events, relationships.
- **Search**: build-time index, `⌘K` command palette, dedicated search page, Chinese/Japanese/English names, model codes, aliases.
- **Bilingual routing**: `/zh` and `/ja`, hreflang/canonical, language switch preserving path.
- **Design system**: dark/light tokens, Space Grotesk + JetBrains Mono + CJK fallbacks, industrial grid, hairline panels, reduced-motion support.
- **SEO/PWA scaffolding**: sitemap, robots, web manifest, 404, OG metadata.
- **CI**: validate → typecheck → build; GitHub Pages deployment workflow.
- **Documentation**: architecture, content guide, data dictionary, asset pipeline, governance, design system, roadmap, templates.

### Known limitations

- 3D assets are procedural placeholders (LOD-P), not glTF LOD0.
- Seed data has not been verified against setting-book page numbers; entries are marked `seed`, uncertain ones `disputed`.
- No backend/database/admin in V1; search is a client-side index generated at build time.
- No pinyin/romaji fuzzy matching yet; aliases are curated manually.
- Visual regression and real-device performance gates are M4 work.

### Security

- Static export; no server runtime, no credentials in the browser.
- External links use `rel="noreferrer"`; no user-generated HTML is rendered.
