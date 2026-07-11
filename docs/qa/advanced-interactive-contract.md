# Progression Atlas Interactive Visualization Contract

Status: approved implementation contract  
Reference date: 2026-07-11  
Binding visual references:

- `docs/superpowers/specs/assets/progression-atlas-desktop.png`
- `docs/superpowers/specs/assets/progression-atlas-mobile-portrait.png`
- `docs/superpowers/specs/assets/progression-atlas-mobile-landscape.png`

## 1. Evidence and content boundary

Progression Atlas is an operational progression workspace. Its core evidence is a storyline rendered as an ordered, branching, stateful journey across a map, dependency graph, and timeline.

The first content pack is a deliberately original, schematic *Where Winds Meet* demonstration. It must never be presented as a complete or authoritative game map. No official or community map geometry is copied. Every factual record carries provenance, verification date, confidence, and permission status; unknown information stays unknown.

The initial slice is successful when a player can select the representative 20-step storyline, trace it on the map, understand required versus optional and exclusive branches, advance progress safely, and keep map, thread, timeline, outline, inspector, URL, and local persistence synchronized.

## 2. Layer inventory and ownership

| Layer | Mark type | Owner | Interaction | Fallback | Performance target |
| --- | --- | --- | --- | --- | --- |
| Original map substrate | raster tiles on planes | Three.js | pan, wheel/pinch zoom, reset | Canvas2D image pyramid | one WebGL context; render on demand |
| Story route | buffered polylines | Three.js, geometry from D3 utilities | hover/pick, trace emphasis | Canvas2D paths | stable at 12,000 synthetic marks |
| Quest and POI symbols | instanced glyphs | Three.js | nearest visible hit, keyboard-equivalent outline | Canvas2D glyphs plus DOM list | screen-stable size and redundant shape |
| Selected labels | text and annotation | React DOM | focus, activate, inspect | same DOM layer | only selected/important labels mounted |
| Thread dependency graph | nodes and orthogonal links | ELK for layout, D3/SVG for marks | focus, select, pan when necessary | semantic outline | deterministic layered layout |
| Timeline | ordered stepper, not schedule bars | React with D3 scale utilities | step selection and progress action | semantic ordered list | virtualize when content grows |
| Shell, inspector, search, filters | controls and prose | React and shadcn/ui | full pointer and keyboard operation | same DOM shell | no visualization renderer state in React |
| Failure-only map | raster, paths, symbols | Canvas2D | same camera actions and coarse picking | semantic outline remains authoritative | device-pixel-ratio aware; no hidden DOM mirror |

There is exactly one Three.js scene and one WebGL context. D3 computes geometry and scales but does not own the React lifecycle. Anime.js may choreograph DOM/SVG transitions only; motion never changes data meaning. There are no ambient particles or decorative continuous animations.

## 3. Coordinate ledger

The canonical content coordinate is normalized source-image space:

```text
content.x = sourcePixel.x / sourceWidth
content.y = sourcePixel.y / sourceHeight
```

The source asset is authored at 3840 x 2160 pixels. Normalized coordinates are reversible and retain the confidence of their source record.

```text
normalized [0,1] x [0,1]
  -> source pixels (3840 x 2160)
  -> orthographic world units (surface aspect preserved)
  -> camera/view transform
  -> CSS screen pixels
  -> device pixels for Canvas2D only
```

Rules:

- A shared `MapTransform` module owns every forward and inverse transform.
- Three.js, Canvas2D, DOM labels, picking, exports, and tests call that module; no renderer invents a private transform.
- Camera state is center, zoom, viewport size, and active surface/layer.
- Resize preserves the normalized point under the viewport center.
- Screen-stable symbols derive their scale from camera zoom rather than mutating content coordinates.
- Input coordinates are converted from client space through the viewport bounds before hit testing.
- Canvas backing dimensions equal CSS dimensions multiplied by the clamped device pixel ratio; drawing APIs remain in CSS-pixel units after scaling the context.

## 4. Encoding contract

| Meaning | Color role | Redundant non-color cue |
| --- | --- | --- |
| required / primary route | jade | solid line, numbered circular node |
| optional route | muted gold | dashed line, diamond node |
| exclusive choice | vermilion | fork glyph and split branch |
| rejoin | jade-to-neutral | converging arrowheads |
| completed | bright jade | check glyph and filled node |
| current | warm parchment | double ring and pulse limited by reduced-motion preference |
| available | light neutral | open node |
| locked | dark neutral | lock glyph and dotted outline |
| missed / excluded | desaturated vermilion | strike or barred glyph |
| schematic confidence | muted neutral | tilde badge and explicit “Schematic” text |

