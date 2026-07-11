# Progression Atlas visual fidelity ledger

Verified on 2026-07-11 against the approved desktop, mobile portrait, and mobile landscape concepts. Browser evidence was captured from the production build at 1568×1003, 432×911, and 940×418 after the relevant renderer reported ready.

| Check | Concept evidence | Browser evidence | Fix or approved deviation |
| --- | --- | --- | --- |
| Map remains dominant | The ink map is the largest region in every approved concept. | The production desktop and landscape captures devote the central majority to the map; portrait keeps the map visible behind a bounded 55dvh details sheet. | Preserved the map as the focal renderer, prevented mobile rail stacking, and capped the portrait sheet so it cannot cover more than 56% of the viewport. |
| Desktop rails match proportions | Desktop uses a narrow filter rail, a dominant map, and a compact story inspector. | The 1568×1003 build uses 244px navigation, a fluid 940px map at the capture size, and a 384px inspector. | Implemented the approved tri-pane grid with divider bands rather than nested cards. Exact widths are an approved flexible element. |
| Jade route and vermilion branch semantics | The primary progression route is jade, future geometry is muted, and the decision branch is vermilion. | The progressed production capture shows completed jade segments, a jade current node, muted future segments, a gold optional route, and vermilion choice geometry. | Increased route contrast, darkened only the map substrate, retained semantic colors, and limited DOM labels to the selected progression window. |
| Typography and control density | Warm display headings sit over compact sans-serif commands and narrow chrome. | The build uses a serif display face for the platform and selected-story headings, Geist for controls, a 64px desktop command bar, and a 56–72px responsive command bar. | Kept the platform-neutral Progression Atlas identity; the game remains a selector, as approved. |
| Portrait map plus partial sheet | The concept keeps the map visible, places mode navigation at the bottom, and raises a partial details sheet. | The 432×911 production capture exposes the game selector and utility controls at top, a persistent trace summary, bottom Map/Thread/Timeline navigation, and a scrollable details sheet capped at 55dvh. | Moved portrait mode switching to a dedicated bottom surface, kept 44px targets, and enforced the partial-sheet height with an end-to-end ratio assertion. |
| Landscape map plus compact inspector | The landscape concept collapses the full filter rail before shrinking the map and keeps a right inspector. | At 940×418 the navigation rail is hidden, the map stays dominant, and the selected-story inspector remains visible at right. | Implemented a two-column landscape grid and kept filters available from the Layers command. |
| Icons and state symbols | The concepts use restrained line icons, check marks for completed steps, numbers for current/future steps, and distinct branch shapes. | The production map uses compact numbered discs, checks for completed steps, a gold optional square, a vermilion choice diamond, and Lucide utility icons. | Replaced visually heavy locked “×” discs with numbered neutral markers while retaining the full 44px invisible hit target. |
| Reduced-motion stable frame | The concept has a stable readable route with no motion dependency. | The browser suite verifies `data-motion="reduced"`, immediate keyboard navigation, and the 12,000-POI fixture without animation-dependent assertions. | Reduced motion cancels route and camera playback while preserving the final selection, route, labels, and renderer readiness. |

## First-viewport copy audit

The approved copy list remains the baseline. The following additional labels are functionally necessary and intentionally retained:

- **Region**, **Storyline**, **Layers**, and **Progress** identify navigation and filter groups.
- **Cached** communicates local data availability and offline resilience.
- **Status**, **Source confidence**, **Source details**, **Prerequisites**, **Rewards**, and **Nearby discoveries** provide the selected step’s accessibility and provenance context.
- Illustrative quest titles and reward names come from the validated schematic content pack and change with selection.

The selected demonstration step is numbered 6 rather than the concept’s 5 because the validated thread keeps the optional Lost Courier step in narrative order. This is a content-driven, meaning-preserving deviation; state colors, branch meaning, selection, and progress staging remain unchanged.

## Evidence and automated gates

- Browser captures: `work/qa/desktop-production.png`, `work/qa/portrait-production.png`, and `work/qa/landscape-production.png` (local QA artifacts, intentionally uncommitted).
- Responsive composition: `tests/e2e/responsive.spec.ts`.
- Accessibility and keyboard tracing: `tests/e2e/accessibility.spec.ts`.
- Renderer lifecycle and 12,000-POI stress fixture: `tests/e2e/performance.spec.ts`.
- WebGL failure-only Canvas fallback: `tests/e2e/fallbacks.spec.ts`.
