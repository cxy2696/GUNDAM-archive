# Documentation index (English)

[中文](README.md) ｜ [English](README.en.md) ｜ [Project README](../README.en.md)

> This is the English entry point for the documentation. The **Chinese documents are canonical**; English pages summarize the map, authority order and maintenance rules, and link to the canonical detail. Release: v3.1.3 · 2026-11-12.

## 1. Authority order

When documents disagree, trust:

1. `src/lib/schema.ts` — data shape and build-time validation;
2. [DATA_DICTIONARY](DATA_DICTIONARY.md) — fields, enums, units, Atlas (Chinese);
3. [ARCHITECTURE](ARCHITECTURE.md) — layers, data flow, deployment (Chinese);
4. [OPERATIONS](OPERATIONS.md) — release, rollback, monitoring (Chinese);
5. [README.en](../README.en.md) and this index — English overview.

Documentation that contradicts code is a documentation bug.

## 2. Where to start

| Goal | Read |
| --- | --- |
| Understand the project | [README.en](../README.en.md) |
| Run, build and publish | [OPERATIONS](OPERATIONS.md) |
| Add a machine/event/character/faction | [CONTENT_GUIDE](CONTENT_GUIDE.md) |
| Look up a field or enum | [DATA_DICTIONARY](DATA_DICTIONARY.md) |
| Understand the UI system | [DESIGN_SYSTEM](DESIGN_SYSTEM.md) |
| Check coverage boundaries | [MACHINE_COVERAGE](MACHINE_COVERAGE.md) |
| See what is planned | [ROADMAP](ROADMAP.md) / [CHANGELOG](../CHANGELOG.md) |
| Source and copyright rules | [GOVERNANCE](GOVERNANCE.md) / [DATA_SOURCES](DATA_SOURCES.md) |
| 3D asset contract | [ASSET_PIPELINE](ASSET_PIPELINE.md) |

## 3. Maintenance rules

- Fields and enums live only in DATA_DICTIONARY; other docs link there.
- Routes and page responsibilities live in ARCHITECTURE; README only lists entry points.
- Published details live in CHANGELOG; ROADMAP keeps the current release and next steps.
- Every content change must sync the README/README.ja count snapshot, CHRONOLOGY and MACHINE_COVERAGE where applicable.
- Run `pnpm check` before a PR. It runs content validation, documentation checks, typecheck, language check, build, link audit and route audit.

`docs:check` verifies required documents, package version, canonical content counts, duplicate README headings and local Markdown links. `links:check` and `routes:check` run after the static build.

## 4. English coverage

The English edition currently covers:

- this documentation index;
- the full project README;
- GitHub repository description and topics.

Detailed field tables and operational procedures remain Chinese-first to avoid a second, drifting copy. If you need an English translation of a specific page, open an issue with the page and use case.
