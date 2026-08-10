import * as state from "./state.js?v=20260810-filtered-export";
import { cloneOccupationStates, createEmptyOccupationStates, getActiveTab, getNextTabDayNumber } from "./utils.js?v=20260810-filtered-export";
import { applySelectStates, createOccupationTab, deleteOccupationHistory, persistCurrentTabState, saveOccupationTabs, updateGuildOptions, updateOccupationHistoryControls } from "./ui.js?v=20260810-filtered-export";
import { showDestructiveConfirmation } from "./presentation/battle-data-dialog.js?v=20260810-filtered-export";

function getRequiredElement(elementKey, id) {
  const element = state.elements[elementKey] || document.getElementById(id);
  if (element) {
    state.elements[elementKey] = element;
    return element;
  }

  console.warn(`Missing DOM element: #${id}`);
  return null;
}
function scrollOccupationTabsToEnd() {
  requestAnimationFrame(() => {
    state.elements.occupationTabs.scrollLeft = state.elements.occupationTabs.scrollWidth;
  });
}

export function updateTabScrollState() {
  requestAnimationFrame(() => {
    const tabs = state.elements.occupationTabs;
    const tabRow = tabs?.closest(".tab-row");
    if (!tabs || !tabRow) return;

    tabRow.classList.toggle("has-tab-scroll", tabs.scrollWidth > tabs.clientWidth + 1);
  });
}

// Tab UI
export function focusEditingTabName() {
  window.setTimeout(() => {
    const input = document.querySelector(".tab-name-input");
    if (!input) return;

    input.focus();
    input.select();
  }, 0);
}

export function hideTabContextMenu() {
  const menu = document.querySelector(".tab-context-menu");
  if (menu) menu.remove();
  state.setContextMenuTabId("");
}

export function startEditingTab(tabId) {
  hideTabContextMenu();
  state.setEditingTabId(tabId);
  renderOccupationTabs();
  focusEditingTabName();
}

export function commitEditingTab(input) {
  const tab = state.occupationTabs.find(item => item.id === state.editingTabId);
  if (tab) {
    const nextName = input.value.trim();
    if (nextName) tab.name = nextName;
  }

  state.setEditingTabId("");
  saveOccupationTabs();
  renderOccupationTabs();
}

export function cancelEditingTab() {
  state.setEditingTabId("");
  renderOccupationTabs();
}

export function showTabContextMenu(tabId, x, y) {
  hideTabContextMenu();
  state.setContextMenuTabId(tabId);

  const menu = document.createElement("div");
  menu.className = "tab-context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const renameButton = document.createElement("button");
  renameButton.type = "button";
  renameButton.textContent = "名前を変更";
  renameButton.addEventListener("click", () => startEditingTab(state.contextMenuTabId));

  menu.appendChild(renameButton);
  document.body.appendChild(menu);
}

export function renderOccupationTabs() {
  const buttons = state.occupationTabs.map(tab => {
    if (tab.id === state.editingTabId) {
      const input = document.createElement("input");
      input.className = "tab-name-input";
      input.value = tab.name;
      input.setAttribute("aria-label", "タブ名");
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitEditingTab(input);
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancelEditingTab();
        }
      });
      input.addEventListener("blur", () => commitEditingTab(input));
      return input;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-button";
    button.textContent = tab.name;
    button.dataset.tabId = tab.id;
    button.setAttribute("aria-selected", String(tab.id === state.activeTabId));

    if (tab.id === state.activeTabId) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => switchOccupationTab(tab.id));
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
      showTabContextMenu(tab.id, event.clientX, event.clientY);
    });
    button.addEventListener("dblclick", event => {
      event.preventDefault();
      startEditingTab(tab.id);
    });
    return button;
  });

  const occupationTabs = getRequiredElement("occupationTabs", "occupation-tabs");
  if (!occupationTabs) return;

  occupationTabs.replaceChildren(...buttons);
  state.elements.deleteTabButton.disabled = state.occupationTabs.length <= 1;
  updateTabScrollState();
}

export function switchOccupationTab(tabId) {
  if (tabId === state.activeTabId) return;

  persistCurrentTabState();
  state.setActiveTabId(tabId);
  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
  updateOccupationHistoryControls();
}

export function addOccupationTab() {
  persistCurrentTabState();

  const nextIndex = getNextTabDayNumber();
  const activeTab = getActiveTab();
  const sourceStates = activeTab?.selectStates || createEmptyOccupationStates();
  const newTab = createOccupationTab(
    nextIndex,
    cloneOccupationStates(sourceStates),
    activeTab?.appliedSnapshotStates || null
  );
  state.occupationTabs.push(newTab);
  state.setActiveTabId(newTab.id);
  saveOccupationTabs();
  renderOccupationTabs();
  scrollOccupationTabsToEnd();
  updateGuildOptions();
  applySelectStates(newTab.selectStates);
  updateOccupationHistoryControls();
}

export async function deleteActiveOccupationTab() {
  if (state.occupationTabs.length <= 1) return;

  const activeIndex = state.occupationTabs.findIndex(tab => tab.id === state.activeTabId);
  const activeTab = getActiveTab();
  if (!activeTab) return;

  const confirmed = await showDestructiveConfirmation({
    title: "選択中のタブを削除しますか？",
    message: "選択中のタブと、そのタブの履歴を削除します。",
    confirmLabel: "削除"
  });
  if (!confirmed) return;

  hideTabContextMenu();
  state.setEditingTabId("");
  deleteOccupationHistory(activeTab.id);
  state.occupationTabs.splice(activeIndex, 1);
  const nextIndex = Math.max(0, activeIndex - 1);
  state.setActiveTabId(state.occupationTabs[nextIndex].id);

  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
  updateOccupationHistoryControls();
}

export function resetOccupationTabs({ selectStates, appliedSnapshotStates = null } = {}) {
  state.setOccupationTabs([
    createOccupationTab(1, selectStates || createEmptyOccupationStates(), appliedSnapshotStates)
  ]);
  state.setActiveTabId(state.occupationTabs[0].id);
  state.setEditingTabId("");
  state.setPendingSelectStates(state.occupationTabs[0].selectStates);
  saveOccupationTabs();
  renderOccupationTabs();
  updateOccupationHistoryControls();
}
