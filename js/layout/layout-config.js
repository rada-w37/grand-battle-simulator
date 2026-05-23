// Map layout configuration
// Phase 0: Keep current visual behavior while centralizing tunable map UI values.

import { MAP_LAYOUT_BREAKPOINT, getLayoutViewport } from "./layout-coordinate.js?v=20260524-visibility-toggles";

export const MAP_IMAGE_SIZE = {
  width: 1293,
  height: 1217
};

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
    "--map-point-labels-height": "50px",
    "--map-point-labels-gap": "2px",
    "--map-point-band-width": "100px",
    "--map-point-band-height": "24px",
    "--map-point-band-radius": "3px",
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

export const MAP_POINT_UI_OFFSETS = {
  desktop: {
    citri: {
      pointLabels: { x: 4, y: 6 },
      sword: { x: 4, y: 6 },
      shield: { x: 4, y: 6 }
    },
    perido: {
      pointLabels: { y: 4 },
      sword: { y: 4 },
      shield: { y: 4 }
    },
    meral: {
      pointLabels: { x: 6, y: -4 },
      sword: { x: 6, y: -4 },
      shield: { x: 6, y: -4 }
    },
    zircon: {
      pointLabels: { x: -4, y: 2 },
      sword: { x: -3, y: 2 },
      shield: { x: -3, y: 2 }
    },
    yesod: {
      pointLabels: { x: 4, y: -4 },
      sword: { x: 4, y: -4 },
      shield: { x: 4, y: -4 }
    },
    keter: {
      pointLabels: { x: 4 },
      sword: { x: 4 },
      shield: { x: 4 }
    },
    ein: {
      pointLabels: { y: 6 },
      sword: { y: 6 },
      shield: { y: 6 }
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

export const MAP_LABEL_LAYOUT = {
  translateY: "-1px",
  scaleDivisor: 35
};

export const BATTLE_POINTS = [
  { top: 14.87, left: 15.35, type: "church", id: "ganette", castleId: 20 },
  { top: 6.46, left: 38.69, type: "church", id: "rula", castleId: 21 },
  { top: 15.33, left: 54.03, type: "church", id: "cushel", castleId: 6 },
  { top: 7.97, left: 69.74, type: "church", id: "pharia", castleId: 11 },
  { top: 18.29, left: 77.16, type: "church", id: "citri", castleId: 7 },
  { top: 28.3, left: 20.27, type: "church", id: "floryte", castleId: 19 },
  { top: 26.7, left: 89.58, type: "church", id: "toppaz", castleId: 8 },
  { top: 45.51, left: 75.09, type: "church", id: "perido", castleId: 10 },
  { top: 40.58, left: 86.72, type: "church", id: "meral", castleId: 9 },
  { top: 43.47, left: 8.64, type: "church", id: "onyx", castleId: 18 },
  { top: 54.01, left: 19.49, type: "church", id: "zircon", castleId: 17 },
  { top: 64.24, left: 43.75, type: "church", id: "amest", castleId: 15 },
  { top: 66.98, left: 70.88, type: "church", id: "lapis", castleId: 12 },
  { top: 75.39, left: 24.13, type: "church", id: "laven", castleId: 16 },
  { top: 77.21, left: 40.61, type: "church", id: "marin", castleId: 14 },
  { top: 87.6, left: 58.17, type: "church", id: "larimal", castleId: 13 },
  { top: 29.81, left: 37.83, type: "castle", id: "tiferet", castleId: 5 },
  { top: 35.2, left: 62.81, type: "castle", id: "yesod", castleId: 2 },
  { top: 53.7, left: 32.62, type: "castle", id: "keter", castleId: 4 },
  { top: 53.17, left: 58.46, type: "castle", id: "malkuth", castleId: 3 },
  { top: 40.05, left: 50.04, type: "temple", id: "ein", castleId: 1 }
];

export const POINT_AURA_COORDINATES = {
  ganette: { x: 196, y: 243 },
  rula: { x: 500, y: 141 },
  cushel: { x: 698, y: 253 },
  pharia: { x: 902, y: 155 },
  citri: { x: 999, y: 284 },
  floryte: { x: 262, y: 410 },
  toppaz: { x: 1164, y: 385 },
  perido: { x: 974, y: 610 },
  meral: { x: 1121, y: 555 },
  onyx: { x: 112, y: 593 },
  zircon: { x: 252, y: 718 },
  amest: { x: 567, y: 843 },
  lapis: { x: 918, y: 877 },
  laven: { x: 311, y: 977 },
  marin: { x: 527, y: 991 },
  larimal: { x: 752, y: 1126.8 },
  tiferet: { x: 491, y: 430 },
  yesod: { x: 812, y: 498 },
  keter: { x: 425, y: 717 },
  malkuth: { x: 761, y: 712 },
  ein: { x: 648, y: 554 }
};

export const MAP_STRUCTURE_PLACEMENTS = [
  { pointId: "ein", src: "resource/temple.png?v=lowres-1", className: "point-structure-temple", x: 648, y: 542, scale: 8.2 },
  { pointId: "tiferet", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 489, y: 419, scale: 6.2 },
  { pointId: "yesod", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 813, y: 485, scale: 6.2 },
  { pointId: "keter", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 422, y: 709, scale: 6.2 },
  { pointId: "malkuth", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 756, y: 702, scale: 6.2 },
  { pointId: "ganette", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 200, y: 235, scale: 7.4 },
  { pointId: "pharia", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 900, y: 154, scale: 7.4 },
  { pointId: "amest", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 564, y: 834, scale: 7.4 },
  { pointId: "marin", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 524, y: 994, scale: 7.4 },
  { pointId: "cushel", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 700, y: 242, scale: 7.4 },
  { pointId: "lapis", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 916, y: 866, scale: 7.4 },
  { pointId: "laven", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 316, y: 970, scale: 7.4 },
  { pointId: "larimal", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 753, y: 1117, scale: 7.4 },
  { pointId: "perido", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 972, y: 607, scale: 7.4 },
  { pointId: "meral", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 1123, y: 546, scale: 7.4 },
  { pointId: "toppaz", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 1159, y: 380, scale: 7.4 },
  { pointId: "citri", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 998, y: 278, scale: 7.4 },
  { pointId: "rula", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 499, y: 133, scale: 7.4 },
  { pointId: "floryte", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 261, y: 398, scale: 7.4 },
  { pointId: "onyx", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 111, y: 582, scale: 7.4 },
  { pointId: "zircon", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 251, y: 710, scale: 7.4 }
];

export const MAP_BANNER_PLACEMENTS = [
  { pointId: "ganette", name: "ガネット", x: 198, y: 274, scale: 10.9, textOffsetX: 0.05, textOffsetY: -1.6 },
  { pointId: "laven", name: "ラペン", x: 310, y: 1009, scale: 10.9, textOffsetX: 0.07, textOffsetY: -1.98 },
  { pointId: "cushel", name: "クシェル", x: 698, y: 280, scale: 10.9, textOffsetX: 0.18, textOffsetY: -1.6 },
  { pointId: "amest", name: "アメト", x: 566, y: 872, scale: 10.9, textOffsetX: 0.15, textOffsetY: -1.92 },
  { pointId: "meral", name: "メラル", x: 1118, y: 584, scale: 10.9, textOffsetX: 0.29, textOffsetY: -1.75 },
  { pointId: "yesod", name: "イエソド", x: 814, y: 528, scale: 10.9, textOffsetX: 0.2, textOffsetY: -1.73 },
  { pointId: "tiferet", name: "テファレト", x: 486, y: 464, scale: 10.9, textOffsetX: 0.12, textOffsetY: -1.69 },
  { pointId: "toppaz", name: "トパズ", x: 1158, y: 416, scale: 10.9, textOffsetX: 0.3, textOffsetY: -1.67 },
  { pointId: "keter", name: "ケテル", x: 422, y: 754, scale: 10.9, textOffsetX: 0.1, textOffsetY: -1.85 },
  { pointId: "marin", name: "マリン", x: 526, y: 1031, scale: 10.9, textOffsetX: 0.14, textOffsetY: -2 },
  { pointId: "ein", name: "アイン", x: 646, y: 592, scale: 10.9, textOffsetX: 0.17, textOffsetY: -1.77 },
  { pointId: "lapis", name: "ラピス", x: 918, y: 904, scale: 10.9, textOffsetX: 0.23, textOffsetY: -1.92 },
  { pointId: "rula", name: "ルラ", x: 500, y: 171, scale: 10.9, textOffsetX: 0.12, textOffsetY: -1.54 },
  { pointId: "malkuth", name: "マルクト", x: 755, y: 746, scale: 10.9, textOffsetX: 0.19, textOffsetY: -1.85 },
  { pointId: "pharia", name: "ファリア", x: 902, y: 190, scale: 10.9, textOffsetX: 0.23, textOffsetY: -1.55 },
  { pointId: "citri", name: "シトリ", x: 998, y: 316, scale: 10.9, textOffsetX: 0.26, textOffsetY: -1.62 },
  { pointId: "perido", name: "ペリド", x: 969, y: 646, scale: 10.9, textOffsetX: 0.24, textOffsetY: -1.8 },
  { pointId: "larimal", name: "ラリマル", x: 751, y: 1157, scale: 10.9, textOffsetX: 0.19, textOffsetY: -2.06 },
  { pointId: "zircon", name: "ジルコン", x: 251, y: 748, scale: 10.9, textOffsetX: 0.06, textOffsetY: -1.85 },
  { pointId: "onyx", name: "オニキス", x: 111, y: 621, scale: 10.9, textOffsetX: 0.02, textOffsetY: -1.78 },
  { pointId: "floryte", name: "フロライト", x: 261, y: 436, scale: 10.9, textOffsetX: 0.06, textOffsetY: -1.68 }
];

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

export function getMapLayoutCssVars(width = window.innerWidth) {
  const mode = getLayoutViewport(width);
  return { ...MAP_LAYOUT_CSS_VARS[mode] };
}

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

export function getBannerTextOffset(placement, viewport = getLayoutViewport()) {
  const viewportOffset = placement.textOffsets?.[viewport];
  if (viewportOffset) {
    return {
      x: viewportOffset.x ?? placement.textOffsetX ?? 0,
      y: viewportOffset.y ?? placement.textOffsetY ?? 0
    };
  }

  return {
    x: placement.textOffsetX ?? 0,
    y: placement.textOffsetY ?? 0
  };
}

export function applyMapLayoutCssVars(target = document.documentElement, width = window.innerWidth) {
  Object.entries(getMapLayoutCssVars(width)).forEach(([name, value]) => {
    target.style.setProperty(name, value);
  });
}
