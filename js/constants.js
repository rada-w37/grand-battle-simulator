// API Configuration
export const API_BASE_URL = "https://api.mentemori.icu";

// Storage Keys
export const STORAGE_KEYS = {
  selectStates: "selectStates",
  battleSelection: "battleSelection",
  occupationTabs: "occupationTabs",
  appliedGuilds: "appliedGuilds"
};

// Guild Colors
export const GUILD_COLORS = ["#ff9999", "#9999ff", "#99ff99", "#ffff99"];
export const GUILD_MARKER_COLORS = ["#ff4d5a", "#5f72ff", "#26c85a", "#f2b600"];
export const GUILD_AURA_COLORS = ["#e31a0b", "#084dd9", "#80de0e", "#f5c711"];
export const EMPTY_POINT_COLOR = "rgba(255, 255, 255, 0.86)";

// Guild Icons
export const GUILD_MARKER_ICONS = [
  '<svg class="marker-icon marker-diamond" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 7-8 11-8-11 8-7z"/><path d="M4 10h16"/><path d="M9 10l3 11 3-11"/><path d="M8 4l4 6 4-6"/></svg>',
  '<svg class="marker-icon marker-teardrop" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4 4.4 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2-6.6 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/></svg>',
  '<svg class="marker-icon marker-crystal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M12 3v18"/><path d="M5 7l7 4 7-4"/><path d="M5 17l7-6 7 6"/></svg>',
  '<svg class="marker-icon marker-star-gem" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.4 5.7L20 11l-5.6 2.3L12 19l-2.4-5.7L4 11l5.6-2.3L12 3z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>'
];

export const SWORD_MARKER_ICON = '<span class="sword-marker-icon" aria-hidden="true"></span>';

// Point Scores
export const POINT_SCORES = {
  temple: 4,
  castle: 2,
  church: 1
};

// Map Configuration
export const MAP_IMAGE_SIZE = {
  width: 1293,
  height: 1217
};

// Battle Points
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

// Point Aura Coordinates
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
  larimal: { x: 752, y: 1127 },
  tiferet: { x: 491, y: 430 },
  yesod: { x: 812, y: 498 },
  keter: { x: 425, y: 717 },
  malkuth: { x: 761, y: 712 },
  ein: { x: 648, y: 554 }
};

// Map Structure Placements
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

// Map Banner Placements
export const MAP_BANNER_PLACEMENTS = [
  { pointId: "ganette", name: "ガネット", x: 198, y: 274, scale: 10.9 },
  { pointId: "laven", name: "ラペン", x: 310, y: 1009, scale: 10.9 },
  { pointId: "cushel", name: "クシェル", x: 698, y: 280, scale: 10.9 },
  { pointId: "amest", name: "アメト", x: 566, y: 872, scale: 10.9 },
  { pointId: "meral", name: "メラル", x: 1118, y: 584, scale: 10.9 },
  { pointId: "yesod", name: "イエソド", x: 814, y: 528, scale: 10.9 },
  { pointId: "tiferet", name: "テファレト", x: 486, y: 464, scale: 10.9 },
  { pointId: "toppaz", name: "トパズ", x: 1158, y: 416, scale: 10.9 },
  { pointId: "keter", name: "ケテル", x: 422, y: 754, scale: 10.9 },
  { pointId: "marin", name: "マリン", x: 526, y: 1031, scale: 10.9 },
  { pointId: "ein", name: "アイン", x: 646, y: 592, scale: 10.9 },
  { pointId: "lapis", name: "ラピス", x: 918, y: 904, scale: 10.9 },
  { pointId: "rula", name: "ルラ", x: 500, y: 171, scale: 10.9 },
  { pointId: "malkuth", name: "マルクト", x: 755, y: 746, scale: 10.9 },
  { pointId: "pharia", name: "ファリア", x: 902, y: 190, scale: 10.9 },
  { pointId: "citri", name: "シトリ", x: 998, y: 316, scale: 10.9 },
  { pointId: "perido", name: "ペリド", x: 969, y: 646, scale: 10.9 },
  { pointId: "larimal", name: "ラリマル", x: 751, y: 1157, scale: 10.9 },
  { pointId: "zircon", name: "ジルコン", x: 251, y: 748, scale: 10.9 },
  { pointId: "onyx", name: "オニキス", x: 111, y: 621, scale: 10.9 },
  { pointId: "floryte", name: "フロライト", x: 261, y: 436, scale: 10.9 }
];
