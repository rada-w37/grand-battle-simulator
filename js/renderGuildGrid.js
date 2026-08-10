import * as state from "./state.js?v=20260810-ui-followup";

function getRequiredElement(elementKey, id) {
  const element = state.elements[elementKey] || document.getElementById(id);
  if (element) {
    state.elements[elementKey] = element;
    return element;
  }

  console.warn(`Missing DOM element: #${id}`);
  return null;
}

export function renderEmptyGuildGrid() {
  renderGuildGrid(["", "", "", ""]);
}

export function renderGuildGrid(guildNames) {
  const guildGrid = getRequiredElement("guildGrid", "guild-grid");
  if (!guildGrid) return;

  const cells = Array.from({ length: 4 }, (_, index) => {
    const cell = document.createElement("div");
    cell.className = `guild-cell guild-cell${index + 1}`;
    cell.setAttribute("role", "listitem");
    cell.textContent = guildNames[index] || "";
    return cell;
  });

  guildGrid.replaceChildren(...cells);
}
