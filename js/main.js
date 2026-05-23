import * as state from "./state.js?v=20260524-step7";
import * as api from "./api.js?v=20260524-step7";
import * as ui from "./ui.js?v=20260524-step7";
import { bindEvents } from "./events.js?v=20260524-step7";
import { applyMapLayoutCssVars } from "./layout/layout-config.js?v=20260524-step7";

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
  ui.loadHighlightedGuildName();
  ui.loadOccupationTabs();
  ui.renderOccupationTabs();
  ui.updateGuildOptions();
  ui.restoreSelectStates();
  ui.updateScores();
  bindEvents();
  bindMapLayoutConfigEvents();

  if (shouldEnableDevLayoutEditor()) {
    const { initDevLayoutEditor } = await import("./dev/dev-layout-editor.js?v=20260524-step7");
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
