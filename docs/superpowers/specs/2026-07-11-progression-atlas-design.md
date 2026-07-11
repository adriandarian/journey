# Progression Atlas Design Specification

Status: Approved visual direction; written specification pending user review  
Approval note: User replied "approved" on 2026-07-11  
Project root: `/Users/dariana/Documents/Codex/2026-07-11/do-y`  

## Approved concept set

- Desktop, 1568 x 1003: `assets/progression-atlas-desktop.png`
- Mobile portrait, 864 x 1821: `assets/progression-atlas-mobile-portrait.png`
- Mobile landscape, 1881 x 836: `assets/progression-atlas-mobile-landscape.png`

These images are binding references for composition, hierarchy, color roles, container model, responsive behavior, and interaction staging. They are not production map assets. Their illustrated geography and sample content are intentionally schematic.

## 1. Product definition

Progression Atlas is a multi-game companion platform for understanding and tracking how an open-world game unfolds across space, narrative dependencies, and time. The first supported game is *Where Winds Meet*.

Traditional game maps answer “where is this item?” Progression Atlas answers:

- What happened before this point?
- What becomes available next?
- Which location does each quest step use?
- Where does a storyline branch, lock, or rejoin?
- Which lore, secret, reward, world event, and critical moment is relevant at this stage?
- What route should a player follow to experience a chosen thread coherently?

The primary artifact is an operational progression workspace, not a dashboard, wiki page, or playable game.

## 2. Evidence lock

### Core claim

A player can select a storyline and see its progression traced through the world as an ordered, branching, stateful journey rather than as disconnected markers.

### Required evidence

- A persistent spatial route across the map.
- Ordered quest-step nodes attached to locations.
- Required, optional, exclusive-choice, unlock, and rejoin relationships.
- Completed, current, available, locked, missed, and unknown states.
- Nearby discoveries contextualized by progression stage.
- A synchronized map, dependency graph, timeline, navigation outline, and inspector.
- Source and verification metadata for every factual content record.

### Truth invariants

- Spatial coordinates never imply greater accuracy than the source supports.
- A route segment is schematic unless its geometry has been manually verified.
- Required and optional dependencies are visually and semantically distinct.
- A choice branch must never look like an ordinary required continuation.
- Progress state cannot silently mark mutually exclusive content as completed.
- Unknown content remains unknown; it is not filled with invented game data.
- No official or community map is scraped, copied, reverse engineered, or republished without explicit permission.

## 3. Scope

### First complete product slice

The first implementation is a polished, end-to-end slice that uses the final multi-game architecture:

- Multi-game application shell with *Where Winds Meet* selected.
- One original schematic region map packaged as a tile-ready content asset.
- One representative 20-step main storyline.
- At least one optional branch, one mutually exclusive choice, one locked step, and one later rejoin.
- Nearby lore, secrets, loot, and world events linked to relevant steps.
- Functional Map, Thread, and Timeline modes.
- Functional Trace Mode with step navigation.
- Search, filters, selection, zoom, reset, and shareable URL state.
- Local progress and preferences that survive reloads.
- A typed content-pack format and validation pipeline that can ingest additional regions without application-code changes.
- Desktop, mobile portrait, and mobile landscape layouts matching the approved concepts.

This slice is not a reduced alternate end state. It is the first populated content pack for the full platform architecture.

### Full objective

The architecture must support the complete *Where Winds Meet* world, multiple floors and interiors, thousands of points of interest, many narrative threads, and additional games. Reaching complete game coverage is primarily a lawful content-authoring and verification effort after the platform exists.

### Non-goals for the first slice

- Scraping official or third-party maps.
- Claiming complete or authoritative game coverage.
- Live synchronization with the game client.
- User accounts, public comments, moderation, or social feeds.
- A general-purpose content-management UI.
- Decorative 3D, ambient particles, or motion with no data meaning.
- A Gantt chart; quest relationships are dependencies and narrative order, not a work schedule.
- Recreating combat or any playable portion of *Where Winds Meet*.

## 4. Platform architecture

### Framework

- TanStack Start, React, TypeScript, and Vite form the application and server boundary.
- TanStack Router owns typed routes and validated search parameters.
- TanStack Query owns asynchronous content loading, cache state, and offline-first fetch behavior.
- TanStack Virtual owns long lists when the content pack grows beyond the first slice.
- shadcn/ui supplies accessible source-owned primitives for commands, drawers, sheets, filters, scrolling, progress, and dialogs.

