# Journey Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the verified Progression Atlas foundation into a deployable, authorable, large-scale, lawful multi-game progression platform without forking its shared shell, state model, or renderers.

**Architecture:** Preserve the existing `GameAdapter` and validated content-pack boundary. React and TanStack own application state, one Three.js scene owns the focal map, D3/ELK own geometry, IndexedDB remains the local-first player store, and Canvas2D remains a failure-only fallback.

**Tech Stack:** TanStack Start, React 19, TypeScript, Vite, TanStack Router/Query/Virtual, Three.js, D3, ELK, Anime.js, IndexedDB, Zod, shadcn/ui, Vitest, Playwright, and Sharp.

## Global Constraints

- Product name is Progression Atlas; repository name is Journey.
- Preserve the map-first hierarchy and synchronized Map, Thread, Timeline, inspector, URL, and progress state.
- Maintain exactly one Three.js scene and WebGL context.
- Never invent missing game facts or imply that schematic coordinates are authoritative.
- Never ingest or republish maps/content without permission and provenance.
- Every phase must retain reduced-motion, keyboard, responsive, offline, and Canvas fallback behavior.
- Write a failing focused test before each behavior change.
- Run the complete cross-phase release gate before marking a phase complete.

---

This is the program-level execution index. `docs/ROADMAP.md` is the canonical milestone ledger and contains deliverables, boundaries, budgets, and exit criteria. Each phase below must be expanded into its own feature-specific implementation plan before source edits begin; that plan must use exact files, interfaces, failing tests, implementation steps, verification commands, and commit checkpoints.

### Task 1: Establish CI and a production deployment target

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/preview.yml`
- Create: `docs/OPERATIONS.md`
- Modify: `package.json`

**Interfaces:**

- Consumes: existing pnpm scripts and Playwright projects.
- Produces: required GitHub checks, production artifacts, failure reports, and documented deploy/rollback commands.

- [ ] Write a CI contract test or workflow validation that proves all referenced package scripts exist.
- [ ] Run the validation against a missing workflow step and observe failure.
- [ ] Implement lockfile install, lint, typecheck, tests, build, and Playwright jobs with pnpm and browser caching.
- [ ] Add artifact upload for coverage and failed Playwright reports.
- [ ] Document one hosting target, environment variables, preview, promotion, and rollback.
- [ ] Run every workflow command from a clean local install.
- [ ] Commit with `build: add continuous verification and deployment`.

### Task 2: Externalize and validate content packs

**Files:**

- Create: `content/where-winds-meet/manifest.json`
- Create: `content/where-winds-meet/worlds/qinghe.json`
- Create: `src/features/atlas/content/content-pack-repository.ts`
- Create: `src/features/atlas/content/content-pack-repository.test.ts`
- Create: `scripts/validate-content-packs.mjs`
- Modify: `src/features/atlas/content/where-winds-meet/adapter.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `ContentPack`, `validateContentPack`, and the existing `GameAdapter`.
- Produces: `ContentPackRepository` with `listManifests`, `load`, and `validate` operations.

- [ ] Write failing repository tests for valid load, duplicate ID, broken reference, missing source, invalid coordinate, and incompatible schema version.
- [ ] Run the focused test and confirm that the repository module is absent.
- [ ] Implement the repository behind the existing adapter without changing renderer consumers.
- [ ] Move the seed pack into versioned JSON while preserving all stable IDs.
- [ ] Implement actionable validation output with file, record ID, and source context.
- [ ] Run content validation, progress migration tests, and the full release gate.
- [ ] Commit with `feat: add versioned content pack repository`.

### Task 3: Stream the generated map pyramid

**Files:**

- Create: `src/features/atlas/map/tiles/tile-set.ts`
- Create: `src/features/atlas/map/tiles/tile-set.test.ts`
- Create: `src/features/atlas/map/three/tile-surface.ts`
- Modify: `scripts/build-map-pyramid.mjs`
- Modify: `src/features/atlas/map/three/scene-controller.ts`
- Modify: `src/features/atlas/map/canvas/canvas-map.ts`

**Interfaces:**

- Consumes: normalized coordinates, camera state, viewport size, and generated raster levels.
- Produces: `TileSet.visible`, cancellable `TileSet.load`, bounded texture cache, and deterministic disposal.

- [ ] Write failing tile-selection tests at every edge, zoom transition, and viewport aspect ratio.
- [ ] Write failing tests for cancellation, deduplication, eviction, and Three/Canvas tile-key parity.
- [ ] Emit a deterministic versioned tile manifest from the map build script.
- [ ] Implement visible-tile selection through the shared coordinate transform.
- [ ] Replace the single Three.js surface with disposable tile planes and parent-level placeholders.
- [ ] Give Canvas fallback the identical selected tile set.
- [ ] Verify network requests, texture disposal, context loss, offline cache, and visual fidelity.
- [ ] Commit with `feat: stream viewport map tiles`.

### Task 4: Prove large-world interaction scale

**Files:**

- Create: `src/features/atlas/test/make-large-pack.ts`
- Create: `src/features/atlas/search/search-index.ts`
- Create: `src/features/atlas/search/search-index.test.ts`
- Modify: `src/features/atlas/components/search-command.tsx`
- Modify: `src/features/atlas/components/navigation-rail.tsx`
- Modify: `tests/e2e/performance.spec.ts`

