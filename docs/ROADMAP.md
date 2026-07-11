# Journey Continuation Roadmap

Last reviewed: 2026-07-11

This roadmap is the durable sequence for growing Progression Atlas after the completed foundation slice. The approved product definition remains `docs/superpowers/specs/2026-07-11-progression-atlas-design.md`; current reality and decisions remain `docs/PROJECT_CONTEXT.md`.

## North star

Support complete, lawful, source-aware progression maps for _Where Winds Meet_ and future games without forking the shell, progress engine, or renderers.

## Current milestone state

| Phase                                 | Status           | Exit evidence                                                              |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| 0. Product and visualization contract | Complete         | Approved concepts, design specification, interactive contract              |
| 1. End-to-end platform slice          | Complete         | Map/Thread/Timeline, progress, URL, persistence, fallback, responsive QA   |
| 2. Repository continuity              | Complete         | `AGENTS.md`, project context, roadmap, session handoff protocol            |
| 3. CI and deployable production       | Recommended next | Clean GitHub checks and repeatable hosted preview                          |
| 4. Content authoring and validation   | Planned          | External packs, source ledger tooling, actionable validation reports       |
| 5. Tile streaming and map scale       | Planned          | Visible-tile loading with bounded memory and Canvas parity                 |
| 6. Large-world interaction scale      | Planned          | Virtualized search/outline and performance budgets on representative packs |
| 7. Lawful world coverage              | Source-gated     | Reviewed regions, threads, POIs, interiors, and provenance                 |
| 8. Player knowledge tools             | Planned          | Local annotations, bookmarks, saved views, export/import                   |
| 9. Multi-game proof                   | Planned          | A second small adapter without shell/renderer forks                        |
| 10. Optional accounts and sync        | Deferred         | Versioned remote sync after local migrations are stable                    |

## Phase 3 — CI and deployable production

Goal: make every push reproducibly prove the same gates used locally and produce a reviewable production artifact.

Deliverables:

- GitHub Actions workflow using the pinned pnpm lockfile;
- lint, typecheck, unit/component, build, and Playwright jobs;
- cached pnpm store and Playwright browser installation;
- uploaded coverage and Playwright reports on failure;
- one documented hosting target with environment and rollback instructions;
- bundle-size reporting that calls out the lazy ELK and Three.js chunks.

Exit criteria:

- a clean clone passes CI without local state;
- pull requests cannot merge with failing required checks;
- production preview uses the built client/SSR output, not the Vite development server;
- deployment does not require secrets in committed files.

Recommended files:

```text
.github/workflows/ci.yml
.github/workflows/preview.yml
docs/OPERATIONS.md
package.json
```

Verification:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:coverage
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

## Phase 4 — Content authoring and validation

Goal: move content scale out of hand-edited application modules while preserving the existing `GameAdapter` contract.

Deliverables:

- versioned JSON content-pack files validated by the existing Zod schema;
- an adapter loader that converts validated packs into immutable runtime data;
- a CLI that validates all registered packs and prints file/record/source context;
- deterministic stable-ID and reference-integrity checks;
- source-ledger completeness, permission, confidence, and verification-date reports;
- migration support for pack schema versions;
- fixture packs for valid, missing-source, duplicate-ID, broken-edge, and invalid-coordinate cases.

Boundary:

```ts
export interface ContentPackRepository {
  listManifests(): Promise<ContentPack['manifest'][]>
  load(gameSlug: string, worldId: string): Promise<ContentPack>
  validate(gameSlug?: string): Promise<ValidationReport>
}
```

Recommended files:

```text
content/<game>/manifest.json
content/<game>/worlds/<world>.json
src/features/atlas/content/content-pack-repository.ts
src/features/atlas/content/content-pack-repository.test.ts
scripts/validate-content-packs.mjs
```

Exit criteria:

- adding a valid pack does not require editing renderers, progress logic, or the shell;
- invalid content never becomes active;
- validation output identifies the exact file and record;
- existing progress survives compatible content-version changes;
- `pnpm content:validate` validates every registered pack.

## Phase 5 — Tile streaming and map scale

Goal: use the generated map pyramid at runtime and keep memory/render cost bounded as worlds grow.

Deliverables:

- a versioned tile manifest emitted by `scripts/build-map-pyramid.mjs`;
- viewport/zoom-to-visible-tile selection derived from the shared coordinate model;
- cancellable tile requests and bounded LRU texture caching;
- parent-level placeholders while higher-resolution tiles load;
- deterministic disposal on viewport, world, layer, and game changes;
- Canvas fallback using the same selected tile set;
- tests for boundaries, zoom transitions, cancellation, cache eviction, and context loss.

Boundary:

```ts
export interface TileSet {
  manifest: TileManifest
  visible(camera: MapCamera, viewport: ViewportSize): TileKey[]
  load(key: TileKey, signal: AbortSignal): Promise<ImageBitmap>
  dispose(): void
}
```

Exit criteria:

