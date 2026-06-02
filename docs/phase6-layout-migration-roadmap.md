# Phase 6 Layout Migration Roadmap

## Goal

Move the point guild UI toward a clean separation between select rows, background
bands, offsets, and the dev layout editor, without breaking the current visual
alignment.

This document is a roadmap only. It must not be treated as approval to change
runtime behavior, CSS effective values, DOM structure, or existing point offsets.

## Current Responsibility Mix

The current point guild UI keeps several responsibilities bundled together.

- `--map-point-select-height` currently represents three things:
  - `.point-selects` grid row height
  - `.point select` element height
  - `select.height` offset base and runtime override target
- Desktop layout depends on `select.height` offsets for every point.
- `--map-point-labels-height` currently represents three things:
  - `.point-labels` stack height
  - the implied gap between `::before` and `::after` background bands
  - `pointLabels.height` offset base and runtime override target
- The background bands and select rows are sibling layers:
  - `.point-labels` is positioned from `--map-point-labels-left/top`.
  - `.point-selects` is positioned from point center plus `--map-point-select-left/top`.
- Mobile and desktop use different dominant adjustment paths:
  - desktop is heavily select-offset driven.
  - mobile is heavily pointLabels-offset driven.

Named vocabulary already exists for future separation:

- `--map-point-select-row-height`
- `--map-point-select-gap`
- `--map-point-band-height`
- `--map-point-band-gap`

At this stage, these names are vocabulary and documentation aids. They should
not all be used as runtime sources until offset and editor behavior are ready.

## Ideal Phase 6-C Shape

The final target is to make each value carry one responsibility.

- Select row stack:
  - row height: `--map-point-select-row-height`
  - row gap: `--map-point-select-gap`
  - row stack position: select stack x/y variables
- Select control:
  - control height: a select control-specific variable
  - control min-height: a select control-specific min-height variable
  - text rendering: line-height, padding, font scale
- Background band stack:
  - band height: `--map-point-band-height`
  - band gap: `--map-point-band-gap`
  - stack height: a labels or band-stack height variable
  - stack position: labels stack x/y variables
- Offsets:
  - row stack offsets should target row stack variables.
  - control offsets should target select control variables.
  - band stack offsets should target band stack variables.
- Dev layout editor:
  - editor input and output should match the final offset vocabulary.
  - dragging a row stack should not silently change control height semantics.

## Migration Phases

### Phase6-A: Current State And Vocabulary

Purpose:

- Keep current visual behavior.
- Add or retain vocabulary that names the future responsibilities.
- Avoid changing any effective top, height, gap, offset, or DOM behavior.

Expected files:

- `js/layout/viewport.js`
- `style.css`
- documentation under `docs/`

Risk:

- Low, if changes are comments or same-value aliases only.
- Medium, if a variable starts being used in CSS before offset mirrors are ready.

Commit granularity:

- One small commit for same-value vocabulary.
- One small commit for docs or explanatory comments.

### Phase6-B: Zero-Diff Mirror Migration

Purpose:

- Allow `.point-selects` to read row height from `--map-point-select-row-height`
  without changing existing `select.height` offset behavior.
- Mirror existing height offsets to both old and new variables during runtime.

Expected files:

- `style.css`
- `js/layout/point-ui-layout.js`

Likely changes:

- `.point-selects` may move to `--map-point-select-row-height`.
- `applyPointUiOffsets()` must mirror `select.height` final values to:
  - `--map-point-select-height`
  - `--map-point-select-row-height`
  - `--map-point-select-min-height` where still required
- `clearPointUiOffsets()` must clear every mirrored variable.

Risk:

- High if mirror behavior is incomplete.
- High on desktop because all points currently depend on `select.height`.
- Medium on mobile because select height offsets are not the dominant path, but
  mobile select touch sizing has separate CSS overrides.

Commit granularity:

