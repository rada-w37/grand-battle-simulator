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
export let isEditingGuildNames = false;
export let guildNameDrafts = [];
export let usesFallbackGuilds = false;
export let occupationHistoryByTabId = {};
export let appliedBattleContext = null;
export let pendingBattleApplication = null;

export {
  elements,
  initializeElements
} from "./dom-elements.js?v=20260810-empty-row";

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

export function setIsEditingGuildNames(value) {
  isEditingGuildNames = value;
  return isEditingGuildNames;
}

export function setGuildNameDrafts(value) {
  guildNameDrafts = value;
  return guildNameDrafts;
}

export function setUsesFallbackGuilds(value) {
  usesFallbackGuilds = value;
  return usesFallbackGuilds;
}

export function setOccupationHistoryByTabId(value) {
  occupationHistoryByTabId = value;
  return occupationHistoryByTabId;
}

export function setAppliedBattleContext(value) {
  appliedBattleContext = value;
  return appliedBattleContext;
}

export function setPendingBattleApplication(value) {
  pendingBattleApplication = value;
  return pendingBattleApplication;
}