- the renderer never downloads the 3840×2160 source when a lower level is sufficient;
- panning and zooming cannot leak textures or duplicate requests;
- Three.js and Canvas select identical tile keys;
- offline mode uses cached validated tiles when available;
- the original normalized content coordinates remain unchanged.

## Phase 6 — Large-world interaction scale

Goal: prove that complete-world packs remain searchable, navigable, and responsive.

Deliverables:

- generated representative fixtures with thousands of steps and discoveries;
- indexed search by title, kind, region, thread, and source confidence;
- TanStack Virtual for long outlines and result lists;
- bounded map labels and zoom-dependent POI clustering;
- worker-backed layout/indexing only where measurements justify it;
- production bundle and runtime performance reports;
- real-device gesture and frame-pacing checks.

Budgets:

- one WebGL context;
- no continuous idle render loop;
- initial application target below 300 kB gzip excluding lazy visualization chunks;
- useful shell target below 2.5 seconds on a cold local production preview;
- ordinary pan/zoom target 60 fps;
- 12,000-mark stress target at least 30 fps;
- selected/rich DOM labels remain bounded.

Exit criteria:

- search and outline operations do not scale DOM nodes linearly with the full pack;
- entering Timeline does not load Three.js;
- entering Map does not load ELK until Thread is requested;
- stress tests report memory, long tasks, renderer count, and frame pacing;
- accessibility actions remain available when visualization detail is clustered.

## Phase 7 — Lawful _Where Winds Meet_ coverage

Goal: replace demonstration-only breadth with reviewed, source-aware coverage while keeping schematic claims explicit.

Source gate for every ingestion batch:

1. the source may be linked or transformed under its permission terms;
2. each fact is manually reviewed and assigned confidence;
3. coordinates state their accuracy and method;
4. conflicting facts remain separate until resolved;
5. screenshots, maps, text, and extracted assets are not copied without permission;
6. the product continues to state that it is unofficial.

Recommended sequence:

1. finish Qinghe main story verification;
2. add Qinghe side threads and contextual discoveries;
3. add interiors and multi-floor surfaces;
4. add the next reviewed region;
5. add cross-region threads and critical moments;
6. repeat only after validation and usability review of the prior batch.

Exit criteria for each batch:

- source ledger passes validation;
- dependency and choice semantics have reviewer evidence;
- coordinates never claim greater accuracy than their source;
- content QA confirms no invented completion of unknown gaps;
- progression migrations preserve existing player state.

## Phase 8 — Player knowledge tools

Goal: let players preserve their own knowledge without weakening source truth.

Deliverables:

- local notes attached to steps, discoveries, and locations;
- bookmarks and named saved views;
- import/export of versioned local progress, choices, notes, and views;
- conflict-safe migrations and explicit destructive-action confirmation;
- clear visual distinction between pack facts and private player annotations.

Boundary:

```ts
export interface PlayerKnowledgeExport {
  version: 1
  exportedAt: string
  games: Record<
    string,
    {
      progress: StoredProgress
      notes: PlayerNote[]
      savedViews: SavedView[]
    }
  >
}
```

Exit criteria:

- export/import round trips without losing choices or provenance boundaries;
- invalid imports are rejected before any write;
- private notes never masquerade as sourced content;
- clearing data requires explicit confirmation and remains game-scoped.

## Phase 9 — Multi-game proof

Goal: prove that multi-game architecture is real by adding a small, lawful second pack.

Selection criteria:

- a map asset can be created or used lawfully;
- the progression sample contains required and optional dependencies;
- the pack is small enough to review completely;
- the game does not require renderer-specific behavior.

Exit criteria:

- only the adapter registry and new content/assets are added;
- shell, routes, progress engine, Map, Thread, Timeline, and fallback remain shared;
- URL and IndexedDB keys remain game-scoped;
- switching games cannot leak selection, progress, filters, or textures.

## Phase 10 — Optional accounts and sync

Status: intentionally deferred.

Accounts begin only after local export/import and migrations are stable. Remote sync must be a versioned repository behind the existing local-first model, not a replacement for it.

Required properties before implementation:

- explicit authentication and privacy design;
- per-record versioning and deterministic conflict policy;
- encryption and deletion semantics;
- offline mutation queue with idempotency;
- account-free use remains fully functional;
- no public comments or moderation scope is bundled into sync.

## Cross-phase release gate

Every completed phase must preserve:

```bash
pnpm content:validate
pnpm map:build --game where-winds-meet
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm test:e2e
git diff --check
```

For visual changes, compare the browser at all three Playwright viewport sizes against the approved concepts and update `docs/qa/progression-atlas-fidelity.md`.

## Roadmap maintenance

- Mark a phase complete only when its exit criteria and evidence exist in the repository.
- Add feature-specific executable plans under `docs/superpowers/plans/` before implementation.
- Record rejected approaches and durable boundary changes in `docs/PROJECT_CONTEXT.md`.
- Do not treat chat summaries as canonical project state.
