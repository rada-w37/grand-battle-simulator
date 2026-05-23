# Layout Rules

## Coordinate Space

- Layout table `x` / `y` values are stored as base map pixels.
- The base map size is `1293 x 1217`.
- DOM rendering converts base map pixels to percentages before applying positions.
- Do not store rendered screen pixels in layout tables.

## Rendering

- Base pixel positions are converted with:
  - `leftPercent = x / 1293 * 100`
  - `topPercent = y / 1217 * 100`
- DOM elements should receive `style.left` / `style.top` as percentages.
- Width, height, and scale behavior should remain separate from coordinate conversion.

## DevLayoutTool

- DevLayoutTool can be operated with pixel-feeling drag adjustments.
- JSON output must use base map pixels for `x` / `y`.
- Rendered screen pixels must not be copied directly into layout config values.
- The output `viewport` must match the viewport used by the app layout resolver.

## Viewport-Specific Tables

These layout areas are separated by `desktop` / `mobile`:

- SelectBox
- pointLabels
- sword
- shield

These are currently shared across viewports:

- structure
- aura
- banner body `x` / `y` / `scale`

## pointName Offsets

- `pointName` follows the shared banner body position.
- Text-only offset can be viewport-specific via:

```js
textOffsets: {
  desktop: { x: 0, y: 0 },
  mobile: { x: 0, y: 0 }
}
```

- If `textOffsets[viewport]` exists, it takes priority.
- If it does not exist, fall back to legacy `textOffsetX` / `textOffsetY`.
- Do not split the whole `MAP_BANNER_PLACEMENTS` table unless banner body positions need viewport-specific control.
