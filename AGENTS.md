# Journey repository guidance

This file is the durable entry point for Codex and other agentic contributors working in this repository.

## Read first

Before changing code, read these files in order:

1. `docs/PROJECT_CONTEXT.md` — product goal, current implementation, architecture, decisions, and limitations.
2. `docs/ROADMAP.md` — completed foundation, recommended next phases, gates, and exit criteria.
3. `docs/Progression Atlas Design Specification.md` — approved product and visual specification.
4. `docs/qa/advanced-interactive-contract.md` — renderer, state, accessibility, and performance contracts.
5. The relevant source and tests for the subsystem being changed.

The original detailed implementation plan is retained at `docs/Progression Atlas Implementation Plan.md`. It describes how the completed foundation was built; do not treat its unchecked boxes as unfinished work.

## Identity

- Repository name: **Journey**
- Product name: **Progression Atlas**
- Canonical checkout: `~/personal/journey`
- GitHub: `https://github.com/adriandarian/journey`
- Default branch: `main`
- Git identity: `Adrian Darian <adrian.the.hactus@gmail.com>`

Do not rename the product to Journey without explicit product approval. Journey is the repository name; Progression Atlas is the user-facing platform.

## North-star goal

Build a multi-game, local-first progression companion that shows how quests, storylines, lore, secrets, loot, world events, choices, and critical moments connect across a world map. It must explain **what came before, what is available now, what unlocks next, where the journey goes, and why**, rather than merely placing disconnected markers.

The first supported game is _Where Winds Meet_. The current Qinghe content is deliberately original and schematic. It proves the platform architecture; it is not an authoritative walkthrough.

## Current status

The first complete vertical slice is implemented and verified:

- Map, Thread, and Timeline modes share one trace model and selection.
- Three.js renders the focal map with D3-derived route geometry.
- ELK lays out dependency graphs.
- Canvas2D is a failure-only map fallback.
- TanStack Router owns shareable workspace state.
- IndexedDB and TanStack Query own local progress and cached data.
- Desktop, portrait, and landscape layouts match the approved composition.
- Content, progression, URL recovery, accessibility, fallback, and performance tests exist.

The next recommended work is platform hardening and lawful content scale, not a redesign of the completed slice.

## Non-negotiable product rules

- Preserve the map-first evidence hierarchy.
- Preserve Map, Thread, Timeline, and Trace Mode synchronization.
- Never represent schematic coordinates as surveyed or authoritative.
- Never invent missing game facts to make a graph look complete.
- Never scrape or republish official or third-party maps without explicit permission.
- Every factual content record must retain source, confidence, verification date, permission, and content version.
- Required, optional, exclusive-choice, rejoin, completed, available, locked, and excluded states must remain semantically distinct without relying on color alone.
- The map must remain visible on mobile.
- Reduced motion and Canvas fallback must preserve meaning and operability.
- Maintain exactly one Three.js scene and one WebGL context.
- D3 computes geometry; it does not own React or renderer lifecycle.
- React owns controls, URL state, selection, accessibility, and persistence affordances—not Three.js objects.

Changing the reading path, color meaning, branch semantics, provenance visibility, major panel proportions, or mobile map-first rule requires explicit design approval.

## Source ownership map

| Concern                       | Canonical files                                                   |
| ----------------------------- | ----------------------------------------------------------------- |
| Content schema and validation | `src/features/atlas/model/schema.ts`, `validate-content-pack.ts`  |
| Game extension boundary       | `src/features/atlas/content/game-adapter.ts`, `register-games.ts` |
| Where Winds Meet seed content | `src/features/atlas/content/where-winds-meet/`                    |
| Progression rules             | `src/features/atlas/progress/progress-engine.ts`                  |
| Durable progress/preferences  | `src/features/atlas/progress/`                                    |
| URL state                     | `src/features/atlas/routing/workspace-search.ts`                  |
| Shared selection              | `src/features/atlas/state/atlas-selection.tsx`                    |
| Trace model                   | `src/features/atlas/map/trace-model.ts`                           |
| Three.js lifecycle            | `src/features/atlas/map/three/scene-controller.ts`                |
| Coordinate transforms         | `src/features/atlas/model/coordinates.ts`                         |
| Thread and Timeline           | `src/features/atlas/thread/`, `src/features/atlas/timeline/`      |
| Responsive application shell  | `src/features/atlas/components/`, `src/styles.css`                |
| Browser contracts             | `tests/e2e/`, `playwright.config.ts`                              |

## Working protocol

1. Start with `git status -sb` and inspect the current branch and changes.
2. Keep user changes; never discard or rewrite unrelated work.
3. For behavior changes, write a failing focused test first.
4. Make the smallest coherent implementation.
5. Run the focused test, then `pnpm check`.
6. Run `pnpm test:e2e` for renderer, responsive, URL, persistence, accessibility, or workflow changes.
7. Run `pnpm content:validate` and `pnpm map:build --game where-winds-meet` for content or map-asset changes.
8. Update `docs/PROJECT_CONTEXT.md` when architecture, durable decisions, or current capability changes.
9. Update `docs/ROADMAP.md` when a milestone is completed, reordered, or rejected.
10. Commit with the repository identity above. Never rewrite published history without explicit approval.

## Verification commands

```bash
pnpm install --frozen-lockfile
pnpm content:validate
pnpm map:build --game where-winds-meet
pnpm check
pnpm test:coverage
pnpm test:e2e
git diff --check
git status -sb
```

`pnpm check` is the normal local gate. The complete command set is required for release claims.

## Documentation discipline

- Keep this file short and durable.
- Put architectural context and decisions in `docs/PROJECT_CONTEXT.md`.
- Put sequencing and milestone status in `docs/ROADMAP.md`.
- Put feature-specific executable plans in `docs/superpowers/plans/`.
- Use `docs/SESSION_HANDOFF.md` as the copyable handoff template at the end of a long session.
- Do not record secrets, tokens, private URLs, or unverifiable game facts.