TanStack Start is currently a release candidate. The project will pin exact package versions, avoid experimental React Server Components, and isolate framework-specific server code behind small repository modules.

### Application boundaries

```text
app shell / routes / URL state       React + TanStack Router
remote and local async data          TanStack Query
small transient UI state             React component state
durable player progress              IndexedDB repository
map camera and visible geometry      narrow visualization store
primary map rendering                Three.js client-only scene
route and graph geometry             D3 modules + ELK layout
labels, inspector, controls          DOM / shadcn
fallback map and export              Canvas2D
DOM and SVG choreography             Anime.js
```

React owns structure, responsive layout, controls, selection, and persistence affordances. Renderer objects never become application state.

### Multi-game extension boundary

Each game is a content pack loaded through one `GameAdapter` contract:

```ts
interface GameAdapter {
  manifest: GameManifest
  loadWorld(worldId: string): Promise<WorldPackage>
  loadNarrativeIndex(): Promise<NarrativeIndex>
  search(query: SearchQuery): Promise<SearchResult[]>
  validate(): Promise<ValidationReport>
}
```

Adding a game supplies a manifest, content records, map assets, source ledger, visual theme overrides, and optional feature capabilities. It does not fork the application shell or renderers.

## 5. Core data model

All persisted records use stable opaque IDs. Display labels are never used as relationship keys.

### Content entities

- `GameManifest`: game identity, adapter version, content version, capabilities, theme tokens, attribution, and disclaimer.
- `World`: top-level playable world.
- `MapSurface`: bounds, source coordinate system, tile pyramid, original asset dimensions, floors, and transform metadata.
- `Region`: named spatial grouping with polygon or approximate bounds.
- `MapLayer`: surface, underground floor, interior, dream state, or other mutually selectable layer.
- `Location`: stable point or area used by narrative and discovery records.
- `NarrativeThread`: main story, side story, wandering tale, character arc, faction arc, or world-event arc.
- `Quest`: a named playable unit within a narrative thread.
- `QuestStep`: the smallest trackable progression moment; it may reference a location, reward, lore entry, or trigger.
- `DependencyEdge`: directed relationship between steps.
- `RouteSegment`: spatial path associated with a dependency edge or ordered step transition.
- `Discovery`: lore, secret, loot, puzzle, boss, merchant, abode, event, or other contextual object.
- `Reward`: item, currency, ability, unlock, reputation, or narrative outcome.
- `SourceRecord`: provenance and verification evidence for any factual record.

### Dependency kinds

- `required`: target is unavailable until the source is completed.
- `optional`: source enriches or modifies the target but does not block it.
- `choice`: taking one outgoing branch may exclude another.
- `unlocks`: source reveals content without imposing narrative order.
- `rejoins`: branches converge at the same later step.
- `context`: discovery or lore is relevant to a step without being a dependency.

Required progression edges must form a directed acyclic graph. Recurring world events are modeled separately and may repeat.

### Player state

- `unseen`
- `discovered`
- `available`
- `current`
- `completed`
- `locked`
- `missed`
- `excluded`

Progress stores the chosen branch separately from completion so the system can explain why alternate content is unavailable.

### Provenance

Every factual record must carry:

- source type: manually observed, user-authored, licensed, public official reference, or inferred
- source reference or note
- contributor
- verification date
- confidence: exact, approximate, schematic, or unverified
- permission or license status
- content version

The UI exposes source confidence when a location or dependency is approximate.

## 6. Coordinate and renderer contract

### Coordinate system

The first content pack uses source-image pixel coordinates normalized to `[0, 1]` on both axes. Each map surface owns the reversible transform between:

- normalized content coordinates
- source-image pixels
- Three.js world units
- screen pixels
- Canvas2D fallback pixels

All markers, routes, labels, hit tests, and exports derive from the same transform. No renderer keeps a private coordinate interpretation.

### Primary renderer

One Three.js WebGL scene owns the focal map viewport.

- Orthographic camera by default.
- Tiled textured planes for the map substrate.
- `InstancedMesh` or instanced buffer attributes for repeated POI symbols.
- `BufferGeometry` for route paths and branch segments.
- GPU picking or a spatial index plus nearest-screen-mark selection for dense content.
- DOM overlays only for selected labels, rich annotation, controls, and inspector content.
- On-demand rendering while idle; continuous frames only during interaction or playback.
- One WebGL context on the page.

Depth is initially used only for meaningful layering, focus, and optional terrain relief. The interface must remain readable as a flat orthographic map.

