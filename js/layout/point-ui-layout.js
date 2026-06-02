// Point UI layout helpers
// Keep point component CSS custom property mapping centralized for map layout tuning.

import {
  MAP_BANNER_PLACEMENTS
} from "./decorations.js?v=20260524-visibility-toggles";
import { getPointLayout } from "./layout-engine.js?v=20260524-visibility-toggles";
import { setMapImagePosition } from "../utils.js?v=20260524-visibility-toggles";

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

export function applyPointUiOffsets(element, pointId, width = window.innerWidth) {
  const { cssVars: baseVars, pointOffsets: offsets } = getPointLayout(pointId, undefined, width);
  if (!offsets) return;

  Object.entries(offsets).forEach(([targetType, targetOffsets]) => {
    const targetVars = POINT_UI_OFFSET_VARS[targetType];
    if (!targetVars) return;
    const targetElement = targetType === "select"
      ? element.querySelector(".point-selects") || element
      : element;

    Object.entries(targetOffsets).forEach(([property, offset]) => {
      const variableName = targetVars[property];
      const baseValue = getCssPxNumber(baseVars[variableName]);
      if (!variableName || baseValue === null) return;
      // Offsets are additive deltas from the base CSS custom property.
      const finalValue = formatCssPx(baseValue + offset);
      targetElement.style.setProperty(variableName, finalValue);
      if (targetType === "select" && property === "height") {
        targetElement.style.setProperty("--map-point-select-row-height", finalValue);
        targetElement.style.setProperty("--map-point-select-min-height", finalValue);
      }
    });
  });
}

export function clearPointUiOffsets(element) {
  Object.values(POINT_UI_OFFSET_VARS).forEach(targetVars => {
    Object.values(targetVars).forEach(variableName => {
      element.style.removeProperty(variableName);
    });
  });

  const selectGroup = element.querySelector(".point-selects");
  if (selectGroup) {
    Object.values(POINT_UI_OFFSET_VARS.select).forEach(variableName => {
      selectGroup.style.removeProperty(variableName);
    });
    selectGroup.style.removeProperty("--map-point-select-row-height");
    selectGroup.style.removeProperty("--map-point-select-min-height");
  }
}

export function refreshMapLayout(width = window.innerWidth) {
  document.querySelectorAll(".point").forEach(point => {
    clearPointUiOffsets(point);
    applyPointUiOffsets(point, point.dataset.id, width);
  });

  MAP_BANNER_PLACEMENTS.forEach(placement => {
    const label = document.querySelector(`.point-name-label[data-point-id="${placement.pointId}"]`);
    if (!label) return;

    const { bannerTextOffset: textOffset } = getPointLayout(placement.pointId);
    setMapImagePosition(
      label,
      placement.x + textOffset.x,
      placement.y + textOffset.y
    );
  });
}
