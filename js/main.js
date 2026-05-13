import * as state from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";
import { bindEvents } from "./events.js";

// Initialize Application
async function initializeApp() {
  // Set up circular dependency bridges
  ui._setFetchBattleDataFn(api.fetchBattleDataIfReady);
  ui._setSetPendingStateFn(api.setPendingState);
  api._setUiFunctions({
    setStatus: ui.setStatus,
    renderGuildGrid: ui.renderGuildGrid,
    renderEmptyGuildGrid: ui.renderEmptyGuildGrid,
    updateGuildOptions: ui.updateGuildOptions,
    applySelectStates: ui.applySelectStates,
    updateWorldOptions: ui.updateWorldOptions
  });

  state.initializeElements();
  ui.renderEmptyGuildGrid();
  ui.renderBattlePoints();
  ui.loadAppliedGuilds();
  ui.loadOccupationTabs();
  ui.renderOccupationTabs();
  ui.updateGuildOptions();
  ui.restoreSelectStates();
  ui.updateScores();
  bindEvents();

  try {
    await api.loadGroups();
    api.restoreBattleSelection();
    await api.fetchBattleDataIfReady();
  } catch (error) {
    ui.setStatus(`初期化エラー: ${error.message}`, "error");
  }
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
