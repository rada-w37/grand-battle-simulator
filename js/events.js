import * as state from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";
import { getAllPointSelects, normalizeWorldName } from "./utils.js";

export function bindEvents() {
  document.addEventListener("click", event => {
    if (state.suppressNextMenuClose) return;
    if (!event.target.closest(".tab-context-menu")) ui.hideTabContextMenu();
    if (!event.target.closest(".combo-box")) ui.hideWorldSuggestions();
  });

  state.elements.server.addEventListener("change", () => {
    state.setExpandedWorldRangeKeys(new Set());
    ui.updateWorldOptions();
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("change", () => {
    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("input", ui.renderWorldSuggestions);

  state.elements.world.addEventListener("focus", ui.showWorldSuggestions);

  state.elements.world.addEventListener("blur", () => {
    if (state.isSelectingWorldSuggestion) {
      state.setIsSelectingWorldSuggestion(false);
      return;
    }

    if (state.isInteractingWithWorldSuggestions) {
      window.setTimeout(() => {
        state.setIsInteractingWithWorldSuggestions(false);
        state.elements.world.focus();
      }, 0);
      return;
    }

    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    api.fetchBattleDataIfReady();
  });

  state.elements.world.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    state.elements.world.value = normalizeWorldName(state.elements.world.value);
    ui.hideWorldSuggestions();
    api.fetchBattleDataIfReady();
  });

  state.elements.worldSuggestions.addEventListener("pointerdown", () => {
    state.setIsInteractingWithWorldSuggestions(true);
  });

  state.elements.worldSuggestions.addEventListener("mousedown", event => {
    event.preventDefault();
    event.stopPropagation();
    state.setIsInteractingWithWorldSuggestions(true);
  }, true);

  state.elements.worldSuggestions.addEventListener("click", event => {
    event.stopPropagation();
  });

  state.elements.worldSuggestions.addEventListener("touchstart", () => {
    state.setIsInteractingWithWorldSuggestions(true);
  }, { passive: true });

  state.elements.worldSuggestions.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      state.setIsInteractingWithWorldSuggestions(false);
    }, 0);
  });

  state.elements.worldSuggestions.addEventListener("pointercancel", () => {
    state.setIsInteractingWithWorldSuggestions(false);
  });

  state.elements.battleClass.addEventListener("change", api.fetchBattleDataIfReady);
  state.elements.block.addEventListener("change", api.fetchBattleDataIfReady);

  state.elements.applyButton.addEventListener("click", ui.applyBattleData);
  state.elements.deleteTabButton.addEventListener("click", ui.deleteActiveOccupationTab);
  state.elements.resetDataButton.addEventListener("click", ui.resetAllData);

  getAllPointSelects().forEach(select => {
    select.addEventListener("change", () => {
      const point = select.closest(".point");
      if (select.classList.contains("point-attacker-select")) {
        ui.updatePointDeclaration(point, select.value);
      } else {
        ui.setPointAura(point, select.value);
        ui.updatePointChip(point, select.value);
      }
      ui.updatePointSelfAttackState(point);
      ui.saveSelectStates();
      ui.updateScores();
    });
  });

}