**Interfaces:**

- Consumes: validated packs, search queries, filters, and semantic result IDs.
- Produces: indexed search, virtualized lists, bounded labels, and recorded performance evidence.

- [ ] Generate deterministic packs large enough to exercise thousands of steps and discoveries.
- [ ] Write failing correctness tests for indexed title, kind, region, thread, and confidence queries.
- [ ] Write failing DOM-bound tests for long result and outline lists.
- [ ] Implement the index and TanStack Virtual integration without changing search result semantics.
- [ ] Measure lazy chunk loading, long tasks, memory, renderer count, and frame pacing.
- [ ] Move work to a worker only when the measurements identify a main-thread budget violation.
- [ ] Run keyboard and screen-reader checks against virtualized content.
- [ ] Commit with `perf: scale atlas search and navigation`.

### Task 5: Expand lawful Where Winds Meet coverage

**Files:**

- Create or modify only reviewed files under `content/where-winds-meet/` and `public/games/where-winds-meet/`.
- Modify: source-ledger and content-validation fixtures for each ingestion batch.
- Test: adapter, schema, progression, and migration tests covering the reviewed batch.

**Interfaces:**

- Consumes: source records that pass permission, attribution, confidence, and verification gates.
- Produces: additional regions, surfaces, threads, steps, locations, discoveries, rewards, and reviewed map assets.

- [ ] Select one bounded ingestion batch in the sequence documented in `docs/ROADMAP.md`.
- [ ] Record permission and provenance before adding a factual record or asset.
- [ ] Write failing content tests for expected IDs, dependencies, choices, coordinates, and sources.
- [ ] Add only facts supported by the reviewed source; leave unknown gaps unknown.
- [ ] Run migrations against saved progress from the prior content version.
- [ ] Run content validation, browser trace workflows, and a manual provenance review.
- [ ] Commit one reviewed batch with a scope-specific `content:` message.

### Task 6: Add local player knowledge tools

**Files:**

- Create: `src/features/atlas/knowledge/player-knowledge-repository.ts`
- Create: `src/features/atlas/knowledge/player-knowledge-repository.test.ts`
- Create: `src/features/atlas/knowledge/import-export.ts`
- Create: `src/features/atlas/knowledge/import-export.test.ts`
- Modify: `src/features/atlas/components/story-inspector.tsx`
- Modify: `src/features/atlas/components/top-command-bar.tsx`

**Interfaces:**

- Consumes: game-scoped stable entity IDs and IndexedDB.
- Produces: private notes, bookmarks, named views, and versioned import/export separate from sourced pack facts.

- [ ] Write failing repository and export round-trip tests, including invalid and incompatible imports.
- [ ] Implement game-scoped notes and bookmarks with versioned migrations.
- [ ] Render player-authored content with a distinct private annotation label.
- [ ] Add saved views without importing or overwriting progress from ordinary shared URLs.
- [ ] Require explicit confirmation for destructive import, replacement, and clear actions.
- [ ] Run persistence, accessibility, URL, and offline browser workflows.
- [ ] Commit with `feat: add local player knowledge tools`.

### Task 7: Prove the second-game boundary

**Files:**

- Create: `content/second-game-proof/`
- Create: `src/features/atlas/content/second-game-proof/adapter.ts`
- Create: `src/features/atlas/content/second-game-proof/adapter.test.ts`
- Modify: `src/features/atlas/content/register-games.ts`

**Interfaces:**

- Consumes: the unchanged `GameAdapter`, content schema, progress engine, routes, and renderers.
- Produces: a second fully reviewed, small game option with isolated URL, progress, selection, and renderer resources.

- [ ] Choose a game only when its map and sample progression can be used lawfully and reviewed completely.
- [ ] Write the adapter contract test before registering the game.
- [ ] Add the pack and original/licensed map assets without game-specific shell branches.
- [ ] Add browser coverage for switching games and proving state/resource isolation.
- [ ] Reject the implementation if it requires a renderer or shell fork; extend a shared capability instead.
- [ ] Run the complete release gate for both games.
- [ ] Commit with `feat: add second game adapter`.

### Task 8: Evaluate accounts and remote sync

**Files:**

- Create a separate approved specification before implementation.
- Keep any future remote repository behind the existing local-first interfaces.

**Interfaces:**

- Consumes: stable local export/import, versioned migrations, and explicit privacy/security decisions.
- Produces: optional authenticated sync that does not reduce account-free functionality.

- [ ] Confirm that Phase 8 local export/import is complete and migration-tested.
- [ ] Write and approve authentication, privacy, encryption, deletion, conflict, and offline-queue specifications.
- [ ] Threat-model account takeover, authorization boundaries, replay, conflict loss, and deletion.
- [ ] Implement sync only after the specification and threat model are approved.
- [ ] Preserve local-only use as a fully functional mode.
- [ ] Run security, migration, offline, and conflict verification before release.

## Completion gate

The program reaches its full objective when complete-world coverage and a second game use the same validated data boundary, progress engine, URL model, shell, and renderers; large packs remain responsive and accessible; every factual record has lawful provenance; and optional sync does not compromise local-first use.