### D3 and ELK responsibilities

- D3 scales, curves, route interpolation, extent calculations, and SVG export geometry.
- ELK layered layout for the Thread dependency graph.
- D3/SVG for direct labels, annotations, timeline geometry, and the printable/static companion view.
- React owns the surrounding structure and selected-state synchronization.

### Canvas2D fallback

Canvas2D appears only if WebGL is unavailable, context creation fails, or the context is repeatedly lost. It renders the same map, route, state symbols, selection, and labels from the shared coordinate model. It is never mounted as a duplicate focal renderer while Three.js is active.

### Performance target

- One visible scene.
- Design target: 12,000 POIs and hundreds of route segments across a full content pack.
- Initial visible marks are culled by viewport and filters.
- Mark clustering or aggregation applies at low zoom.
- Labels use priority rules and collision avoidance rather than rendering all names.
- Spatial index supports selection and nearest-item step-through.
- Device pixel ratio capped at 2 on desktop and 1.5 on mobile by default.
- Hidden, offscreen, background-tab, and reduced-motion animation loops pause.
- Heavy visualization modules are dynamically imported at the map route boundary.

## 7. Product modes

### Map

The spatial journey is primary. Selecting a narrative thread reveals:

- the main route in jade
- completed and current nodes
- future and locked nodes
- vermilion decision branches
- contextual discoveries filtered to the selected progression window
- ordered step navigation and inspector details

### Thread

A layered dependency graph explains prerequisites, branches, exclusion, and rejoin points. The default direction is top-to-bottom on narrow layouts and left-to-right on wide layouts. ELK uses real node dimensions, explicit ports, stable ordering, orthogonal or restrained polyline routing, and deterministic layout seeds.

Selecting a graph node updates the map camera, timeline position, outline, URL, and inspector.

### Timeline

The timeline shows narrative order and critical moments, not calendar duration. It uses a horizontally scrollable sequence on large screens and a stepped vertical sequence on portrait. Branches remain visually attached to their decision point. Exact time is displayed only when supported by source data.

## 8. Trace Mode

Trace Mode is the defining workflow.

1. The player selects a narrative thread or quest.
2. The map fits the relevant route and highlights the first incomplete available step.
3. The route displays completed-to-current-to-future progression.
4. Selecting Previous or Next moves the committed selection.
5. The camera focuses the selected step and the inspector explains location, prerequisites, rewards, linked discoveries, and source confidence.
6. Choice nodes show their consequences before the player commits local progress.
7. Marking a step complete recomputes downstream availability and the visible route.
8. Switching Map, Thread, or Timeline preserves the same selection and progress window.
9. Copy Link serializes the meaningful workspace state.

### Motion

The motion verbs are reveal, focus, and progress.

- Route reveal: 600–900 ms.
- Camera focus: 700–1000 ms with predictable easing.
- Selection emphasis: 150–220 ms.
- Progress state transition: 250–400 ms.
- No ambient loop is required.
- `prefers-reduced-motion` replaces camera travel and route drawing with immediate stable states.

Anime.js owns DOM and SVG choreography. Three.js owns its render clock and camera interpolation through a narrow `TracePlaybackController`; two independent animation loops must not compete for the scene.

## 9. URL, persistence, and offline behavior

### URL-backed state

- game slug
- world and layer
- region
- mode: map, thread, or timeline
- narrative thread
- selected quest step or discovery
- committed filters
- camera center and zoom at coarse shareable precision
- optional saved-view ID in a later remote-backed release

Transient hover, drag progress, open animation frame, and uncommitted panel edits stay out of the URL.

High-frequency camera updates use replacement navigation. Committed selection, applied filters, and drill-down steps create meaningful history entries.

### Storage tiers

- `localStorage`: color preference, motion preference, label density, last game, and compact UI preferences only.
- `IndexedDB`: player progress, selected choices, annotations, cached content packs, and offline search index.
- TanStack Query persisted cache: versioned network responses and stale-while-revalidate content.
- Remote storage: deferred until accounts and synchronization are in scope.

Incoming valid URL state overrides local view defaults. Player progress is never overwritten by a link unless the user explicitly imports shared progress.

### Offline and stale state

- Keep the last valid map and content visible.
- Label cached, stale, partial, and offline states distinctly.
- Never blank the map during reconnect.
- Content-pack version mismatches prompt a safe refresh while preserving player progress.
- Invalid or obsolete URL entities fall back to the nearest valid parent view and show a concise recovery message.