- One commit for runtime mirror helpers only.
- One commit for CSS row-height reference switch.
- Each commit should be visually reversible and easy to bisect.

### Phase6-C: Dev Editor Alignment

Purpose:

- Make the dev layout editor understand the same split used by runtime layout.
- Prevent editor output from re-coupling row height and control height.

Expected files:

- `js/dev/dev-layout-editor.js`
- `js/layout/target-rules.js`
- possibly `docs/layout-rules.md`

Likely changes:

- Update select target snapshots to distinguish row stack height from select
  control height.
- Update output rules so editor changes write to the intended offset vocabulary.
- Preserve existing editor output behavior until runtime mirrors are verified.

Risk:

- Medium to high.
- The editor currently assumes `--map-point-select-height` as the select height
  base. Changing that too early can produce misleading offset output.

Commit granularity:

- One commit for editor read/snapshot behavior.
- One commit for editor output rule changes.
- One commit for documentation updates.

### Phase6-D: Formal Offset Vocabulary Split

Purpose:

- Stop using one `select.height` concept for multiple layout responsibilities.
- Separate offsets for select row stack, select control, and band stack.

Expected files:

- `js/layout/point-ui-layout.js`
- `js/layout/point-offsets.js`
- `js/layout/target-rules.js`
- `js/dev/dev-layout-editor.js`

Possible offset vocabulary:

- `selectRows.x`
- `selectRows.y`
- `selectRows.width`
- `selectRows.rowHeight`
- `selectControl.height`
- `selectControl.minHeight`
- `pointLabels.stackHeight`
- `pointLabels.bandGap`

Risk:

- High.
- Existing desktop offsets are dense and tuned visually.
- This phase may require point-by-point verification after the vocabulary split.

Commit granularity:

- One commit to introduce new offset readers while keeping old offsets active.
- One commit to migrate a small set of offsets or a single viewport.
- One commit to remove or deprecate legacy offset names after verification.

### Phase6-E: Unified Placement Model

Purpose:

- Move background bands and select rows toward a shared placement model.
- Reduce sibling-layer drift between `.point-labels` and `.point-selects`.

Expected files:

- `style.css`
- `js/ui.js`
- `js/layout/viewport.js`
- `js/layout/point-ui-layout.js`
- `js/dev/dev-layout-editor.js`

Possible approaches:

- Keep DOM unchanged but derive both stacks from a shared stack anchor.
- Add a wrapper around the two rows and bands in a later DOM migration.
- Move bands into the select row stack once offset/editor support is ready.

Risk:

- Very high.
- This is the first phase that may require DOM or placement model changes.
- It can affect pointer behavior, focus behavior, visibility toggles, and editor
  target selection.

Commit granularity:

- One commit for shared anchor variables with no visual change.
- One commit for DOM or wrapper changes, if any.
- One commit for editor target migration.
- One commit for visual tune-up only after the structure is stable.

## Revert-Friendly Rules

- Keep each commit scoped to one responsibility.
- Do not mix vocabulary, runtime mirrors, editor changes, and visual tuning in
  the same commit.
- Prefer same-value aliases before reference switches.
- Prefer mirror behavior before changing CSS references.
- Keep `point-offsets.js` untouched until runtime and editor semantics are
  ready.
- When changing offset semantics, migrate one viewport or a small point set at a
  time.

## Do Not Touch Yet

Until the mirror and editor phases are planned and verified, avoid changing:

- `point-offsets.js`
- `TYPE_LAYOUT`
- `VIEWPORT_LAYOUT`
- `mergeLayoutLayers` runtime use
- `.point-labels` / `.point-selects` DOM structure
- battle point base coordinates
- aura, banner, and structure placement
- visibility toggle behavior
- select focus and pointer event behavior

## Next Safe Step

The next low-risk step is documentation and same-value vocabulary only. The
first runtime step should be Phase6-B mirror behavior, not direct CSS reference
switching.
