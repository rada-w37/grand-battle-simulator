// Map layout configuration
// Phase 0: Keep current visual behavior while centralizing tunable map UI values.

import { getLayoutViewport } from "./layout-coordinate.js?v=20260524-visibility-toggles";

/*
 * Additive point UI offsets.
 *
 * MAP_POINT_UI_OFFSETS is not an absolute layout table. Each value is a delta
 * from the corresponding base CSS custom property in MAP_LAYOUT_CSS_VARS:
 *
 *   final CSS value = base CSS var + offset
 *
 * Component semantics:
 * - pointStack.x / y: shared px delta for bands, selects, sword, and shield.
 * - pointLabels.x / y: px delta from the base label position.
 * - pointLabels.width / height: px delta from the base label size.
 * - select.x / y: px delta from the base select position.
 * - select.width / height: px delta from the base select size.
 * - sword.x / y and shield.x / y: px delta from each base icon position.
 * - sword.size and shield.size: px delta from each base icon size.
 *
 * Select offsets are special: select placement uses relative center positioning,
 * mirrors height to --map-point-select-min-height during runtime application, and
 * is paired with dev editor output rules. Treat select changes with extra care.
 *
 * Mobile keeps only select collision corrections because its bands and point
 * markers are hidden. A missing property means "no offset"; zero deltas are
 * normally omitted.
 */
export const MAP_POINT_UI_OFFSETS = {
  desktop: {
    citri: { pointStack: { x: 4, y: 6 } },
    perido: { pointStack: { y: 4 } },
    meral: { pointStack: { x: 6, y: -4 } },
    zircon: { pointStack: { x: -4, y: 2 } },
    yesod: { pointStack: { x: 4, y: -4 } },
    keter: { pointStack: { x: 4 } },
    ein: { pointStack: { y: -1 } }
  },
  mobile: {
    citri: { select: { x: 1, y: 2 } },
    toppaz: { select: { x: 1 } },
    meral: { select: { x: 1 } },
    tiferet: { select: { y: -3 } },
    yesod: { select: { y: -4 } }
  }
};

export function getMapPointUiOffsets(pointId, width = window.innerWidth) {
  const viewport = getLayoutViewport(width);
  const offsets = MAP_POINT_UI_OFFSETS[viewport]?.[pointId];
  if (!offsets) return null;

  return {
    ...offsets,
    ...(offsets.select
      ? {
        select: {
          ...offsets.select,
          x: offsets.select.x ?? 0,
          y: offsets.select.y ?? 0
        }
      }
      : {})
  };
}
