import * as state from "./state.js?v=20260810-data-apply";
import { createOption, normalizeWorldName } from "./utils.js?v=20260810-data-apply";
import { getGroupedWorldOptions, getFilteredWorldOptions } from "./api.js?v=20260810-data-apply";

function getRequiredElement(elementKey, id) {
  const element = state.elements[elementKey] || document.getElementById(id);
  if (element) {
    state.elements[elementKey] = element;
    return element;
  }

  console.warn(`Missing DOM element: #${id}`);
  return null;
}
// World Suggestions
export function hideWorldSuggestions() {
  state.elements.worldSuggestions.hidden = true;
}

export function showWorldSuggestions() {
  renderWorldSuggestions();
  state.elements.worldSuggestions.hidden = false;
}

export function selectWorld(world, fetchBattleDataIfReadyFn) {
  state.setIsSelectingWorldSuggestion(true);
  state.setIsInteractingWithWorldSuggestions(false);
  state.elements.world.value = world.id;
  hideWorldSuggestions();
  state.elements.world.blur();
  if (fetchBattleDataIfReadyFn) {
    fetchBattleDataIfReadyFn();
  }
}

// Internal function for renderWorldSuggestions
let _fetchBattleDataIfReady = null;

export function _setFetchBattleDataFn(fn) {
  _fetchBattleDataIfReady = fn;
}

export function renderWorldSuggestions() {
  const worldSuggestions = getRequiredElement("worldSuggestions", "world-suggestions");
  if (!worldSuggestions) return;

  const groups = getGroupedWorldOptions();

  if (groups.length === 0) {
    const empty = document.createElement("div");
    empty.className = "combo-empty";
    empty.textContent = "候補がありません";
    worldSuggestions.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  groups.forEach(group => {
    const groupButton = document.createElement("button");
    groupButton.type = "button";
    groupButton.className = "combo-group-button";
    const isExpanded = state.expandedWorldRangeKeys.has(group.key);
    groupButton.textContent = `${isExpanded ? "▼" : "▶"} ${group.label}`;
    groupButton.addEventListener("click", () => {
      if (state.expandedWorldRangeKeys.has(group.key)) {
        state.expandedWorldRangeKeys.delete(group.key);
      } else {
        state.expandedWorldRangeKeys.add(group.key);
      }
      renderWorldSuggestions();
    });
    fragment.appendChild(groupButton);

    if (!isExpanded) return;

    group.worlds.forEach(world => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "option";
      button.className = "combo-world-button";
      button.textContent = world.id;
      button.dataset.numeric = String(world.numeric);
      button.addEventListener("click", () => selectWorld(world, _fetchBattleDataIfReady));
      fragment.appendChild(button);
    });
  });

  worldSuggestions.replaceChildren(fragment);
}

export function updateWorldOptions() {
  const currentWorld = normalizeWorldName(state.elements.world.value);
  const options = [];

  getFilteredWorldOptions().forEach(world => {
    const option = createOption(world.id, world.id);
    option.dataset.numeric = String(world.numeric);
    options.push(option);
  });

  const worldOptions = getRequiredElement("worldOptions", "world-options");
  if (!worldOptions) return;

  worldOptions.replaceChildren(...options);
  renderWorldSuggestions();

  if (currentWorld) {
    state.elements.world.value = currentWorld;
  }
}
