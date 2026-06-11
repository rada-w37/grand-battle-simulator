import { GUILD_COLORS, GUILD_MARKER_COLORS, GUILD_AURA_COLORS, EMPTY_POINT_COLOR } from "./constants.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import { basePxToPercent } from "./layout/layout-coordinate.js?v=20260524-visibility-toggles";
import * as state from "./state.js?v=20260524-visibility-toggles";
import { readJsonStorage } from "./infrastructure/storage.js?v=20260524-visibility-toggles";
import {
  getAuraColorForGuildName as getAuraColorForGuildNameFromEntries,
  getColorForGuildName as getColorForGuildNameFromEntries,
  getGuildEntries as createGuildEntries,
  getGuildIndex as getGuildIndexFromEntries
} from "./domain/guilds.js?v=20260524-visibility-toggles";
import {
  cloneOccupationStates as cloneDomainOccupationStates,
  createEmptyOccupationStates as createDomainEmptyOccupationStates,
  normalizePointState
} from "./domain/occupation-state.js?v=20260524-visibility-toggles";
export {
  addPointScore,
  createEmptyScores
} from "./domain/scoring.js?v=20260524-visibility-toggles";
export {
  normalizeWorldName
} from "./domain/worlds.js?v=20260524-visibility-toggles";

export { normalizePointState };

// Storage Utilities
export function parseStoredJson(key, fallback) {
  return readJsonStorage(key, fallback);
}

// DOM Utilities
export function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

export function getPointSelects() {
  return Array.from(document.querySelectorAll(".point-defender-select"));
}

export function getAllPointSelects() {
  return Array.from(document.querySelectorAll(".point select"));
}

export function cloneOccupationStates(states = createEmptyOccupationStates()) {
  return cloneDomainOccupationStates(states, BATTLE_POINTS);
}

export function createEmptyOccupationStates() {
  return createDomainEmptyOccupationStates(BATTLE_POINTS);
}

// Guild Utilities
export function getGuildEntries() {
  return createGuildEntries(state.currentGuilds, GUILD_COLORS);
}

export function getGuildIndex(guildName) {
  return getGuildIndexFromEntries(getGuildEntries(), guildName);
}

export function getColorForGuildName(guildName) {
  return getColorForGuildNameFromEntries(getGuildEntries(), guildName, EMPTY_POINT_COLOR);
}

export function getAuraColorForGuildName(guildName) {
  return getAuraColorForGuildNameFromEntries(getGuildEntries(), guildName, GUILD_AURA_COLORS);
}

// Tab Utilities
export function getTabDayNumber(tab) {
  const match = String(tab.name || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function getNextTabDayNumber() {
  return Math.max(0, ...state.occupationTabs.map(getTabDayNumber)) + 1;
}

export function getActiveTab() {
  return state.occupationTabs.find(tab => tab.id === state.activeTabId) || state.occupationTabs[0];
}

// Map Utilities
export function setMapImagePosition(element, x, y) {
  const { leftPercent, topPercent } = basePxToPercent(x, y);
  element.style.left = `${leftPercent}%`;
  element.style.top = `${topPercent}%`;
}

// DOM Score Utilities
export function createScoreCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  if (className) cell.className = className;
  return cell;
}
