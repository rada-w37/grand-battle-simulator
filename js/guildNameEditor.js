import { STORAGE_KEYS } from "./constants.js?v=20260524-visibility-toggles";
import * as state from "./state.js?v=20260524-visibility-toggles";
import { getActiveTab, normalizePointState } from "./utils.js?v=20260524-visibility-toggles";
import { saveAppliedGuilds, renderGuildGrid, updateGuildOptions, applySelectStates, updateScores, persistCurrentTabState, saveOccupationTabs } from "./ui.js?v=20260524-visibility-toggles";

function saveHighlightedGuildName(guildName) {
  if (guildName) {
    localStorage.setItem(STORAGE_KEYS.highlightedGuildName, guildName);
  } else {
    localStorage.removeItem(STORAGE_KEYS.highlightedGuildName);
  }
}
export function getEditableGuildNames() {
  return Array.from({ length: 4 }, (_, index) => state.currentGuilds[index] || `ギルド${index + 1}`);
}

export function updateGuildNameEditControls() {
  state.elements.editGuildNamesButton.hidden = state.isEditingGuildNames;
  state.elements.confirmGuildNamesButton.hidden = !state.isEditingGuildNames;
  state.elements.cancelGuildNamesButton.hidden = !state.isEditingGuildNames;
}

function renameGuildReferences(previousNames, nextNames) {
  const nameMap = new Map(previousNames.map((name, index) => [name, nextNames[index]]).filter(([from, to]) => from && to && from !== to));
  if (nameMap.size === 0) return;

  const renameState = pointState => ({
    defender: nameMap.get(pointState.defender) || pointState.defender,
    attacker: nameMap.get(pointState.attacker) || pointState.attacker
  });

  state.occupationTabs.forEach(tab => {
    tab.selectStates = tab.selectStates.map(pointState => renameState(normalizePointState(pointState)));
  });
  state.setPendingSelectStates(state.pendingSelectStates.map(pointState => renameState(normalizePointState(pointState))));

  if (nameMap.has(state.highlightedGuildName)) {
    const nextHighlightedGuildName = nameMap.get(state.highlightedGuildName);
    state.setHighlightedGuildName(nextHighlightedGuildName);
    saveHighlightedGuildName(nextHighlightedGuildName);
  }
}

export function startGuildNameEditing() {
  state.setGuildNameDrafts(getEditableGuildNames());
  state.setIsEditingGuildNames(true);
  updateGuildNameEditControls();
  updateScores();
}

export function cancelGuildNameEditing() {
  state.setGuildNameDrafts([]);
  state.setIsEditingGuildNames(false);
  updateGuildNameEditControls();
  updateScores();
}

export function confirmGuildNameEditing() {
  persistCurrentTabState();
  const previousNames = getEditableGuildNames();
  const nextNames = previousNames.map((name, index) => {
    const draft = (state.guildNameDrafts[index] || "").trim();
    return draft || name;
  });

  renameGuildReferences(previousNames, nextNames);
  state.setCurrentGuilds(nextNames);
  saveAppliedGuilds();
  saveOccupationTabs();
  renderGuildGrid(state.currentGuilds);
  state.setGuildNameDrafts([]);
  state.setIsEditingGuildNames(false);
  updateGuildNameEditControls();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
  updateScores();
}
