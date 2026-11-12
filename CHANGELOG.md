# Changelog

All notable changes to GUNDAM Archive are documented here.  
Format: [Keep a Changelog](https://keepachangelog.com/); versioning: SemVer.

## [3.1.1] — 2026-11-12

### Documentation and operability

- Rewrote README/README.ja around a current project description; removed duplicate reading sections and stale counts.
- Added [OPERATIONS.md](docs/OPERATIONS.md): release flow, GitHub Pages topology, monitoring, rollback, troubleshooting, permissions and periodic maintenance.
- Added a documentation ownership/update matrix and authority order to `docs/README.md`; DESIGN_SYSTEM rewritten for v3.1 tokens and components, removing the obsolete v2 console/palette notes.
- Condensed `docs/ROADMAP.md` to current release + next plan + compact release history; detailed history stays in this CHANGELOG.
- Reordered `docs/DATA_DICTIONARY.md` (Atlas, asset manifest, derived data, migration), added Atlas/routes and derived-data rules.
- Updated CONTENT_GUIDE (Atlas workflow), CHRONOLOGY (69 events + per-era event counts), MACHINE_COVERAGE, GLOSSARY (A.S. count, project terms), GOVERNANCE and EDITORIAL for v3.1.
- Extended `docs:check` to verify required documents, package version, canonical content counts and duplicate README headings.
- Updated package/GitHub/site metadata descriptions.
- Version bumped to `3.1.1`; pages 854; index 487; events 69; no content-count changes.

## [3.1.0] — 2026-11-12

### Added

- **Cockpit shell v3**: metal bezel, canopy viewport, screen chrome strip, side MFD rails on wide displays, and a fixed console deck with era drive, signal distribution, target queue and auxiliary keys. The console collapses to a drawer on phones.
- **Readable type scale**: every label, table cell, tag and micro-heading was lifted out of the 6–10px range; body copy is 17px, `.micro` 12px, labels 12.5–14px, and the large reading mode goes further. All layout tracks were widened to match.
- **12-era orbital atlas** (`/[lang]/map`): 156 map nodes across 12 charts, each with a 2D tactical plot and a 3D WebGL globe, switchable per era. Includes Lagrange rings, a rotatable orthographic Earth, a surface inset map for Earth sites, route arcs, faction ownership, event links and per-era sources.
- **Canonical geography pass**: U.C. uses the One Year War (pre-0084) Side layout with the 0084 three-way reassignment documented; C.E. PLANT at L5, Heliopolis/Artemis at L3 and Mendel at L4; A.D. the Union Amazon tower, HRL Tenchū and AEU La Tour; R.C. the Venus–Moon–Earth energy chain; P.D. Vingolf on the ocean and A.W. Cloud Nine at L3. Distances are compressed and labelled as schematic.
- **Faction roster expanded 57 → 82**, adding Anaheim Electronics, the Sleeves, Delaz Fleet, Buch Concern, Romefeller Foundation, Mariemaia Army, Freeden crew, Dianna Counter, Gingham Corps, Junk Guild, Serpent Tail, Logos, Bisidian, Zalam/Euba, Venus Globe, G-IT Corps, Seven Stars, Turbines, Cathedra, Jeturk, and three A.A. organisations. Every era now has at least five factions.
- **3D era wheel** on the chronology page: twelve glowing rings sized by machine count and ordered by century, click-to-select, auto-rotate, reset, a live detail panel and a 12-column machine distribution chart.
- **Relationship clusters**: a shared radial graph on machine, character, event, faction and glossary pages, with grouped sectors, relation-type colours, a text index and links on every node. Character relations grew from 18 to 97 characters (185 new edges).
- **Archive faction graph**: per-century political map with alliance/hostility/succession/split edges, member counts and era tabs.
- **Glossary index tools**: a category bubble map ("检索导图") sized by machine usage, plus an association tree for the selected term.
- **Tech tree browsing**: search by name/model code, zoom −/+/fit, generation bands, hover-to-focus on direct relations, and all twelve era tabs wrap on desktop.
- **Search upgrade**: indexes pilots, aliases, summaries, details, factions, technologies and works; exact/prefix/token scoring, a Latin fuzzy pass, type weights, URL-synced queries, quick-access entries and era shortcuts.
- **Model detail pass**: added chest seams, cockpit hatch, shoulder verniers, elbow/forearm plates, knee guards, shin vents, ankle actuators, backpack nozzles, head cheek vents and extra panel accents to the procedural viewer.
- **Event roster 51 → 69**: Heliopolis, Spitbreak, Messiah, Fallen Angels, the Dort uprising, Vingolf, Hashmal, Quinharbor, Asticassia, Libra, Sanc Kingdom, Cloud Nine, the Dianna Counter landing, Nora, Sankt Porto and the Shuffle Alliance, plus 20 key events extended with a second factual paragraph (Chinese + Japanese). Event list rows now reserve enough width for full dates.

### Changed

- Navigation, typography, tables and cards now share the cockpit MFD visual language; the old thin-cyan industrial style is retired.
- Timeline event labels reserve edge margins, support left/right anchoring and use 54px rows, eliminating the pile-up at the right edge of dense lanes.
- `.event-row` date columns widened to 106px so dates no longer run into titles.
- Orb corrected from Okinawa to the South Pacific (Solomon Islands); Loum moved to L1 and Solomon to L5 to match the canonical U.C. layout.
- **Frosted floating frame layer**: main screen, map/graph/century stages and the console are mounted in translucent white glass frames with soft halos; MFD rails and console cards are staggered, hover-lifted and the console can hide to free reading space.
- **ZoomFrame / TextZoom**: every map, 3D globe, era wheel and relation graph, plus the tech tree, has −/+/reset/fullscreen; chronology tables have A−/A+ text scaling.
- **3D relation graphs**: every RelationGraph instance can switch 2D/3D, with orbit, auto-rotate, label toggle and click-through nodes.
- **Route audit and CI gates**: `routes:check` validates every sitemap URL; CI and Pages run `links:check` and `routes:check`, and use pnpm 10 for the lockfile-v9 build.
- Version bumped to `3.1.0`; faction count 82; character relation coverage 97/114; search index 487; atlas nodes 156; 854 static pages; event count 69.

### Fixed

- Atlas 2D label collisions, Earth/Moon body-label overlap, and the missing surface inset on the far hemisphere.
- 3D atlas label overlap, camera occlusion of orbital nodes, and the label/legend overlap at the bottom of the globe.
- Character graph group captions now reserve space so node labels do not overprint them.
- Duplicate tag counts in the tech-tree chip row.
- `search?q=` state now updates as the query changes, so results are shareable.

## [2.3.0] — 2026-11-12

### Added

- **41 new characters** (114 total): GAT-X Duel/Buster/Blitz/Calamity/Forbidden/Raider pilots, Leopard/Airmaster/Virsago/Ashtaron pilots, G-UNIT and Gundam X pilots, Blue Destiny/Pale Rider/Penelope/TR-6/Crossbone X-2/Mudrock/F90 pilots, Turn X, Lfrith, Marchosias, Astaroth and Flauros pilots, plus key figures such as Murrue, Mu, Durandal, Dianna, Kihel, Kudelia, Prospera and Woolf.
- **Technical composition panel** on every machine page: power, armor, frame, systems and armament profile generated from controlled tags and specs, with links to the glossary.
- **Human-machine tag** (“人类机器师”): covers psycommu, psychoframe, GUND Format, Alaya-Vijnana, EXAM and biosensor interfaces; applied to 31 machines.
- **Cockpit UI pass**: canopy strip, wide side MFD rails, bottom console, interactive chronology console, timeline era focus and keyboard stepping, per-series tech-tree tabs.
- **Per-era strategic map and faction grouping**: 12 era tabs; U.C. keeps the Earth-sphere map, other eras show faction nodes and events. The archive now groups 51 factions by century.
- **Search and type pass**: search type filters, match highlighting, clear action; base body text raised to 16px (18px in large reading mode).
- **MS lineage completion**: 116 edges (up from 82); every one of the 148 machines now has at least one incoming or outgoing lineage edge.
- **One verified machine and two events**: Lfrith Pre-Production Model (XGF-01), the Fifth Luna drop and Break the World.

### Changed

- Chinese name of Celestial Being corrected from “天上人” to **“天人”** across content, UI and documentation.
- Machine count 147 → 148; event count 49 → 51; tag count 31 → 32; character count 73 → 114; faction count 35 → 51; static pages 628 → 748; search index 377 → 438.
- Version bumped to `2.3.0`.

### Fixed

- Filled pilot links for the remaining named machines; only uncrewed or unnamed test units remain without a pilot.
- Repaired Japanese wording in new lineage notes and character entries.

## [2.2.0] — 2026-11-12

### Changed

- **Editorial pass across all content**: rewrote machine summaries and descriptions, character bios, event explanations and technology entries to remove templated AI-style phrasing. Replaced “不是…而是”, “真正的”, “这台机体”, “故事”, “读者”, “宿命”, “极致”, “见证了” and similar constructions with concrete statements.
- Event explanations are now shorter and follow a background → course → result structure. Technology entries explain mechanism, trade-off and historical role without rhetorical conclusions.
- Character biographies are capped at two paragraphs; the separate service record carries the chronological detail.
- Removed the duplicate “天人武力介入” event; events are now 49.
- Static pages: 628; search index: 377.

### Added

- `docs/EDITORIAL.md`: house style, banned templates, length limits, fact/uncertainty rules and before/after examples.
- `scripts/check-language.mjs` and `npm run language:check`: CI gate for high-frequency AI templates, overlong summaries and paragraphs.
- CI and Pages workflows now run the language check.

### Fixed

- Repaired several machine and character sentences that had become ungrammatical during the editorial rewrite.
- Corrected remaining Chinese characters in Japanese text and a few duplicated event references.
- Corrected the Quetta factory attack participants: Aerial, Lfrith Ur and Lfrith Thorn; Calibarn was not present. Removed Aerial from the Vanadis Incident.
- Corrected Amuro Ray's age in U.C.0079 to 16.
- Removed the duplicate “天人武力介入” event and its stale links.

## [2.1.0] — 2026-11-12

### Added

- **Cockpit HUD**: fixed corner brackets, scanline, pointer-following reticle, live clock/link status, and an inline `HUD` toggle. The HUD is decorative and never blocks pointer input; it is disabled in print and reduced-motion modes.
- **Reading mode**: `A+ / A−` control persists a larger type scale for body copy, cards, dossiers, drawers and tables.
- **Glossary page** at `/[lang]/glossary`: 31 controlled technology tags with long explanations, category filters, search, related machines, 12 reading terms and an era quick-reference.
- **Event dossier pages** at `/[lang]/events/[slug]`: 50 pages with background/course, outcome, participants, machines, characters, sources and previous/next navigation.
- **Character service record**: age, rank/identity, origin, aliases and a chronological line of piloted machines and related events.
- **Explanation depth**: every tag now has a `detail` array; every event has a `detail` array; every character has `age`, `rank` and `origin` fields. Validation rejects missing explanations.

### Changed

- Base body type is 16px; machine summaries, dossier text, event text, character bios, glossary cards and tables are larger and higher-contrast.
- Event drawer now includes the full event explanation and a link to the event dossier.
- Search now indexes technology tags and links events to their dossier pages.
- Static pages: 628; search index: 377; events: 49; tags: 31; characters: 73.
- Version bumped to `2.1.0`.

## [2.0.0] — 2026-11-12

### Added

- **Full 11-era Gundam roster**: 147 machines across U.C. (38), F.C. (12), A.C. (13), A.W. (10), C.C. (2), C.E. (21), A.D. (15), A.G. (9), R.C. (5), P.D. (11) and A.S. (9), plus the two existing A.A. units.
- **Century tables on the chronology page**: an era overview table and a collapsible full-roster table grouped by era; all 147 entries link to their dossier pages.
- **17 side-story works**, including 08th MS Team, Thunderbolt, Missing Link, Blue Destiny, AoZ, Beltorchika's Children, F90, Crossbone, Zeonic Front, Endless Waltz, G-Unit, SEED Astray, SEED C.E.73 Stargazer, 00 the Movie, Urdr Hunt, Witch from Mercury PROLOGUE and Memory of Eden.
- **41 characters** (73 total), covering the Shuffle Alliance, the five Gundam pilots, SEED/DESTINY, 00, AGE, Iron-Blooded Orphans and The Witch from Mercury.
- **60 new lineage edges** (82 total) across all major eras, each with a source.
- **Seven controlled tags**: DRAGOON, Trans-AM, Alaya-Vijnana, GN Field, Hyper Jammer, Mirage Colloid, DG Cell.
- **Six faction groups**: Gundam Fight Nations, DSSD, Innovators, Vanadis Institute, Dawn of Fold, Mafty.
- **Readable documentation**: `docs/CHRONOLOGY.md` (era-by-era guide), `docs/MACHINE_COVERAGE.md` (scope and coverage matrix), a question-based documentation index, and a rewritten README.

### Changed

- Static pages: 528; search index: 347; machines: 147; characters: 73; works: 42; factions: 35; tags: 31.
- The chronology page's “coverage” copy no longer hardcodes counts; it explains scope and points to the coverage document.
- Version bumped to `2.0.0`.

### Notes

- New machines use the same `seed` policy: unknown specs stay `null`, and no official art is bundled.
- A.A. remains a repository-original extension and is kept separate from the 11 canonical eras.

## [1.4.0] — 2026-11-11

### Added

- **Chronology page** at `/zh/chronology/` and `/ja/chronology/`: a human-readable 12-era table with years, canon status, machine/event/work counts and links into each era's timeline.
- **Glossary** (`docs/GLOSSARY.md`): era codes, data fields, engineering terms and reading paths.
- README “5 分钟读懂” and Japanese “5分でわかる” sections.

### Changed

- Header/footer navigation adds 世纪表; sitemap includes the new route.
- Static pages: 240; search index: 185.
- Version bumped to `1.4.0`.

## [1.3.0] — 2026-11-11

### Added

- **A.A. (After Apocalypse)** era, set between the Apocalypse and A.A.45.
- Two A.A. works: *Mobile Suit Gundam RG XARX-ZERO* (TV, 2027) and *GUNDAM ROGUE ORBIT* (game, 2027).
- Two A.A. machines: XARX-0 Gundam Zero and Spiral Gundam.
- One A.A. character (Azumi Rei) and three A.A. events: A.A. Year One, Azumi's awakening, and the Rogue Orbit contact.
- 49 machines, 32 characters, 50 events, 29 factions, 25 works, 24 tags, 22 lineage edges; 238 pages and 185 search entries.

### Changed

- Era count is now 12; all eras have at least two machines and three events, and most have two or more characters (A.A. currently has one: Azumi Rei).
- A.A. uses the same `seed` policy: unknown specs stay null; no official art is bundled.

## [1.2.0] — 2026-11-11

### Added

- **11-era mainline completion**: 47 machines, 31 characters, 47 events, 22 lineage edges.
- Seven machines: Shining, Wing, Gundam X, Airmaster, AGE-2, G-Arcane, G-Lucifer.
- Nineteen characters: Domon, Master Asia, Heero, Zechs, Garrod, Tiffa, Sochie, Athrun, Lacus, Lockon, Tieria, Flit, Asemu, Bellri, Aida, Mikazuki, Orga, Suletta, Miorine.
- Twenty events covering F.C., A.C., A.W., C.C., C.E., A.D., A.G., R.C., P.D. and A.S.; every era now has at least three timeline entries.
- 228 static pages and 175 search entries.

### Changed

- Mobile timeline uses a vertical event list; desktop keeps the local-scale axis.
- Machine filters collapse to two columns at ≤680px, removing the 360px sort-cutoff.
- `DATA_SOURCES.md` documents the Biligame index, legal import workflow and the no-official-art policy.
- “补完” is explicitly scoped to mainline representative content across the 11 named eras, not every variant or side-story unit.

### Known limitations

- Official design images are still not bundled or hotlinked; visuals remain original SVG and procedural LOD-P.
- Parameters and event outcomes remain `seed` until checked against setting-book pages.
- 47 events are a curated mainline set, not the complete event history of every work.

## [1.1.0] — 2026-11-11

### Changed

- **Brand**: unified as **GUNDAM Archive** across the UI, metadata, README, docs, OG image, 404, package description and storage keys.
- Removed the elapsed-time framing from Chinese/Japanese copy; the archive now introduces itself by series and eras.
- Machine library expanded from 12 to **40** mainline Gundam-type machines; added **A.G., R.C., P.D. and A.S.** eras (11 total).
- Tech tree now renders the **U.C. lineage** in the DAG and parks parallel-universe machines in a labelled grid instead of forcing fake cross-universe edges.
- Version bumped to `1.1.0`; footer/About/README synchronised.

### Added

- 28 new machines across U.C., F.C., A.C., A.W., C.E., A.D., A.G., R.C., P.D. and A.S.
- 9 new works, 10 new factions, 4 new eras, 4 new technology tags and 5 new events.
- New machine dossiers with procedural viewer configs, bilingual summaries, armament and source stubs. Missing specs remain `null` and render as “資料未載”.

### Content

- 40 machines · 11 eras · 28 events · 27 factions · 12 characters · 23 works · 15 places · 23 tags · 19 lineage edges.
- 176 static pages; 130 search entries.

### Known limitations

- “All Gundam machines” is scoped to **40 mainline Gundam-type units**, not every variant, game-original or side-story unit. The full catalogue remains a B3/B4 task.
- Most new entries are `seed`: height is recorded where confident, weight/power/thrust/armor remain `null` until verified against setting-book pages.
- 3D models remain procedural LOD-P placeholders; new machines reuse the shared parametric build.

## [1.0.1] — 2026-11-11

### Added

- Explicit `LanguageSwitch` in desktop header, mobile menu and footer. It preserves path, query string, hash and scroll position; the destination page restores scroll via `sessionStorage`.
- First-visit language selection at `/`: stored `gundam-lang` preference, otherwise `navigator.language` (`ja*` → `/ja/`, else `/zh/`).
- Japanese project README (`README.ja.md`) and a documentation index (`docs/README.md`) with authority order and update rules.
- `pnpm docs:check` Markdown link checker, wired into CI.
- Static branded 404 generated by `scripts/build-404.mjs` with basePath-aware links.

### Changed

- README rewritten to remove duplicated field tables/route lists; detailed rules now live in `docs/`.
- Source-coverage wording corrected across site copy and docs: only machines and events currently require `sources`; factions, characters, works, places and tags are anchored to works and will gain `source_refs` in M4.
- 3D loading split: only the R3F stage is lazy-loaded; the viewer shell and controls render immediately. Machine-page initial JS is ~116 kB.
- Version bumped to `1.0.1`; footer/About/README synchronised.
- GitHub Pages deployment and metadata use `cxy2696/GUNDAM-archive` and its `/GUNDAM-archive` base path.

### Fixed

- Mobile header no longer hides the language switch; full labels collapse to `中 / 日`.
- Language links keep `?e=` / `?era=` filters and anchors instead of dropping them.
- Footer language switch accessible labels no longer duplicate screen-reader text.

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
- Only machines and events require `sources`; faction/character/work/place/tag source coverage is a M4 task.
- Visual regression and real-device performance gates are M4 work.

### Security

- Static export; no server runtime, no credentials in the browser.
- External links use `rel="noreferrer"`; no user-generated HTML is rendered.