## 10. Responsive composition

### Desktop

- Compact top command bar.
- Left navigation and filter rail.
- Dominant central map viewport.
- Right selected-story inspector.
- Rails use dividers and bands rather than nested cards.
- The map remains the strongest visual region.

### Mobile portrait

- Map visible on first load and occupying the majority of the initial screen.
- Compact game/region and utility bar.
- Persistent trace summary.
- Inspector, filters, and outline use bottom sheets.
- Applying or closing a sheet restores focus to the affected map control or selected node.
- Previous and Next provide an alternative to precision tapping.

### Mobile landscape

- Map remains dominant.
- Compact right inspector drawer.
- Two-handed pinch/zoom is supported.
- Deliberate empty-map tap may collapse the inspector; map drag never clears selection.
- Left filters collapse before the map is allowed to shrink below useful width.

### Gesture policy

- Pointer Events unify mouse, pen, and touch.
- Primary touch targets are 44–48 CSS pixels where space permits.
- Small map symbols receive enlarged invisible hit regions.
- One-finger page scroll remains available outside the dedicated full-screen map route.
- The map uses explicit zoom controls and two-finger pinch on mobile.
- Reset View and Focus Selected are always discoverable.

## 11. Visual system

### Color roles

- App background: near-black midnight ink.
- Rails and inspector: deep blue-black surfaces.
- Map: original grayscale ink-and-parchment substrate.
- Primary path and completed/current state: celadon jade.
- Choice and critical branch: restrained vermilion.
- Main text: warm ivory.
- Secondary text: cool gray-green.
- Dividers and inactive geometry: muted brass-gray.
- Locked state: neutral gray with a lock symbol and text label.

Color is redundant with line style, symbol shape, labels, and state text. Jade and vermilion never carry meaning alone.

### Typography

- Editorial serif for platform/game/story titles.
- Highly legible modern sans-serif for navigation, controls, metadata, and map labels.
- Controls use explicit sizes and weights; no browser-default typography.
- Long labels truncate only where a full value is available in focus/selection state.

### Container model

- Rails, dividers, map canvas, lists, sheets, and drawers.
- Minimal shadows.
- Small 4–10 px radii.
- No bento grid, floating glass cards, decorative badges, marketing hero, or equal-weight dashboard tiles.

### Icons

Required metaphors include search, game selector, region/location, layers, filters, map, thread, timeline, zoom in, zoom out, reset/focus, previous, next, completed, current, locked, choice, secret, lore, treasure, event, and source confidence.

The project will use the shadcn-configured icon family where it matches the approved concept. Any custom route-state symbols use crisp SVG with consistent optical weight and `currentColor`.

## 12. Component inventory

- `AppShell`
- `TopCommandBar`
- `GameSelector`
- `ModeNavigation`
- `SearchCommand`
- `WorkspaceStatus`
- `NavigationRail`
- `RegionSelector`
- `StorylineOutline`
- `LayerFilters`
- `ProgressSummary`
- `MapViewport`
- `MapControls`
- `MapDomOverlay`
- `TraceRouteLayer`
- `PoiLayer`
- `ThreadGraph`
- `NarrativeTimeline`
- `StoryInspector`
- `StepList`
- `StepNavigator`
- `SourceConfidence`
- `MobileCommandBar`
- `MobileInspectorSheet`
- `OfflineStatus`
- `WebGLFallbackNotice`

The root route and `App` remain composition glue. Data adapters, validation, rendering, persistence, and URL codecs live in focused modules.

## 13. Functional states and errors

- Initial content loading uses a reserved map frame and restrained skeletons.
- Empty search and filter results preserve the map and provide a reset action.
- Missing coordinates show the narrative step in Thread and Timeline modes without inventing a map location.
- Broken map tiles retain loaded neighbors and identify the missing region.
- WebGL context loss pauses interaction, attempts one controlled restoration, then activates Canvas fallback.
- Invalid dependency cycles fail content validation before release.
- Missing prerequisite references fail validation with record IDs and source locations.
- IndexedDB failure falls back to an in-memory session with a visible persistence warning.
- Content update conflicts preserve local progress and require an explicit reconciliation path.

## 14. Accessibility

