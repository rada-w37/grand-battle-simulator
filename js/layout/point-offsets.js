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
 * Mobile offsets may look like replacement values because the mobile base sizes
 * are small, but they are still additive deltas. A missing property means
 * "no offset"; zero deltas are normally omitted.
 */
export const MAP_POINT_UI_OFFSETS = {
  desktop: {
    ganette: {
      select: { y: -3, height: -0.01 }
    },
    rula: {
      select: { y: -3, height: -0.01 }
    },
    cushel: {
      select: { y: -3, height: -0.01 }
    },
    pharia: {
      select: { y: -4, height: -0.01 }
    },
    citri: {
      pointLabels: { x: 4, y: 6 },
      sword: { x: 4, y: 6 },
      shield: { x: 4, y: 6 },
      select: { x: 2, y: 3, height: -0.01 }
    },
    floryte: {
      select: { y: -3, height: -0.01 }
    },
    toppaz: {
      select: { y: -3, height: -0.01 }
    },
    perido: {
      pointLabels: { y: 4 },
      sword: { y: 4 },
      shield: { y: 4 },
      selectRows: { rowHeight: -0.01 },
      selectControl: { height: -0.01, minHeight: -0.01 }
    },
    meral: {
      pointLabels: { x: 6, y: -4 },
      sword: { x: 6, y: -4 },
      shield: { x: 6, y: -4 },
      select: { x: 7, y: -7, height: -0.01 }
    },
    onyx: {
      select: { y: -3, height: -0.01 }
    },
    zircon: {
      pointLabels: { x: -4, y: 2 },
      sword: { x: -3, y: 2 },
      shield: { x: -3, y: 2 },
      select: { y: -3, height: -0.01 }
    },
    amest: {
      select: { y: -3, height: -0.01 }
    },
    lapis: {
      select: { y: -3, height: -0.01 }
    },
    laven: {
      select: { y: -3, height: -0.01 }
    },
    marin: {
      select: { y: -3, height: -0.01 }
    },
    larimal: {
      select: { y: -3, height: -0.01 }
    },
    tiferet: {
      select: { y: -3, height: -0.01 }
    },
    yesod: {
      pointLabels: { x: 4, y: -4 },
      sword: { x: 4, y: -4 },
      shield: { x: 4, y: -4 },
      select: { x: 4, y: -10, height: -0.01 }
    },
    keter: {
      pointLabels: { x: 4 },
      sword: { x: 4 },
      shield: { x: 4 },
      select: { y: -3, height: -0.01 }
    },
    malkuth: {
      select: { y: -3, height: -0.01 }
    },
    ein: {
      pointLabels: { y: -1 },
      sword: { y: -2 },
      shield: { y: 1 },
      select: { y: -3, height: -0.01 }
    }
  },
  mobile: {
    ganette: { pointLabels: { y: 9.2, width: 28.59, height: 11.5 } },
    rula: { pointLabels: { y: 11.6, width: 28.59, height: 11.5 } },
    cushel: { pointLabels: { x: 0.8, y: 10, width: 28.59, height: 11.5 } },
    pharia: { pointLabels: { x: 0.8, y: 11.2, width: 28.59, height: 11.5 } },
    citri: {
      pointLabels: { y: 16.6, width: 28.59, height: 11.5 },
      select: { x: 1, y: 2 }
    },
    floryte: { pointLabels: { x: 0.67, y: 12.06, width: 28.59, height: 11.5 } },
    toppaz: {
      pointLabels: { y: 12, width: 28.59, height: 11.5 },
      select: { x: 1 }
    },
    perido: { pointLabels: { x: -2.4, y: 17.4, width: 28.59, height: 11.5 } },
    meral: {
      pointLabels: { x: 0.4, y: 11.8, width: 28.59, height: 11.5 },
      select: { x: 1 }
    },
    onyx: { pointLabels: { x: -1.33, y: 11, width: 28.59, height: 11.5 } },
    zircon: { pointLabels: { x: -3.01, y: 15.87, width: 28.59, height: 11.5 } },
    amest: { pointLabels: { y: 9.2, width: 28.59, height: 11.5 } },
    lapis: { pointLabels: { x: -0.8, y: 10.8, width: 28.59, height: 11.5 } },
    laven: { pointLabels: { x: 4, y: 9.6, width: 28.59, height: 11.5 } },
    marin: { pointLabels: { x: 0.4, y: 12.4, width: 28.59, height: 11.5 } },
    larimal: { pointLabels: { x: -0.6, y: 10.6, width: 28.59, height: 11.5 } },
    tiferet: {
      pointLabels: { y: 11.39, width: 28.59, height: 11.5 },
      select: { x: 0, y: -3 }
    },
    yesod: {
      pointLabels: { x: 6.68, y: 10.2, width: 28.59, height: 11.5 },
      select: { y: -4 }
    },
    keter: { pointLabels: { x: 6.68, y: 5.36, width: 28.59, height: 11.5 } },
    malkuth: { pointLabels: { y: 9.6, width: 28.59, height: 11.5 } },
    ein: { pointLabels: { x: 1, y: 7.2, width: 28.59, height: 11.5 } }
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
