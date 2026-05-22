import * as state from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";
import { bindEvents } from "./events.js";
import { applyMapLayoutCssVars } from "./layout-config.js";

function bindMapLayoutConfigEvents() {
  window.addEventListener("resize", () => {
    applyMapLayoutCssVars();
  });
}

function shouldEnableDevLayoutEditor() {
  return new URLSearchParams(window.location.search).get("devLayout") === "1";
}

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
  applyMapLayoutCssVars();
  ui.renderEmptyGuildGrid();
  ui.renderBattlePoints();
  ui.loadAppliedGuilds();
  ui.loadOccupationTabs();
  ui.renderOccupationTabs();
  ui.updateGuildOptions();
  ui.restoreSelectStates();
  ui.updateScores();
  bindEvents();
  bindMapLayoutConfigEvents();

  if (shouldEnableDevLayoutEditor()) {
    const { initDevLayoutEditor } = await import("./dev-layout-editor.js");
    initDevLayoutEditor();
  }

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
