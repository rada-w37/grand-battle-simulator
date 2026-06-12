// Map layout configuration
// Phase 0: Keep current visual behavior while centralizing tunable map UI values.

import { BATTLE_POINTS, POINT_AURA_COORDINATES } from "./base.js?v=20260524-visibility-toggles";
import { MAP_STRUCTURE_PLACEMENTS, MAP_BANNER_PLACEMENTS } from "./decorations.js?v=20260524-visibility-toggles";
import { MAP_POINT_UI_OFFSETS } from "./point-offsets.js?v=20260524-visibility-toggles";
import { MAP_LAYOUT_CSS_VARS } from "./viewport.js?v=20260524-visibility-toggles";

export const LAYOUT_TARGET_UPDATE_RULES = {
  BATTLE_POINTS: {
    point: {
      configKey: "BATTLE_POINTS",
      findBy: "id",
      updateProperties: ["left", "top"],
      coordinateSpace: "percent",
      updateMode: "point"
    }
  },
  POINT_AURA_COORDINATES: {
    aura: {
      configKey: "POINT_AURA_COORDINATES",
      findBy: "pointId",
      updateProperties: ["x", "y"],
      coordinateSpace: "mapPx",
      updateMode: "point"
    }
  },
  MAP_STRUCTURE_PLACEMENTS: {
    structure: {
      configKey: "MAP_STRUCTURE_PLACEMENTS",
      findBy: "pointId",
      updateProperties: ["x", "y", "scale"],
      coordinateSpace: "mapPxAndPercentScale",
      updateMode: "point"
    }
  },
  MAP_BANNER_PLACEMENTS: {
    banner: {
      configKey: "MAP_BANNER_PLACEMENTS",
      findBy: "pointId",
      updateProperties: ["x", "y", "scale"],
      coordinateSpace: "mapPxAndPercentScale",
      updateMode: "point"
    },
    pointName: {
      configKey: "MAP_BANNER_PLACEMENTS",
      findBy: "pointId",
      updateProperties: ["textOffsets.{viewport}.x", "textOffsets.{viewport}.y"],
      coordinateSpace: "mapPxOffsetFromBanner",
      updateMode: "textOffset"
    },
    pointNameLabel: {
      configKey: "MAP_BANNER_PLACEMENTS",
      findBy: "pointId",
      updateProperties: ["textOffsets.{viewport}.x", "textOffsets.{viewport}.y"],
      coordinateSpace: "mapPxOffsetFromBanner",
      updateMode: "textOffset"
    }
  },
  MAP_LAYOUT_CSS_VARS: {
    shield: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: ["shield.x", "shield.y", "shield.size"],
      coordinateSpace: "cssPxOffsetFromBase",
      updateMode: "pointOffset"
    },
    sword: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: ["sword.x", "sword.y", "sword.size"],
      coordinateSpace: "cssPxOffsetFromBase",
      updateMode: "pointOffset"
    },
    pointLabels: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: [
        "pointLabels.x",
        "pointLabels.y",
        "pointLabels.width",
        "pointLabels.height"
      ],
      coordinateSpace: "cssPxOffsetFromBase",
      updateMode: "pointOffset"
    },
    attackerSelect: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: [
        "select.x",
        "select.y",
        "select.width",
        "select.height"
      ],
      coordinateSpace: "cssPxOffsetFromPointCenter",
      updateMode: "pointOffset"
    },
    defenderSelect: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: [
        "select.x",
        "select.y",
        "select.width",
        "select.height"
      ],
      coordinateSpace: "cssPxOffsetFromPointCenter",
      updateMode: "pointOffset"
    },
    select: {
      configKey: "MAP_POINT_UI_OFFSETS",
      findBy: "pointId",
      updateProperties: [
        "select.x",
        "select.y",
        "select.width",
        "select.height"
      ],
      coordinateSpace: "cssPxOffsetFromPointCenter",
      updateMode: "pointOffset"
    }
  }
};

function getLayoutTargetRule(layoutKey, targetType) {
  return LAYOUT_TARGET_UPDATE_RULES[layoutKey]?.[targetType] || null;
}

export function resolveLayoutTarget({ layoutKey, pointId, targetType, viewport }) {
  if (!viewport) {
    return {
      resolved: false,
      skipReason: "viewport is required"
    };
  }

  const rule = getLayoutTargetRule(layoutKey, targetType);
  if (!rule) {
    return {
      resolved: false,
      skipReason: `No update rule for layoutKey=${layoutKey}, targetType=${targetType}`
    };
  }

  if (layoutKey === "BATTLE_POINTS") {
    const index = BATTLE_POINTS.findIndex(point => point.id === pointId);
    return index >= 0
      ? { resolved: true, ...rule, configPath: `BATTLE_POINTS[${index}]`, index }
      : { resolved: false, ...rule, skipReason: `BATTLE_POINTS entry not found for pointId=${pointId}` };
  }

  if (layoutKey === "POINT_AURA_COORDINATES") {
    return POINT_AURA_COORDINATES[pointId]
      ? { resolved: true, ...rule, configPath: `POINT_AURA_COORDINATES.${pointId}` }
      : { resolved: false, ...rule, skipReason: `POINT_AURA_COORDINATES entry not found for pointId=${pointId}` };
  }

  if (layoutKey === "MAP_STRUCTURE_PLACEMENTS") {
    const index = MAP_STRUCTURE_PLACEMENTS.findIndex(placement => placement.pointId === pointId);
    return index >= 0
      ? { resolved: true, ...rule, configPath: `MAP_STRUCTURE_PLACEMENTS[${index}]`, index }
      : { resolved: false, ...rule, skipReason: `MAP_STRUCTURE_PLACEMENTS entry not found for pointId=${pointId}` };
  }

  if (layoutKey === "MAP_BANNER_PLACEMENTS") {
    const index = MAP_BANNER_PLACEMENTS.findIndex(placement => placement.pointId === pointId);
    const resolvedRule = rule.updateMode === "textOffset"
      ? {
        ...rule,
        updateProperties: [`textOffsets.${viewport}.x`, `textOffsets.${viewport}.y`]
      }
      : rule;
    return index >= 0
      ? {
        resolved: true,
        ...resolvedRule,
        configPath: rule.updateMode === "textOffset"
          ? `MAP_BANNER_PLACEMENTS[${index}].textOffsets.${viewport}`
          : `MAP_BANNER_PLACEMENTS[${index}]`,
        index
      }
      : { resolved: false, ...resolvedRule, skipReason: `MAP_BANNER_PLACEMENTS entry not found for pointId=${pointId}` };
  }

  if (layoutKey === "MAP_LAYOUT_CSS_VARS") {
    if (rule.configKey === "MAP_POINT_UI_OFFSETS") {
      const section = ["select", "attackerSelect", "defenderSelect"].includes(targetType)
        ? ".select"
        : "";
      return MAP_POINT_UI_OFFSETS[viewport]
        ? { resolved: true, ...rule, configPath: `MAP_POINT_UI_OFFSETS.${viewport}.${pointId}${section}` }
        : { resolved: false, ...rule, skipReason: `MAP_POINT_UI_OFFSETS viewport not found: ${viewport}` };
    }

    return MAP_LAYOUT_CSS_VARS[viewport]
      ? { resolved: true, ...rule, configPath: `MAP_LAYOUT_CSS_VARS.${viewport}` }
      : { resolved: false, ...rule, skipReason: `MAP_LAYOUT_CSS_VARS viewport not found: ${viewport}` };
  }

  return {
    resolved: false,
    ...rule,
    skipReason: `Unknown layoutKey=${layoutKey}`
  };
}
