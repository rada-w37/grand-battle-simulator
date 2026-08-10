// Point UI layout helpers
// Keep point component CSS custom property mapping centralized for map layout tuning.

import {
  MAP_BANNER_PLACEMENTS
} from "./decorations.js?v=20260524-visibility-toggles";
import { getPointLayout } from "./layout-engine.js?v=20260524-visibility-toggles";
import { setMapImagePosition } from "../utils.js?v=20260810-empty-row";

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

const POINT_UI_OFFSET_TARGETS = {
  point: "point",
  select: "select"
};

const POINT_UI_COMPAT_OFFSET_VARS = {
  pointStack: {
    x: {
      target: POINT_UI_OFFSET_TARGETS.point,
      variables: [
        "--map-point-labels-left",
        "--map-point-select-left",
        "--map-sword-left",
        "--map-shield-left"
      ]
    },
    y: {
      target: POINT_UI_OFFSET_TARGETS.point,
      variables: [
        "--map-point-labels-top",
        "--map-point-select-top",
        "--map-sword-top",
        "--map-shield-top"
      ]
    }
  },
  pointLabels: {
    x: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-labels-left"] },
    y: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-labels-top"] },
    width: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-labels-width"] },
    height: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-labels-height"] },
    stackHeight: { isNewOffset: true, target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-labels-height"] }
  },
  pointBands: {
    height: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-band-height"] },
    gap: { target: POINT_UI_OFFSET_TARGETS.point, variables: ["--map-point-band-gap"] }
  },
  select: {
    x: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-left"] },
    y: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-top"] },
    width: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-width"] },
    height: {
      sourceVariable: "--map-point-select-height",
      target: POINT_UI_OFFSET_TARGETS.select,
      variables: [
        "--map-point-select-height",
        "--map-point-select-row-height",
        "--map-point-select-min-height"
      ]
    }
  },
  selectRows: {
    x: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-left"] },
    y: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-top"] },
    width: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-width"] },
    rowHeight: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-row-height"] },
    gap: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-gap"] }
  },
  selectControl: {
    height: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-height"] },
    minHeight: { target: POINT_UI_OFFSET_TARGETS.select, variables: ["--map-point-select-min-height"] }
  }
};

const NEW_OFFSET_SECTIONS = new Set(["pointBands", "selectRows", "selectControl"]);

function getOffsetTargetElement(element, target) {
  return target === POINT_UI_OFFSET_TARGETS.select
    ? element.querySelector(".point-selects") || element
    : element;
}

function collectPointUiOffsetRules(offsets = {}) {
  const rulesByVariable = new Map();

  Object.entries(offsets).forEach(([targetType, targetOffsets]) => {
    const targetVars = POINT_UI_COMPAT_OFFSET_VARS[targetType];
    if (!targetVars || !targetOffsets) return;

    Object.entries(targetOffsets).forEach(([property, offset]) => {
      const rule = targetVars[property];
      if (!rule) return;
      const isSharedOffset = targetType === "pointStack";
      const isNewOffset = rule.isNewOffset || NEW_OFFSET_SECTIONS.has(targetType);

      rule.variables.forEach(variableName => {
        const existingRule = rulesByVariable.get(variableName);
        if (existingRule && !existingRule.isSharedOffset && isSharedOffset) return;
        if (existingRule?.isNewOffset && !isNewOffset && !existingRule.isSharedOffset) return;

        rulesByVariable.set(variableName, {
          isNewOffset,
          isSharedOffset,
          offset,
          sourceVariable: rule.sourceVariable || variableName,
          target: rule.target,
          variableName
        });
      });
    });
  });

  return Array.from(rulesByVariable.values());
}

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

  collectPointUiOffsetRules(offsets).forEach(({ target, variableName, sourceVariable, offset }) => {
    const baseValue = getCssPxNumber(baseVars[sourceVariable]);
    if (baseValue === null) return;
    // Offsets are additive deltas from the base CSS custom property.
    const finalValue = formatCssPx(baseValue + offset);
    getOffsetTargetElement(element, target).style.setProperty(variableName, finalValue);
  });
}

export function clearPointUiOffsets(element) {
  Object.values(POINT_UI_OFFSET_VARS).forEach(targetVars => {
    Object.values(targetVars).forEach(variableName => {
      element.style.removeProperty(variableName);
    });
  });
  element.style.removeProperty("--map-point-band-height");
  element.style.removeProperty("--map-point-band-gap");

  const selectGroup = element.querySelector(".point-selects");
  if (selectGroup) {
    Object.values(POINT_UI_OFFSET_VARS.select).forEach(variableName => {
      selectGroup.style.removeProperty(variableName);
    });
    selectGroup.style.removeProperty("--map-point-select-row-height");
    selectGroup.style.removeProperty("--map-point-select-min-height");
    selectGroup.style.removeProperty("--map-point-select-gap");
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

    const { bannerTextOffset: textOffset } = getPointLayout(placement.pointId, undefined, width);
    setMapImagePosition(
      label,
      placement.x + textOffset.x,
      placement.y + textOffset.y
    );
  });
}
