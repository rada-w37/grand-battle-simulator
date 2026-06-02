// Map layout configuration
// Phase 0: Keep current visual behavior while centralizing tunable map UI values.

import { MAP_LAYOUT_BREAKPOINT, getLayoutViewport } from "./layout-coordinate.js?v=20260524-visibility-toggles";

export { MAP_LAYOUT_BREAKPOINT };

export const MAP_LAYOUT_CSS_VARS = {
  desktop: {
    "--map-point-width": "130px",
    "--map-point-min-height": "42px",
    "--map-point-border-radius": "6px",
    "--map-point-label-font-size": "clamp(1.8rem, 0.75vw, 0.7rem)",
    "--map-point-label-transform-y": "-2px",
    "--map-shield-left": "3.32px",
    "--map-shield-top": "33.78px",
    "--map-shield-size": "26px",
    "--map-sword-left": "3.22px",
    "--map-sword-top": "8.46px",
    "--map-sword-size": "26px",
    "--map-point-labels-left": "66px",
    "--map-point-labels-top": "21px",
    "--map-point-labels-width": "100px",
    "--map-point-labels-height": "52px",
    "--map-point-labels-gap": "9px",
    "--map-point-band-width": "100px",
    "--map-point-band-height": "24px",
    "--map-point-band-radius": "3px",
    "--map-point-select-row-height": "17.99px",
    "--map-point-select-gap": "9px",
    "--map-point-select-height": "17.99px",
    "--map-point-select-left": "0px",
    "--map-point-select-top": "3px",
    "--map-point-select-width": "100px",
    "--map-point-select-min-height": "17.99px",
    "--map-point-select-line-height": "normal",
    "--map-point-select-padding": "0",
    "--map-point-select-font-size": "0.85rem",
    "--map-point-option-font-size": "inherit",
    "--map-point-frame-display": "block",
    "--map-point-sword-display": "block"
  },
  mobile: {
    "--map-point-width": "130px",
    "--map-point-min-height": "42px",
    "--map-point-border-radius": "6px",
    "--map-point-label-font-size": "clamp(0.78rem, 0.9vw, 0.96rem)",
    "--map-point-label-transform-y": "-2px",
    "--map-shield-left": "3.32px",
    "--map-shield-top": "33.78px",
    "--map-shield-size": "26px",
    "--map-sword-left": "3.22px",
    "--map-sword-top": "8.46px",
    "--map-sword-size": "26px",
    "--map-point-labels-left": "66px",
    "--map-point-labels-top": "6.8px",
    "--map-point-labels-width": "57.2px",
    "--map-point-labels-height": "23px",
    "--map-point-labels-row-height": "11px",
    "--map-point-labels-gap": "1px",
    "--map-point-band-width": "108%",
    "--map-point-band-height": "11px",
    "--map-point-band-radius": "2px",
    "--map-point-select-row-height": "11px",
    "--map-point-select-gap": "1px",
    "--map-point-select-height": "11px",
    "--map-point-select-left": "-0.5px",
    "--map-point-select-top": "0px",
    "--map-point-select-width": "57.2px",
    "--map-point-select-min-height": "11px",
    "--map-point-select-line-height": "11px",
    "--map-point-select-padding": "0",
    "--map-point-select-font-size": "0.38rem",
    "--map-point-option-font-size": "0.75rem",
    "--map-point-frame-display": "none",
    "--map-point-sword-display": "none"
  }
};

export function getMapLayoutCssVars(width = window.innerWidth) {
  const mode = getLayoutViewport(width);
  return { ...MAP_LAYOUT_CSS_VARS[mode] };
}

export function applyMapLayoutCssVars(target = document.documentElement, width = window.innerWidth) {
  Object.entries(getMapLayoutCssVars(width)).forEach(([name, value]) => {
    target.style.setProperty(name, value);
  });
}
