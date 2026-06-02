// Point UI layout helpers
// Keep point component CSS custom property mapping centralized for map layout tuning.

export const POINT_UI_OFFSET_VARS = {
  pointLabels: {
    x: "--map-point-labels-left",
    y: "--map-point-labels-top",
    width: "--map-point-labels-width",
    height: "--map-point-labels-height"
  },
  sword: {
    x: "--map-sword-left",
    y: "--map-sword-top",
    size: "--map-sword-size"
  },
  shield: {
    x: "--map-shield-left",
    y: "--map-shield-top",
    size: "--map-shield-size"
  },
  select: {
    x: "--map-point-select-left",
    y: "--map-point-select-top",
    width: "--map-point-select-width",
    height: "--map-point-select-height"
  }
};

export function getCssPxNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatCssPx(value) {
  return `${Math.round(value * 100) / 100}px`;
}
