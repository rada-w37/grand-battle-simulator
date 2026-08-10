import * as state from "./state.js?v=20260810-map-score";
import { getActiveTab } from "./utils.js?v=20260810-map-score";
import { renameGuildReferences as renameDomainGuildReferences } from "./domain/guilds.js?v=20260810-map-score";
import { removeStorageItem, setStorageItem, STORAGE_KEYS } from "./infrastructure/storage.js?v=20260524-visibility-toggles";
import { saveAppliedGuilds, renderGuildGrid, updateGuildOptions, applySelectStates, updateScores, persistCurrentTabState, saveOccupationTabs } from "./ui.js?v=20260810-map-score";

function saveHighlightedGuildName(guildName) {
  if (guildName) {
    setStorageItem(STORAGE_KEYS.highlightedGuildName, guildName);
  } else {
    removeStorageItem(STORAGE_KEYS.highlightedGuildName);
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
  const result = renameDomainGuildReferences({
    occupationTabs: state.occupationTabs,
    pendingSelectStates: state.pendingSelectStates,
    highlightedGuildName: state.highlightedGuildName,
    previousNames,
    nextNames
  });
  if (!result.changed) return;

  state.setOccupationTabs(result.occupationTabs);
  state.setPendingSelectStates(result.pendingSelectStates);

  if (result.highlightedGuildName !== state.highlightedGuildName) {
    state.setHighlightedGuildName(result.highlightedGuildName);
    saveHighlightedGuildName(result.highlightedGuildName);
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