Color is never the only carrier of progression, edge kind, or selection. Minimum target size is 44 x 44 CSS pixels for touch controls. Text and UI chrome meet WCAG AA contrast against their actual surfaces.

## 5. Interaction and state contract

### URL-owned, shareable state

- game, world, surface/layer, and region
- mode: map, thread, or timeline
- selected storyline and selected step/POI
- trace mode and active trace step
- camera center and zoom when materially changed
- search query and meaningful filter values

### Durable local state

- step completion and selected branch
- discovered content
- display and accessibility preferences
- last successfully loaded content version and offline cache metadata

### Transient state

- hover target
- open popover/menu state
- drag/pinch gesture state
- renderer resources and animation handles

URL parsing is validated and canonicalized. Invalid IDs fall back to a safe overview with a recoverable notice. Popstate restores selection, mode, filters, and camera without duplicating history entries.

Selection synchronizes all modes. Choosing a map node selects the same step in the outline, thread, timeline, and inspector. Advancing Trace Mode updates progress only after dependency and choice rules validate the action.

## 6. Responsive and gesture contract

The primary visualization never disappears on mobile.

- Desktop: left navigation/filter rail, dominant central visualization, right inspector.
- Portrait: compact top chrome, dominant map, trace summary, bottom mode navigation, inspector as a bottom sheet.
- Landscape mobile: thin left controls, dominant center map, compact right inspector.
- Thread and Timeline reuse the same responsive shell and preserve the selected entity.

Gestures:

- one pointer drag pans;
- wheel and trackpad zoom about the pointer;
- two-finger pinch zooms about the gesture midpoint while allowing deliberate map interaction;
- tap selects; a second activation opens detailed inspection;
- browser/page scrolling remains available outside the visualization;
- Escape closes the topmost transient surface and returns focus to its invoker.

Opening a sheet or inspector moves focus to its heading only when the user explicitly opened it. Closing restores focus to the selected map/outline control. Mode changes move focus to the new mode heading while retaining the selected step.

## 7. Accessibility contract

- Every canvas/WebGL operation has an equivalent semantic outline action.
- The map viewport has a concise label and instructions connected with `aria-describedby`.
- Selection and progress changes are announced through a polite live region.
- The outline uses buttons/links with meaningful names, not mirrored hidden pixels.
- Thread SVG nodes are focusable through a roving-tabindex controller and expose dependency/state text.
- Keyboard map controls: arrow keys pan, `+`/`-` zoom, `0` reset, Enter inspects selected item, and bracket keys move through trace steps.
- Reduced motion removes pulses and collapses animated transitions to short fades or immediate state changes.
- High-contrast and forced-color modes preserve borders, selection, branch kinds, and focus rings.

## 8. Offline, failure, and reduced-capability behavior

If WebGL initialization or context recovery fails, the map switches to Canvas2D using the same transform, camera, semantic outline, URL state, and selection model. The user receives a non-blocking status message; the route remains usable.

If tile/content loading fails:

- cached validated content is used when available;
- unavailable regions show a retry state without erasing progress;
- the representative storyline remains readable in the outline and inspector;
- invalid content packs fail validation before becoming active;
- progress migrations are versioned and never silently discard branch choices.

## 9. Performance budgets

- initial application JS budget: target under 300 kB gzip excluding lazy visualization chunks;
- Three.js, ELK, Thread, and Timeline modes load lazily;
- first useful shell on a typical laptop: target under 2.5 seconds on a cold local production preview;
- interaction: target 60 fps during ordinary pan/zoom and at least 30 fps in the 12,000-mark stress fixture;
- idle visualization consumes no continuous animation loop;
- no more than one WebGL context;
- selected/rich DOM labels stay bounded rather than scaling with all marks;
- content search and large outlines virtualize after the first-slice thresholds are exceeded.

## 10. Verification matrix

| Concern | Automated evidence | Manual evidence |
| --- | --- | --- |
| content and progression invariants | Vitest schema and engine tests | inspect source/confidence display |
| transforms and picking | unit/property tests at corners, center, zooms, DPR | click/tap alignment at responsive sizes |
| URL and persistence | router and IndexedDB integration tests | reload, back/forward, shared link |
| renderer and fallback | geometry tests plus Playwright WebGL-failure fixture | force WebGL failure and compare semantics |
| accessibility | Testing Library, axe, keyboard Playwright | VoiceOver spot check and focus restoration |
| responsive composition | Playwright screenshots at concept dimensions | compare against all three approved concepts |
| performance | synthetic 12,000-mark benchmark and production bundle report | pan/zoom trace on representative hardware |

Before visual signoff, inspect both each approved concept image and the newest browser screenshot at desktop, portrait, and landscape sizes. Record remaining deviations in a fidelity ledger; do not substitute subjective memory for side-by-side inspection.
