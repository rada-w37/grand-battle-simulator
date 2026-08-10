import * as state from "./state.js?v=20260810-map-score";

const BATTLE_BLOCK_VALUES = ["0", "1", "2", "3"];

function createGuildCells(guildNames) {
  return Array.from({ length: 4 }, (_, index) => {
    const cell = document.createElement("span");
    cell.className = `guild-cell guild-cell${index + 1}`;
    cell.setAttribute("role", "listitem");
    cell.textContent = guildNames[index] || "";
    return cell;
  });
}

function getBlockGuildGrid(blockValue) {
  return document.querySelector(`[data-block-guild-grid="${blockValue}"]`);
}

export function renderEmptyGuildGrid() {
  renderBattleBlockGuilds({});
}

export function renderGuildGrid(guildNames, blockValue = state.elements.block?.value || "0") {
  const guildGrid = getBlockGuildGrid(blockValue);
  if (!guildGrid) return;

  guildGrid.replaceChildren(...createGuildCells(guildNames));
  const blockCard = document.querySelector(`[data-block-value="${blockValue}"]`);
  const blockName = blockCard?.querySelector(".battle-block-title")?.textContent || "ブロック";
  const populatedNames = guildNames.filter(Boolean);
  blockCard?.setAttribute(
    "aria-label",
    populatedNames.length ? `${blockName}: ${populatedNames.join("、")}` : `${blockName}: データ未取得`
  );
}

export function renderBattleBlockGuilds(guildsByBlock) {
  BATTLE_BLOCK_VALUES.forEach(blockValue => {
    renderGuildGrid(guildsByBlock[blockValue] || ["", "", "", ""], blockValue);
  });
}

export function syncBattleSelectionControls() {
  const selectedClass = state.elements.battleClass?.value || "";
  const selectedBlock = state.elements.block?.value || "";

  document.querySelectorAll("[data-class-value]").forEach(tab => {
    const isSelected = tab.dataset.classValue === selectedClass;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  document.querySelectorAll("[data-block-value]").forEach(card => {
    const isSelected = card.dataset.blockValue === selectedBlock;
    card.classList.toggle("is-active", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  const summary = state.elements.battleSelectionSummary || document.getElementById("battle-selection-summary");
  if (!summary) return;

  const serverLabel = state.elements.server?.selectedOptions?.[0]?.textContent?.trim() || "-";
  const worldLabel = state.elements.world?.value?.trim() || "-";
  const classLabel = state.elements.battleClass?.selectedOptions?.[0]?.textContent?.trim() || "-";
  const blockLabel = state.elements.block?.selectedOptions?.[0]?.textContent?.trim() || "-";
  summary.textContent = `選択対象：${serverLabel} / ${worldLabel} / ${classLabel} / ブロック${blockLabel}`;
}
