# Grand Battle Simulator Layout Boundary Policy

## Purpose

This document records the boundary policy for `js/layout/` after the DDD refactor steps.
The short version is:

- `js/layout/` is not domain.
- Treat `js/layout/` as presentation-support / layout-support.
- Do not move layout modules into `js/domain/` unless the data has been proven to be a pure game rule rather than a rendering rule.

This policy exists to keep future Codex/AI refactors from accidentally turning map rendering, viewport tuning, and dev layout editor contracts into domain concepts.

## Current Responsibilities Of `js/layout/`

`js/layout/` currently owns map rendering support concerns:

- map image size and battle point placement data
- point type, viewport, and offset layout tables
- CSS custom property generation for map layout
- coordinate conversion between base image pixels, rendered pixels, and percentages
- runtime point UI offset application
- structure, banner, label, and aura placement data
- dev layout editor target rules and payload resolution support
- compatibility layers for the ongoing Phase6 layout migration

Important files:

- `layout-config.js`: compatibility entry point that re-exports the layout index.
- `index.js`: aggregate export for current layout modules.
- `base.js`, `decorations.js`, `point-offsets.js`: current layout data tables.
- `layout-coordinate.js`, `viewport.js`: viewport and coordinate conversion helpers.
- `layout-engine.js`, `layout-merge.js`, `type-layout.js`, `viewport-layout.js`: staged merge and extension points.
- `point-ui-layout.js`: applies point UI CSS variables to rendered DOM nodes.
- `target-rules.js`: dev layout editor update rules for layout payloads.

## Why `layout/` Is Not Domain

Domain modules should describe game rules and state transformations that are independent of rendering. Examples are occupation state normalization, scoring, guild rename reference updates, battle snapshot interpretation, and world option normalization.

`layout/` does not meet that bar today because it contains presentation-oriented concerns:

- screen placement and visual coordinates
- viewport-dependent layout behavior
- CSS variable names and DOM-facing target roles
- dev editor metadata contracts such as `BATTLE_POINTS`, `POINT_AURA_COORDINATES`, and `MAP_LAYOUT_CSS_VARS`
- compatibility with current rendered map structure

Some layout data, such as a point `id`, `type`, or `castleId`, can look domain-like. In this codebase those values are bundled with visual placement and editor metadata. Until they are intentionally split, `BATTLE_POINTS` and related tables must be treated as layout-support data, not domain entities.

## Relationship To `presentation/`

`js/presentation/` should contain small rendering helpers and DOM formatting helpers.
`js/layout/` should contain map layout support: coordinates, viewport-specific placement, CSS variable mapping, and dev editor layout rules.

Allowed direction:

```text
presentation/ui -> layout
presentation/ui -> presentation helpers
```

Avoid turning `presentation/` into another layout registry. If a helper understands map coordinates, viewport layout, point offset keys, or dev layout target rules, it likely belongs in `layout/`, not generic `presentation/`.

## Dependency Rules

Allowed:

- `ui.js`, `main.js`, `events.js`, and map rendering modules may import from `layout/`.
- `presentation/` helpers may be used by `ui.js` and other presentation modules.
- `infrastructure/` may import app config, but should not import `layout/`.

Not allowed:

- `domain/` must not import from `layout/`.
- `domain/` must not import `BATTLE_POINTS` or layout constants directly.
- `layout/` should not import from `domain/`.
- `infrastructure/` should not import from `layout/`, `ui.js`, or presentation rendering modules.
- Application services should receive layout data as input when they need it for data preparation; they should not own layout mutation or DOM rendering.

When domain-like values are needed from layout data, prefer passing the minimum required data from the facade/caller. This keeps domain functions testable with small local fixtures.

## Dev Layout Editor Relationship

`js/dev/dev-layout-editor.js` depends on current layout metadata and target rules:

- `data-dev-layout-id`
- `data-dev-layout-key`
- `data-dev-layout-point-id`
- `data-dev-layout-role`
- `BATTLE_POINTS`
- `POINT_AURA_COORDINATES`
- `MAP_STRUCTURE_PLACEMENTS`
- `MAP_BANNER_PLACEMENTS`
- `MAP_LAYOUT_CSS_VARS`
- `target-rules.js`

Because of this, layout refactors must preserve the runtime metadata contract unless the dev editor is updated in the same small, verified step.

Step 12 moved only the metadata setter helper to `presentation/dom-helpers.js`; the metadata names and values remain part of the layout/editor contract and must not be casually renamed.

## Phase6 Compatibility Notes

The Phase6 layout migration is tracked separately in `docs/phase6-layout-migration-roadmap.md`.
For DDD work, treat these files as especially sensitive:

- `js/layout/layout-config.js`
- `js/layout/index.js`
- `js/layout/point-offsets.js`
- `js/layout/point-ui-layout.js`
- `js/layout/target-rules.js`
- `js/dev/dev-layout-editor.js`

Do not change these files as part of domain extraction unless the task explicitly targets layout migration. DDD refactors should keep current visual behavior stable and avoid changing layout vocabulary, CSS variable names, dev editor payload shape, or offset semantics.

## Safe Change Procedure For Future Layout Work

Use small commits and keep visual behavior stable.

1. Identify whether the change is domain, presentation, layout-support, or dev-editor support.
2. If it touches coordinates, CSS variables, viewport rules, or `data-dev-layout-*`, treat it as layout work.
3. Read `docs/phase6-layout-migration-roadmap.md` before changing layout files.
4. Preserve existing exports from `layout-config.js` unless there is a dedicated compatibility step.
5. Prefer mirror/adapter changes before replacing existing layout data.
6. Keep `domain/` independent by passing layout-derived data as input.
7. Verify with tests and browser/static-server checks before committing.

## Test And Verification Policy

For docs-only layout boundary work:

```powershell
git diff --check
git status --short --untracked-files=all
```

For code changes that touch layout or presentation helpers:

```powershell
node --test tests
node --check js/ui.js
node --check js/utils.js
node --check js/presentation/dom-helpers.js
git diff --check
```

For layout runtime changes, add at least one of:

- fake DOM verification for CSS custom properties or metadata
- local HTTP static server check for `/` and `/js/main.js`
- browser console check when the change can affect ESM loading or rendering
- manual visual check across desktop/mobile viewports when coordinates or CSS variables change

## Step 14 Readiness

Step 14 final import cleanup may reduce facade/import noise, but it should not move `layout/` into `domain/`.
Any remaining imports of layout data from `ui.js`, `main.js`, or rendering helpers are acceptable when they support presentation behavior.
