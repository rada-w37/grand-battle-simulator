// Global State Variables
export let worldGroupData = [];
export let currentBattleData = null;
export let currentGuilds = [];
export let pendingGuilds = [];
export let pendingSelectStates = [];
export let occupationTabs = [];
export let activeTabId = "";
export let editingTabId = "";
export let contextMenuTabId = "";
export let suppressNextMenuClose = false;
export let expandedWorldRangeKeys = new Set();
export let isInteractingWithWorldSuggestions = false;
export let isSelectingWorldSuggestion = false;
export let statusTimer = 0;
export let hasUnappliedBattleData = false;
export let activeMobilePoint = null;
export let highlightedGuildName = "";

// DOM Elements
export const elements = {};

// State Setters (for reassignment)
export function setWorldGroupData(value) {
  worldGroupData = value;
  return worldGroupData;
}

export function setCurrentBattleData(value) {
  currentBattleData = value;
  return currentBattleData;
}

export function setCurrentGuilds(value) {
  currentGuilds = value;
  return currentGuilds;
}

export function setPendingGuilds(value) {
  pendingGuilds = value;
  return pendingGuilds;
}

export function setPendingSelectStates(value) {
  pendingSelectStates = value;
  return pendingSelectStates;
}

export function setOccupationTabs(value) {
  occupationTabs = value;
  return occupationTabs;
}

export function setActiveTabId(value) {
  activeTabId = value;
  return activeTabId;
}

export function setEditingTabId(value) {
  editingTabId = value;
  return editingTabId;
}

export function setContextMenuTabId(value) {
  contextMenuTabId = value;
  return contextMenuTabId;
}

export function setSuppressNextMenuClose(value) {
  suppressNextMenuClose = value;
  return suppressNextMenuClose;
}

export function setExpandedWorldRangeKeys(value) {
  expandedWorldRangeKeys = value;
  return expandedWorldRangeKeys;
}

export function setIsInteractingWithWorldSuggestions(value) {
  isInteractingWithWorldSuggestions = value;
  return isInteractingWithWorldSuggestions;
}

export function setIsSelectingWorldSuggestion(value) {
  isSelectingWorldSuggestion = value;
  return isSelectingWorldSuggestion;
}

export function setStatusTimer(value) {
  statusTimer = value;
  return statusTimer;
}

export function setHasUnappliedBattleData(value) {
  hasUnappliedBattleData = value;
  return hasUnappliedBattleData;
}

export function setActiveMobilePoint(value) {
  activeMobilePoint = value;
  return activeMobilePoint;
}

export function setHighlightedGuildName(value) {
  highlightedGuildName = value;
  return highlightedGuildName;
}

// Initialize DOM Elements
export function initializeElements() {
  elements.server = document.getElementById("server-select");
  elements.world = document.getElementById("world-input");
  elements.worldOptions = document.getElementById("world-options");
  elements.worldSuggestions = document.getElementById("world-suggestions");
  elements.battleClass = document.getElementById("class-select");
  elements.block = document.getElementById("block-select");
  elements.guildGrid = document.getElementById("guild-grid");
  elements.statusMessage = document.getElementById("status-message");
  elements.pendingMessage = document.getElementById("pending-message");
  elements.cumulativeScope = document.getElementById("cumulative-scope");
  elements.applyButton = document.getElementById("apply-data-button");
  elements.scoreBody = document.getElementById("score-body");
  elements.battlePoints = document.getElementById("battle-points");
  elements.occupationTabs = document.getElementById("occupation-tabs");
  elements.tabAddButton = document.getElementById("tab-add-button");
  elements.deleteTabButton = document.getElementById("delete-tab-button");
  elements.resetDataButton = document.getElementById("reset-data-button");
  elements.mobilePointPicker = document.getElementById("mobile-point-picker");
  elements.mobilePointPickerTitle = document.getElementById("mobile-point-picker-title");
  elements.mobilePointPickerOptions = document.getElementById("mobile-point-picker-options");
  elements.mobilePointPickerClose = document.getElementById("mobile-point-picker-close");
}
