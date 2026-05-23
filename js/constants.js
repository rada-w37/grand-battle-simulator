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
export const GUILD_COLORS = ["#6f3a38", "#3f465d", "#3f5a43", "#5d5637"];
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

export {
  MAP_IMAGE_SIZE,
  BATTLE_POINTS,
  POINT_AURA_COORDINATES,
  MAP_STRUCTURE_PLACEMENTS,
  MAP_BANNER_PLACEMENTS
} from "./layout/layout-config.js?v=20260523-layout-cache";
