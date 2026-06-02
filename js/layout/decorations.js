// Map layout configuration
// Phase 0: Keep current visual behavior while centralizing tunable map UI values.

import { getLayoutViewport } from "./layout-coordinate.js?v=20260524-visibility-toggles";

export const MAP_LABEL_LAYOUT = {
  translateY: "-1px",
  scaleDivisor: 35
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
