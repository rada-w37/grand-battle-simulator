import { GUILD_COLORS, GUILD_MARKER_COLORS, GUILD_AURA_COLORS, EMPTY_POINT_COLOR, STORAGE_KEYS, POINT_SCORES } from "./constants.js?v=20260524-select-debug";
import { BATTLE_POINTS } from "./layout/layout-config.js?v=20260524-select-debug";
import { basePxToPercent } from "./layout/layout-coordinate.js?v=20260524-select-debug";
import * as state from "./state.js?v=20260524-select-debug";

// Storage Utilities
export function parseStoredJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
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

// State Normalization
export function normalizePointState(state) {
  if (typeof state === "string") {
    return { defender: state, attacker: "" };
  }

  if (!state || typeof state !== "object") {
    return { defender: "", attacker: "" };
  }

  return {
    defender: state.defender || state.guildName || state.defender || "",
    attacker: state.attacker || state.attackerGuildName || ""
  };
}

export function cloneOccupationStates(states = createEmptyOccupationStates()) {
  return BATTLE_POINTS.map((_, index) => ({ ...normalizePointState(states[index]) }));
}

export function createEmptyOccupationStates() {
  return BATTLE_POINTS.map(() => ({ defender: "", attacker: "" }));
}

// Guild Utilities
export function getGuildEntries() {
  return state.currentGuilds
    .map((name, index) => ({
      name,
      color: GUILD_COLORS[index]
    }))
    .filter(guild => guild.name !== "");
}

export function getGuildIndex(guildName) {
  return getGuildEntries().findIndex(guild => guild.name === guildName) + 1;
}

export function getColorForGuildName(guildName) {
  const match = getGuildEntries().find(guild => guild.name === guildName);
  return match?.color || EMPTY_POINT_COLOR;
}

export function getAuraColorForGuildName(guildName) {
  const index = getGuildIndex(guildName);
  return index ? GUILD_AURA_COLORS[index - 1] : "transparent";
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

// World Utilities
export function normalizeWorldName(value) {
  const trimmed = value.normalize("NFKC").trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^w?\s*0*(\d+)$/i);
  if (!match) return trimmed.toUpperCase();

  return `W${Number(match[1])}`;
}

// Map Utilities
export function setMapImagePosition(element, x, y) {
  const { leftPercent, topPercent } = basePxToPercent(x, y);
  element.style.left = `${leftPercent}%`;
  element.style.top = `${topPercent}%`;
}

// Score Utilities
export function createScoreCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  if (className) cell.className = className;
  return cell;
}

export function createEmptyScores(guildNames) {
  return Object.fromEntries(guildNames.map(name => [
    name,
    { total: 0, temple: 0, castle: 0, church: 0 }
  ]));
}

export function addPointScore(scores, guildName, type) {
  if (!guildName || !(guildName in scores)) return;

  scores[guildName][type] += 1;
  scores[guildName].total += POINT_SCORES[type] || 0;
}
