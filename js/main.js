import * as state from "./state.js?v=20260810-map-score";
import * as api from "./api.js?v=20260810-map-score";
import * as ui from "./ui.js?v=20260810-map-score";
import { bindEvents } from "./events.js?v=20260810-map-score";
import { applyMapLayoutCssVars } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import { getLayoutViewport } from "./layout/layout-coordinate.js?v=20260524-visibility-toggles";

let currentLayoutViewport = getLayoutViewport(window.innerWidth);
let layoutViewportTimer = 0;

function refreshLayoutForViewportChange() {
  window.clearTimeout(layoutViewportTimer);
  layoutViewportTimer = window.setTimeout(() => {
    const nextLayoutViewport = getLayoutViewport(window.innerWidth);
    applyMapLayoutCssVars();

    if (nextLayoutViewport === currentLayoutViewport) return;

    currentLayoutViewport = nextLayoutViewport;
    ui.refreshMapLayout();
  }, 150);
}

function bindMapLayoutConfigEvents() {
  window.addEventListener("resize", refreshLayoutForViewportChange);
  window.addEventListener("orientationchange", refreshLayoutForViewportChange);
}

function shouldEnableDevLayoutEditor() {
  return new URLSearchParams(window.location.search).get("devLayout") === "1";
}

// Initialize Application
async function initializeApp() {
  state.initializeElements();

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
    const { initDevLayoutEditor } = await import("./dev/dev-layout-editor.js?v=20260524-visibility-toggles");
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