- All essential state is visible without hover.
- Keyboard users can select Map, Thread, and Timeline; move Previous/Next; open the inspector; toggle filters; zoom; reset; and copy a link.
- The selected route has a synchronized DOM outline and ordered textual equivalent.
- Thread mode has a hierarchical list fallback.
- Timeline mode has an ordered list fallback.
- Map markers use accessible selected-item summaries rather than thousands of tab stops.
- Screen-reader announcements describe selection, current step, lock reason, and progress changes.
- Contrast meets WCAG expectations for text and controls.
- Choice, completion, and lock states use text and shape in addition to color.
- Reduced-motion mode is complete, not merely slower.

## 15. Testing and release gates

### Data and unit tests

- Content-pack schema validation.
- Stable ID and reference integrity.
- Required-edge DAG validation.
- Choice exclusion and rejoin behavior.
- Progress transition rules.
- Coordinate round trips across content, Three.js, screen, and Canvas frames.
- URL codec validation and invalid-state recovery.
- Content/version migration and IndexedDB persistence.
- Source-ledger completeness.

### Component and integration tests

- React owns structure while renderers receive immutable data versions.
- Search, filter, outline, map selection, URL, and inspector stay synchronized.
- Mode switching preserves selection.
- Completing a step unlocks only valid downstream steps.
- Applying and closing mobile sheets restores focus and map visibility.
- Reduced-motion behavior renders final stable states.

### Browser and visual tests

- Desktop screenshot at 1568 x 1003.
- Portrait screenshot at 864 x 1821, plus practical 360–430 px CSS-width checks.
- Landscape screenshot at 1881 x 836.
- Nonblank WebGL pixel and render-ready checks.
- Canvas fallback screenshot.
- Pan, zoom, drag, pinch, reset, focus, keyboard, and Escape smoke tests.
- Deliberate empty click versus drag behavior.
- Offline, stale, invalid URL, and storage-failure states.
- Concept-to-browser fidelity ledger covering layout, copy, typography, palette, map treatment, route geometry, controls, icons, and responsive behavior.
- Above-the-fold copy diff against the approved copy inventory.

## 16. Source and legal posture

- The application is an independent, unofficial companion and must say so clearly.
- The first map asset is original and schematic.
- Factual records are manually authored with provenance.
- Official pages may be linked and cited as references but are not scraped or republished.
- Community submissions require permission and attribution terms before ingestion.
- A licensed or official data source can replace the content adapter later without changing the app architecture.

## 17. Library-name assumptions

The request’s `p3.js` is treated as `p5.js`, and `anima.js` is treated as Anime.js.

- Anime.js is part of the approved implementation for restrained DOM/SVG choreography.
- p5.js is not part of the primary renderer because it would duplicate Three.js and Canvas responsibilities. If later used, it must own a discrete experimental or generative module with a clear analytical purpose and no shared map lifecycle.

## 18. Approved deviations and flexible elements

### Approved or meaning-preserving deviations

- The platform receives a neutral multi-game identity; *Where Winds Meet* is the selected game rather than the permanent platform brand.
- The concept’s profile/account affordance is omitted until accounts are functional. No inert controls ship.
- Sample geography and quest names remain clearly illustrative until lawful verified data is supplied.

### Locked elements

- Map-first evidence hierarchy.
- Desktop tri-pane composition.
- Portrait map plus inspector sheet.
- Landscape map plus compact inspector.
- Map, Thread, and Timeline modes.
- Jade primary route, vermilion branch, neutral locked path.
- Code-native labels, controls, values, and source notes.
- Trace Mode’s selection and progress staging.
- Original map asset and lawful provenance policy.
- Reduced-motion and Canvas fallback behavior.

### Flexible elements

- Exact pixel spacing and breakpoint values.
- Final font files and fallbacks.
- Minor icon geometry.
- Renderer-internal tessellation and tile size.
- Minor map crop changes required to preserve the selected route at different aspect ratios.

Any change to the reading path, color meaning, major panel proportions, branch semantics, source visibility, or mobile map-first rule requires explicit design review.

## 19. Completion definition

The objective is complete only when the current repository and rendered app prove all of the following:

- A real multi-game-capable platform runs with *Where Winds Meet* selected.
- Map, Thread, and Timeline are functional and synchronized.
- Trace Mode reveals ordered spatial progression, dependencies, branches, locks, nearby discoveries, and player progress.
- The content-pack architecture can accept additional regions and games without renderer or shell forks.
- The responsive UI matches the approved desktop, portrait, and landscape concepts.
- URL sharing, local persistence, offline behavior, accessibility fallbacks, reduced motion, and Canvas fallback work.
- Tests and browser verification cover the actual requirements above.
- Factual content has lawful provenance and the product does not claim unsupported completeness.

