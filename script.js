const API_BASE_URL = "https://api.mentemori.icu";

const STORAGE_KEYS = {
  selectStates: "selectStates",
  battleSelection: "battleSelection",
  occupationTabs: "occupationTabs",
  appliedGuilds: "appliedGuilds"
};

const GUILD_COLORS = ["#ff9999", "#9999ff", "#99ff99", "#ffff99"];
const GUILD_MARKER_COLORS = ["#ff4d5a", "#5f72ff", "#26c85a", "#f2b600"];
const GUILD_AURA_COLORS = ["#b9655f", "#667fb0", "#7c985a", "#b9a65d"];
const EMPTY_POINT_COLOR = "rgba(255, 255, 255, 0.86)";
const GUILD_MARKER_ICONS = [
  '<svg class="marker-icon marker-diamond" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 7-8 11-8-11 8-7z"/><path d="M4 10h16"/><path d="M9 10l3 11 3-11"/><path d="M8 4l4 6 4-6"/></svg>',
  '<svg class="marker-icon marker-teardrop" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4 4.4 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2-6.6 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/></svg>',
  '<svg class="marker-icon marker-crystal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M12 3v18"/><path d="M5 7l7 4 7-4"/><path d="M5 17l7-6 7 6"/></svg>',
  '<svg class="marker-icon marker-star-gem" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.4 5.7L20 11l-5.6 2.3L12 19l-2.4-5.7L4 11l5.6-2.3L12 3z"/><path d="M12 8v6"/><path d="M9 11h6"/></svg>'
];
const SWORD_MARKER_ICON = '<span class="sword-marker-icon" aria-hidden="true"></span>';

const POINT_SCORES = {
  temple: 4,
  castle: 2,
  church: 1
};

const MAP_IMAGE_SIZE = {
  width: 1293,
  height: 1217
};

const BATTLE_POINTS = [
  { top: 14.87, left: 15.35, type: "church", id: "ganette", castleId: 20 },
  { top: 6.46, left: 38.69, type: "church", id: "rula", castleId: 21 },
  { top: 15.33, left: 54.03, type: "church", id: "cushel", castleId: 6 },
  { top: 7.97, left: 69.74, type: "church", id: "pharia", castleId: 11 },
  { top: 18.29, left: 77.16, type: "church", id: "citri", castleId: 7 },
  { top: 28.3, left: 20.27, type: "church", id: "floryte", castleId: 19 },
  { top: 26.7, left: 89.58, type: "church", id: "toppaz", castleId: 8 },
  { top: 45.51, left: 75.09, type: "church", id: "perido", castleId: 10 },
  { top: 40.58, left: 86.72, type: "church", id: "meral", castleId: 9 },
  { top: 43.47, left: 8.64, type: "church", id: "onyx", castleId: 18 },
  { top: 54.01, left: 19.49, type: "church", id: "zircon", castleId: 17 },
  { top: 64.24, left: 43.75, type: "church", id: "amest", castleId: 15 },
  { top: 66.98, left: 70.88, type: "church", id: "lapis", castleId: 12 },
  { top: 75.39, left: 24.13, type: "church", id: "laven", castleId: 16 },
  { top: 77.21, left: 40.61, type: "church", id: "marin", castleId: 14 },
  { top: 87.6, left: 58.17, type: "church", id: "larimal", castleId: 13 },
  { top: 29.81, left: 37.83, type: "castle", id: "tiferet", castleId: 5 },
  { top: 35.2, left: 62.81, type: "castle", id: "yesod", castleId: 2 },
  { top: 53.7, left: 32.62, type: "castle", id: "keter", castleId: 4 },
  { top: 53.17, left: 58.46, type: "castle", id: "malkuth", castleId: 3 },
  { top: 40.05, left: 50.04, type: "temple", id: "ein", castleId: 1 }
];

const POINT_AURA_COORDINATES = {
  ganette: { x: 196, y: 243 },
  rula: { x: 500, y: 141 },
  cushel: { x: 698, y: 253 },
  pharia: { x: 902, y: 155 },
  citri: { x: 999, y: 284 },
  floryte: { x: 262, y: 410 },
  toppaz: { x: 1164, y: 385 },
  perido: { x: 974, y: 610 },
  meral: { x: 1121, y: 555 },
  onyx: { x: 112, y: 593 },
  zircon: { x: 252, y: 718 },
  amest: { x: 567, y: 843 },
  lapis: { x: 918, y: 877 },
  laven: { x: 311, y: 977 },
  marin: { x: 527, y: 991 },
  larimal: { x: 752, y: 1127 },
  tiferet: { x: 491, y: 430 },
  yesod: { x: 812, y: 498 },
  keter: { x: 425, y: 717 },
  malkuth: { x: 761, y: 712 },
  ein: { x: 648, y: 554 }
};

const MAP_STRUCTURE_PLACEMENTS = [
  { pointId: "ein", src: "resource/temple.png?v=lowres-1", className: "point-structure-temple", x: 648, y: 542, scale: 8.2 },
  { pointId: "tiferet", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 489, y: 419, scale: 6.2 },
  { pointId: "yesod", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 813, y: 485, scale: 6.2 },
  { pointId: "keter", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 422, y: 709, scale: 6.2 },
  { pointId: "malkuth", src: "resource/castle.png?v=lowres-1", className: "point-structure-castle", x: 756, y: 702, scale: 6.2 },
  { pointId: "ganette", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 200, y: 235, scale: 7.4 },
  { pointId: "pharia", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 900, y: 154, scale: 7.4 },
  { pointId: "amest", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 564, y: 834, scale: 7.4 },
  { pointId: "marin", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 524, y: 994, scale: 7.4 },
  { pointId: "cushel", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 700, y: 242, scale: 7.4 },
  { pointId: "lapis", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 916, y: 866, scale: 7.4 },
  { pointId: "laven", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 316, y: 970, scale: 7.4 },
  { pointId: "larimal", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 753, y: 1117, scale: 7.4 },
  { pointId: "perido", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 972, y: 607, scale: 7.4 },
  { pointId: "meral", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 1123, y: 546, scale: 7.4 },
  { pointId: "toppaz", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 1159, y: 380, scale: 7.4 },
  { pointId: "citri", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 998, y: 278, scale: 7.4 },
  { pointId: "rula", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 499, y: 133, scale: 7.4 },
  { pointId: "floryte", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 261, y: 398, scale: 7.4 },
  { pointId: "onyx", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 111, y: 582, scale: 7.4 },
  { pointId: "zircon", src: "resource/church.png?v=lowres-1", className: "point-structure-church", x: 251, y: 710, scale: 7.4 }
];

const MAP_BANNER_PLACEMENTS = [
  { pointId: "ganette", name: "ガネット", x: 198, y: 274, scale: 10.9 },
  { pointId: "laven", name: "ラペン", x: 310, y: 1009, scale: 10.9 },
  { pointId: "cushel", name: "クシェル", x: 698, y: 280, scale: 10.9 },
  { pointId: "amest", name: "アメト", x: 566, y: 872, scale: 10.9 },
  { pointId: "meral", name: "メラル", x: 1118, y: 584, scale: 10.9 },
  { pointId: "yesod", name: "イエソド", x: 814, y: 528, scale: 10.9 },
  { pointId: "tiferet", name: "テファレト", x: 486, y: 464, scale: 10.9 },
  { pointId: "toppaz", name: "トパズ", x: 1158, y: 416, scale: 10.9 },
  { pointId: "keter", name: "ケテル", x: 422, y: 754, scale: 10.9 },
  { pointId: "marin", name: "マリン", x: 526, y: 1031, scale: 10.9 },
  { pointId: "ein", name: "アイン", x: 646, y: 592, scale: 10.9 },
  { pointId: "lapis", name: "ラピス", x: 918, y: 904, scale: 10.9 },
  { pointId: "rula", name: "ルラ", x: 500, y: 171, scale: 10.9 },
  { pointId: "malkuth", name: "マルクト", x: 755, y: 746, scale: 10.9 },
  { pointId: "pharia", name: "ファリア", x: 902, y: 190, scale: 10.9 },
  { pointId: "citri", name: "シトリ", x: 998, y: 316, scale: 10.9 },
  { pointId: "perido", name: "ペリド", x: 969, y: 646, scale: 10.9 },
  { pointId: "larimal", name: "ラリマル", x: 751, y: 1157, scale: 10.9 },
  { pointId: "zircon", name: "ジルコン", x: 251, y: 748, scale: 10.9 },
  { pointId: "onyx", name: "オニキス", x: 111, y: 621, scale: 10.9 },
  { pointId: "floryte", name: "フロライト", x: 261, y: 436, scale: 10.9 }
];

let worldGroupData = [];
let currentBattleData = null;
let currentGuilds = [];
let pendingGuilds = [];
let pendingSelectStates = [];
let occupationTabs = [];
let activeTabId = "";
let editingTabId = "";
let longPressTimer = 0;
let contextMenuTabId = "";
let suppressNextMenuClose = false;
let expandedWorldRangeKeys = new Set();
let isInteractingWithWorldSuggestions = false;
let isSelectingWorldSuggestion = false;
let statusTimer = 0;
let hasUnappliedBattleData = false;
let activeMobilePoint = null;

const elements = {};

function initializeElements() {
  elements.server = document.getElementById("server-select");
  elements.world = document.getElementById("world-input");
  elements.worldOptions = document.getElementById("world-options");
  elements.worldSuggestions = document.getElementById("world-suggestions");
  elements.battleClass = document.getElementById("class-select");
  elements.block = document.getElementById("block-select");
  elements.guildGrid = document.getElementById("guild-grid");
  elements.statusMessage = document.getElementById("status-message");
  elements.pendingMessage = document.getElementById("pending-message");
  elements.cumulativeScope = document.getElementById("cumulative-scope");
  elements.applyButton = document.getElementById("apply-data-button");
  elements.scoreBody = document.getElementById("score-body");
  elements.battlePoints = document.getElementById("battle-points");
  elements.occupationTabs = document.getElementById("occupation-tabs");
  elements.deleteTabButton = document.getElementById("delete-tab-button");
  elements.resetDataButton = document.getElementById("reset-data-button");
  elements.mobilePointPicker = document.getElementById("mobile-point-picker");
  elements.mobilePointPickerTitle = document.getElementById("mobile-point-picker-title");
  elements.mobilePointPickerOptions = document.getElementById("mobile-point-picker-options");
  elements.mobilePointPickerClose = document.getElementById("mobile-point-picker-close");
}

function parseStoredJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function setStatus(message, type = "") {
  window.clearTimeout(statusTimer);
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.type = type;

  if (type === "success" && message) {
    statusTimer = window.setTimeout(() => {
      elements.statusMessage.textContent = "";
      elements.statusMessage.dataset.type = "";
    }, 3000);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);

  const json = await response.json();
  if (json.status !== 200) throw new Error(`APIエラー: status ${json.status}`);

  return json.data;
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function getPointSelects() {
  return Array.from(document.querySelectorAll(".point-defender-select"));
}

function getAllPointSelects() {
  return Array.from(document.querySelectorAll(".point select"));
}

function normalizePointState(state) {
  if (typeof state === "string") {
    return { defender: state, attacker: "" };
  }

  if (!state || typeof state !== "object") {
    return { defender: "", attacker: "" };
  }

  return {
    defender: state.defender || state.guildName || state.defender || "",
    attacker: state.attacker || state.attackerGuildName || ""
  };
}

function cloneOccupationStates(states = createEmptyOccupationStates()) {
  return BATTLE_POINTS.map((_, index) => ({ ...normalizePointState(states[index]) }));
}

function getGuildIndex(guildName) {
  return getGuildEntries().findIndex(guild => guild.name === guildName) + 1;
}

function updatePointChip(point, guildName, role = "defender") {
  const chip = point.querySelector(role === "attacker" ? ".point-attacker-chip" : ".point-defender-chip");
  if (!chip) return;

  const guildIndex = getGuildIndex(guildName);
  const markerIcon = guildIndex ? GUILD_MARKER_ICONS[guildIndex - 1] : "";
  const marker = `<span class="point-chip-mark">${markerIcon}</span>`;
  chip.innerHTML = role === "attacker" ? `${SWORD_MARKER_ICON}${marker}` : marker;
  chip.title = guildName || (role === "attacker" ? "布告なし" : "未選択");
  chip.style.setProperty("--chip-guild-color", guildIndex ? GUILD_MARKER_COLORS[guildIndex - 1] : "#222222");
  chip.dataset.guildIndex = guildIndex ? String(guildIndex) : "";
}

function updatePointDeclaration(point, guildName) {
  const sword = point.querySelector(".point-sword-frame");
  const attackerSelect = point.querySelector(".point-attacker-select");
  const guildIndex = getGuildIndex(guildName);

  if (sword) {
    sword.innerHTML = SWORD_MARKER_ICON;
    sword.style.setProperty("--sword-guild-color", guildIndex ? GUILD_MARKER_COLORS[guildIndex - 1] : "#d86a72");
  }
  if (attackerSelect) {
    attackerSelect.title = guildName || "布告なし";
  }
  updatePointChip(point, guildName, "attacker");
}

function updateAllPointChips() {
  document.querySelectorAll(".point").forEach(point => {
    const select = point.querySelector(".point-defender-select");
    updatePointChip(point, select.value);
    updatePointDeclaration(point, point.querySelector(".point-attacker-select")?.value || "");
  });
}

function createEmptyOccupationStates() {
  return BATTLE_POINTS.map(() => ({ defender: "", attacker: "" }));
}

function createOccupationTab(index, selectStates = createEmptyOccupationStates()) {
  return {
    id: `tab-${Date.now()}-${index}`,
    name: `Day ${index}`,
    selectStates: cloneOccupationStates(selectStates)
  };
}

function getTabDayNumber(tab) {
  const match = String(tab.name || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getNextTabDayNumber() {
  return Math.max(0, ...occupationTabs.map(getTabDayNumber)) + 1;
}

function getActiveTab() {
  return occupationTabs.find(tab => tab.id === activeTabId) || occupationTabs[0];
}

function saveOccupationTabs() {
  localStorage.setItem(STORAGE_KEYS.occupationTabs, JSON.stringify({
    activeTabId,
    tabs: occupationTabs
  }));
}

function setPendingState(isPending) {
  hasUnappliedBattleData = isPending;
  elements.pendingMessage.hidden = !isPending;
  elements.applyButton.classList.toggle("has-pending", isPending);
}

function loadOccupationTabs() {
  const saved = parseStoredJson(STORAGE_KEYS.occupationTabs, null);
  const legacySelectStates = parseStoredJson(STORAGE_KEYS.selectStates, null);

  if (saved?.tabs?.length) {
    occupationTabs = saved.tabs.map((tab, index) => ({
      id: tab.id || `tab-${index + 1}`,
      name: tab.name || String(index + 1),
      selectStates: Array.isArray(tab.selectStates) ? cloneOccupationStates(tab.selectStates) : createEmptyOccupationStates()
    }));
    activeTabId = saved.activeTabId || occupationTabs[0].id;
    return;
  }

  occupationTabs = [
    createOccupationTab(1, Array.isArray(legacySelectStates) ? legacySelectStates : createEmptyOccupationStates())
  ];
  activeTabId = occupationTabs[0].id;
  saveOccupationTabs();
}

function getCurrentSelectStates() {
  return Array.from(document.querySelectorAll(".point")).map(point => ({
    defender: point.querySelector(".point-defender-select")?.value || "",
    attacker: point.querySelector(".point-attacker-select")?.value || ""
  }));
}

function persistCurrentTabState() {
  const activeTab = getActiveTab();
  if (!activeTab) return;

  activeTab.selectStates = getCurrentSelectStates();
  saveOccupationTabs();
}

function focusEditingTabName() {
  window.setTimeout(() => {
    const input = document.querySelector(".tab-name-input");
    if (!input) return;

    input.focus();
    input.select();
  }, 0);
}

function hideTabContextMenu() {
  const menu = document.querySelector(".tab-context-menu");
  if (menu) menu.remove();
  contextMenuTabId = "";
}

function startEditingTab(tabId) {
  hideTabContextMenu();
  editingTabId = tabId;
  renderOccupationTabs();
  focusEditingTabName();
}

function commitEditingTab(input) {
  const tab = occupationTabs.find(item => item.id === editingTabId);
  if (tab) {
    const nextName = input.value.trim();
    if (nextName) tab.name = nextName;
  }

  editingTabId = "";
  saveOccupationTabs();
  renderOccupationTabs();
}

function cancelEditingTab() {
  editingTabId = "";
  renderOccupationTabs();
}

function showTabContextMenu(tabId, x, y) {
  hideTabContextMenu();
  contextMenuTabId = tabId;

  const menu = document.createElement("div");
  menu.className = "tab-context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const renameButton = document.createElement("button");
  renameButton.type = "button";
  renameButton.textContent = "名前を変更";
  renameButton.addEventListener("click", () => startEditingTab(contextMenuTabId));

  menu.appendChild(renameButton);
  document.body.appendChild(menu);
}

function scheduleLongPressRename(tabId, target) {
  window.clearTimeout(longPressTimer);
  longPressTimer = window.setTimeout(() => {
    const rect = target.getBoundingClientRect();
    showTabContextMenu(tabId, rect.left, rect.bottom + 4);
    suppressNextMenuClose = true;
    window.setTimeout(() => {
      suppressNextMenuClose = false;
    }, 500);
  }, 650);
}

function cancelLongPressRename() {
  window.clearTimeout(longPressTimer);
  longPressTimer = 0;
}

function renderOccupationTabs() {
  const buttons = occupationTabs.map(tab => {
    if (tab.id === editingTabId) {
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
    button.setAttribute("aria-selected", String(tab.id === activeTabId));

    if (tab.id === activeTabId) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => switchOccupationTab(tab.id));
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
      showTabContextMenu(tab.id, event.clientX, event.clientY);
    });
    button.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse") return;
      scheduleLongPressRename(tab.id, button);
    });
    button.addEventListener("pointerup", cancelLongPressRename);
    button.addEventListener("pointerleave", cancelLongPressRename);
    button.addEventListener("pointercancel", cancelLongPressRename);
    return button;
  });

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "tab-button tab-add-button";
  addButton.textContent = "+";
  addButton.setAttribute("aria-label", "拠点状況タブを追加");
  addButton.addEventListener("click", addOccupationTab);

  elements.occupationTabs.replaceChildren(...buttons, addButton);
  elements.deleteTabButton.disabled = occupationTabs.length <= 1;
}

function applySelectStates(selectStates = createEmptyOccupationStates()) {
  pendingSelectStates = cloneOccupationStates(selectStates);
  document.querySelectorAll(".point").forEach((point, index) => {
    const state = normalizePointState(pendingSelectStates[index]);
    const defenderSelect = point.querySelector(".point-defender-select");
    const attackerSelect = point.querySelector(".point-attacker-select");

    defenderSelect.value = state.defender;
    attackerSelect.value = state.attacker;
    setPointAura(point, state.defender);
    updatePointChip(point, state.defender);
    updatePointDeclaration(point, state.attacker);
  });
  updateScores();
}

function switchOccupationTab(tabId) {
  if (tabId === activeTabId) return;

  persistCurrentTabState();
  activeTabId = tabId;
  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
}

function addOccupationTab() {
  persistCurrentTabState();

  const nextIndex = getNextTabDayNumber();
  const sourceStates = getActiveTab()?.selectStates || createEmptyOccupationStates();
  const newTab = createOccupationTab(nextIndex, cloneOccupationStates(sourceStates));
  occupationTabs.push(newTab);
  activeTabId = newTab.id;
  editingTabId = newTab.id;
  saveOccupationTabs();
  renderOccupationTabs();
  focusEditingTabName();
  updateGuildOptions();
  applySelectStates(newTab.selectStates);
}

function deleteActiveOccupationTab() {
  if (occupationTabs.length <= 1) return;

  const activeIndex = occupationTabs.findIndex(tab => tab.id === activeTabId);
  const activeTab = getActiveTab();
  if (!activeTab) return;

  const confirmed = window.confirm(`タブ「${activeTab.name}」の拠点状態を削除しますか？`);
  if (!confirmed) return;

  hideTabContextMenu();
  editingTabId = "";
  occupationTabs.splice(activeIndex, 1);
  const nextIndex = Math.max(0, activeIndex - 1);
  activeTabId = occupationTabs[nextIndex].id;

  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
}

function getGuildEntries() {
  return currentGuilds
    .map((name, index) => ({
      name,
      color: GUILD_COLORS[index]
    }))
    .filter(guild => guild.name !== "");
}

function getColorForGuildName(guildName) {
  const match = getGuildEntries().find(guild => guild.name === guildName);
  return match?.color || EMPTY_POINT_COLOR;
}

function getAuraColorForGuildName(guildName) {
  const index = getGuildIndex(guildName);
  return index ? GUILD_AURA_COLORS[index - 1] : "transparent";
}

function setPointAura(point, guildName) {
  const aura = document.querySelector(`.point-aura[data-point-id="${point.dataset.id}"]`);
  if (!aura) return;

  aura.style.setProperty("--point-aura-color", getAuraColorForGuildName(guildName));
}

function renderEmptyGuildGrid() {
  renderGuildGrid(["", "", "", ""]);
}

function renderGuildGrid(guildNames) {
  const cells = Array.from({ length: 4 }, (_, index) => {
    const cell = document.createElement("div");
    cell.className = `guild-cell guild-cell${index + 1}`;
    cell.textContent = guildNames[index] || "";
    return cell;
  });

  elements.guildGrid.replaceChildren(...cells);
}

function loadAppliedGuilds() {
  currentGuilds = parseStoredJson(STORAGE_KEYS.appliedGuilds, []);
}

function saveAppliedGuilds() {
  localStorage.setItem(STORAGE_KEYS.appliedGuilds, JSON.stringify(currentGuilds));
}

function setMapImagePosition(element, x, y) {
  element.style.left = `${(x / MAP_IMAGE_SIZE.width) * 100}%`;
  element.style.top = `${(y / MAP_IMAGE_SIZE.height) * 100}%`;
}

function renderStructurePlacements(fragment) {
  MAP_STRUCTURE_PLACEMENTS.forEach(placement => {
    const structure = document.createElement("img");
    structure.className = `point-structure ${placement.className}`;
    structure.src = placement.src;
    structure.alt = "";
    structure.dataset.pointId = placement.pointId;
    structure.style.width = `${placement.scale}%`;
    setMapImagePosition(structure, placement.x, placement.y);
    fragment.appendChild(structure);
  });
}

function renderBannerPlacements(fragment) {
  MAP_BANNER_PLACEMENTS.forEach(placement => {
    const banner = document.createElement("img");
    banner.className = "point-banner";
    banner.src = "resource/banner.png?v=lowres-1";
    banner.alt = "";
    banner.dataset.pointId = placement.pointId;
    banner.style.width = `${placement.scale}%`;
    setMapImagePosition(banner, placement.x, placement.y);
    fragment.appendChild(banner);

    const label = document.createElement("span");
    label.className = "point-name-label";
    label.textContent = placement.name;
    label.dataset.pointId = placement.pointId;
    setMapImagePosition(label, placement.x, placement.y);
    fragment.appendChild(label);
  });
}

function renderBattlePoints() {
  const fragment = document.createDocumentFragment();

  BATTLE_POINTS.forEach(point => {
    const auraCoordinates = POINT_AURA_COORDINATES[point.id];
    if (auraCoordinates) {
      const aura = document.createElement("span");
      aura.className = `point-aura point-aura-${point.type}`;
      aura.dataset.pointId = point.id;
      aura.style.left = `${(auraCoordinates.x / MAP_IMAGE_SIZE.width) * 100}%`;
      aura.style.top = `${(auraCoordinates.y / MAP_IMAGE_SIZE.height) * 100}%`;
      fragment.appendChild(aura);
    }
  });

  renderStructurePlacements(fragment);
  renderBannerPlacements(fragment);

  BATTLE_POINTS.forEach(point => {
    const wrapper = document.createElement("div");
    wrapper.className = "point";
    wrapper.style.top = `${point.top}%`;
    wrapper.style.left = `${point.left}%`;
    wrapper.dataset.type = point.type;
    wrapper.dataset.id = point.id;
    wrapper.dataset.castleId = String(point.castleId);

    const frame = document.createElement("span");
    frame.className = "point-frame";
    wrapper.appendChild(frame);

    const swordFrame = document.createElement("span");
    swordFrame.className = "point-sword-frame";
    wrapper.appendChild(swordFrame);

    const labels = document.createElement("div");
    labels.className = "point-labels";

    const attackerSelect = document.createElement("select");
    attackerSelect.className = "point-attacker-select";
    attackerSelect.setAttribute("aria-label", `${point.id} attacking guild`);
    labels.appendChild(attackerSelect);

    const defenderSelect = document.createElement("select");
    defenderSelect.className = "point-defender-select";
    defenderSelect.setAttribute("aria-label", `${point.id} occupying guild`);
    labels.appendChild(defenderSelect);
    wrapper.appendChild(labels);

    const mobileIcons = document.createElement("div");
    mobileIcons.className = "point-mobile-icons";

    const attackerChip = document.createElement("button");
    attackerChip.type = "button";
    attackerChip.className = "point-chip point-attacker-chip";
    attackerChip.setAttribute("aria-label", `${point.id}の布告ギルドを選択`);
    attackerChip.addEventListener("click", () => openMobilePointPicker(wrapper));
    mobileIcons.appendChild(attackerChip);

    const defenderChip = document.createElement("button");
    defenderChip.type = "button";
    defenderChip.className = "point-chip point-defender-chip";
    defenderChip.setAttribute("aria-label", `${point.id}の占拠ギルドを選択`);
    defenderChip.addEventListener("click", () => openMobilePointPicker(wrapper));
    mobileIcons.appendChild(defenderChip);

    wrapper.appendChild(mobileIcons);

    fragment.appendChild(wrapper);
  });

  elements.battlePoints.replaceChildren(fragment);
}

function updateGuildOptions() {
  const guilds = getGuildEntries();

  document.querySelectorAll(".point").forEach((point, index) => {
    const state = normalizePointState(pendingSelectStates[index]);
    const defenderSelect = point.querySelector(".point-defender-select");
    const attackerSelect = point.querySelector(".point-attacker-select");
    const currentdefender = defenderSelect.value || state.defender;
    const currentAttacker = attackerSelect.value || state.attacker;

    [defenderSelect, attackerSelect].forEach(select => {
      select.replaceChildren(createOption("", select === attackerSelect ? "" : "選択"));
      guilds.forEach(guild => {
        select.appendChild(createOption(guild.name, guild.name));
      });
    });

    defenderSelect.value = guilds.some(guild => guild.name === currentdefender) ? currentdefender : "";
    attackerSelect.value = guilds.some(guild => guild.name === currentAttacker) ? currentAttacker : "";
    setPointAura(point, defenderSelect.value);
    updatePointChip(point, defenderSelect.value);
    updatePointDeclaration(point, attackerSelect.value);
  });
}

function createScoreCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  if (className) cell.className = className;
  return cell;
}

function createScoreIconCell(index, guildName) {
  const cell = document.createElement("td");
  const marker = document.createElement("span");
  marker.className = "score-guild-marker";
  marker.innerHTML = GUILD_MARKER_ICONS[index] || '<span class="point-chip-empty">-</span>';
  cell.className = "score-icon-cell";
  cell.style.backgroundColor = getColorForGuildName(guildName);
  cell.appendChild(marker);
  return cell;
}

function createEmptyScores(guildNames) {
  return Object.fromEntries(guildNames.map(name => [
    name,
    { total: 0, temple: 0, castle: 0, church: 0 }
  ]));
}

function addPointScore(scores, guildName, type) {
  if (!guildName || !(guildName in scores)) return;

  scores[guildName][type] += 1;
  scores[guildName].total += POINT_SCORES[type] || 0;
}

function calculateScoresFromStates(selectStates, guildNames) {
  const scores = createEmptyScores(guildNames);

  BATTLE_POINTS.forEach((point, index) => {
    addPointScore(scores, normalizePointState(selectStates[index]).defender, point.type || "church");
  });

  return scores;
}

function getCumulativeScores(guildNames) {
  const scores = createEmptyScores(guildNames);
  const activeIndex = Math.max(0, occupationTabs.findIndex(tab => tab.id === activeTabId));
  const currentSelectStates = getCurrentSelectStates();

  occupationTabs.slice(0, activeIndex + 1).forEach(tab => {
    const selectStates = tab.id === activeTabId ? currentSelectStates : tab.selectStates;
    const tabScores = calculateScoresFromStates(selectStates, guildNames);

    guildNames.forEach(guildName => {
      scores[guildName].total += tabScores[guildName].total;
    });
  });

  return scores;
}

function updateCumulativeScope() {
  const activeIndex = occupationTabs.findIndex(tab => tab.id === activeTabId);
  if (activeIndex < 0 || occupationTabs.length === 0) {
    elements.cumulativeScope.textContent = "";
    return;
  }

  const targetTabs = occupationTabs.slice(0, activeIndex + 1).map(tab => tab.name);
  elements.cumulativeScope.textContent = `累計対象: ${targetTabs.join(" / ")}`;
}

function updateScores() {
  updateCumulativeScope();
  const guilds = getGuildEntries();
  const guildNames = guilds.map(guild => guild.name);
  const activeScores = createEmptyScores(guildNames);
  const cumulativeScores = getCumulativeScores(guildNames);

  document.querySelectorAll(".point").forEach(point => {
    const selectedGuild = point.querySelector(".point-defender-select").value;
    const type = point.dataset.type || "church";
    addPointScore(activeScores, selectedGuild, type);
    setPointAura(point, selectedGuild);
    updatePointChip(point, selectedGuild);
  });

  const rows = Array.from({ length: 4 }, (_, index) => {
    const guild = guilds[index] || { name: "", color: GUILD_COLORS[index] };
    const score = activeScores[guild.name] || { total: 0, temple: 0, castle: 0, church: 0 };
    const cumulativeScore = cumulativeScores[guild.name]?.total || 0;
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");

    nameCell.textContent = guild.name;
    nameCell.style.backgroundColor = guild.color;
    row.append(
      createScoreIconCell(index, guild.name),
      nameCell,
      createScoreCell(score.temple),
      createScoreCell(score.castle),
      createScoreCell(score.church),
      createScoreCell(score.total, "score-total"),
      createScoreCell(cumulativeScore, "score-cumulative")
    );

    return row;
  });

  elements.scoreBody.replaceChildren(...rows);
}

function saveSelectStates() {
  persistCurrentTabState();
}

function restoreSelectStates() {
  applySelectStates(getActiveTab()?.selectStates);
}

function getWorldOptionsForServer(serverId) {
  const worlds = worldGroupData.flatMap(group => (
    group.worlds
      .filter(worldId => String(worldId).startsWith(serverId))
      .map(worldId => ({
        id: `W${Number(String(worldId).slice(-3))}`,
        numeric: worldId,
        groupId: group.group_id
      }))
  ));

  return Array.from(new Map(worlds.map(world => [world.id, world])).values())
    .sort((a, b) => a.numeric - b.numeric);
}

function normalizeWorldName(value) {
  const trimmed = value.normalize("NFKC").trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^w?\s*0*(\d+)$/i);
  if (!match) return trimmed.toUpperCase();

  return `W${Number(match[1])}`;
}

function getFilteredWorldOptions() {
  return getWorldOptionsForServer(elements.server.value);
}

function getWorldRangeKey(world) {
  const worldNumber = Number(world.id.replace("W", ""));
  const rangeStart = worldNumber < 10 ? 1 : Math.floor(worldNumber / 10) * 10;
  return String(rangeStart);
}

function getWorldRangeLabel(rangeStart, worlds) {
  const first = worlds[0].id;
  const last = worlds[worlds.length - 1].id;
  return `${first} ～ ${last}`;
}

function getGroupedWorldOptions() {
  const groups = new Map();

  getFilteredWorldOptions().forEach(world => {
    const key = getWorldRangeKey(world);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(world);
  });

  return Array.from(groups.entries()).map(([key, worlds]) => ({
    key,
    worlds,
    label: getWorldRangeLabel(Number(key), worlds)
  }));
}

function hideWorldSuggestions() {
  elements.worldSuggestions.hidden = true;
}

function showWorldSuggestions() {
  renderWorldSuggestions();
  elements.worldSuggestions.hidden = false;
}

function selectWorld(world) {
  isSelectingWorldSuggestion = true;
  isInteractingWithWorldSuggestions = false;
  elements.world.value = world.id;
  hideWorldSuggestions();
  elements.world.blur();
  fetchBattleDataIfReady();
}

function renderWorldSuggestions() {
  const groups = getGroupedWorldOptions();

  if (groups.length === 0) {
    const empty = document.createElement("div");
    empty.className = "combo-empty";
    empty.textContent = "候補がありません";
    elements.worldSuggestions.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  groups.forEach(group => {
    const groupButton = document.createElement("button");
    groupButton.type = "button";
    groupButton.className = "combo-group-button";
    const isExpanded = expandedWorldRangeKeys.has(group.key);
    groupButton.textContent = `${isExpanded ? "▼" : "▶"} ${group.label}`;
    groupButton.addEventListener("click", () => {
      if (expandedWorldRangeKeys.has(group.key)) {
        expandedWorldRangeKeys.delete(group.key);
      } else {
        expandedWorldRangeKeys.add(group.key);
      }
      renderWorldSuggestions();
    });
    fragment.appendChild(groupButton);

    if (!expandedWorldRangeKeys.has(group.key)) return;

    group.worlds.forEach(world => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "option";
      button.className = "combo-world-button";
      button.textContent = world.id;
      button.dataset.numeric = String(world.numeric);
      button.addEventListener("click", () => selectWorld(world));
      fragment.appendChild(button);
    });
  });

  elements.worldSuggestions.replaceChildren(fragment);
}

function updateWorldOptions() {
  const currentWorld = normalizeWorldName(elements.world.value);
  const options = [];

  getWorldOptionsForServer(elements.server.value).forEach(world => {
    const option = createOption(world.id, world.id);
    option.dataset.numeric = String(world.numeric);
    options.push(option);
  });

  elements.worldOptions.replaceChildren(...options);
  renderWorldSuggestions();

  if (currentWorld) {
    elements.world.value = currentWorld;
  }
}

function getSelectedWorld() {
  const rawWorld = elements.world.value.trim();
  const normalizedWorld = normalizeWorldName(elements.world.value);
  if (!normalizedWorld) return null;

  return getWorldOptionsForServer(elements.server.value)
    .find(world => (
      world.id.toUpperCase() === normalizedWorld.toUpperCase() ||
      String(world.numeric) === rawWorld
    )) || null;
}

function getSelectedGroupId(worldNumeric) {
  const group = worldGroupData.find(item => item.worlds.includes(worldNumeric));
  if (!group) throw new Error("ワールドに対応するグループが見つかりません");
  return group.group_id;
}

function canFetchBattleData() {
  return elements.server.value &&
    getSelectedWorld() &&
    elements.battleClass.value &&
    elements.block.value;
}

function saveBattleSelection() {
  localStorage.setItem(STORAGE_KEYS.battleSelection, JSON.stringify({
    server: elements.server.value,
    world: normalizeWorldName(elements.world.value),
    battleClass: elements.battleClass.value,
    block: elements.block.value
  }));
}

function restoreBattleSelection() {
  const selection = parseStoredJson(STORAGE_KEYS.battleSelection, {});

  if (selection.server) elements.server.value = selection.server;
  updateWorldOptions();
  if (selection.world) elements.world.value = selection.world;
  if (selection.battleClass) elements.battleClass.value = selection.battleClass;
  if (selection.block) elements.block.value = selection.block;
}

async function loadGroups() {
  setStatus("ワールド情報を読み込み中...");
  worldGroupData = await fetchJson(`${API_BASE_URL}/wgroups`);
  updateWorldOptions();
  setStatus("");
}

function resetFetchedData() {
  currentBattleData = null;
  pendingGuilds = [];
  elements.applyButton.disabled = true;
  setPendingState(false);
  renderEmptyGuildGrid();
}

async function fetchBattleDataIfReady() {
  saveBattleSelection();

  if (!canFetchBattleData()) {
    resetFetchedData();
    setStatus("ワールドを選択してください。");
    return;
  }

  try {
    setStatus("最新データを読み込み中...");
    elements.applyButton.disabled = true;

    const selectedWorld = getSelectedWorld();
    if (!selectedWorld) throw new Error("ワールドが見つかりません");

    elements.world.value = selectedWorld.id;
    const worldNumeric = selectedWorld.numeric;
    const groupId = getSelectedGroupId(worldNumeric);
    const url = `${API_BASE_URL}/wg/${groupId}/globalgvg/${elements.battleClass.value}/${elements.block.value}/latest`;

    currentBattleData = await fetchJson(url);
    pendingGuilds = Object.values(currentBattleData.guilds || {});

    renderGuildGrid(pendingGuilds);
    setPendingState(true);
    elements.applyButton.disabled = false;
    setStatus("最新データを取得しました。", "success");
  } catch (error) {
    resetFetchedData();
    setStatus(`エラー: ${error.message}`, "error");
  }
}

function getOccupyingGuild(castleData, guilds) {
  const isCapturedOrCountering = castleData.GvgCastleState === 2 || castleData.GvgCastleState === 3;
  const guildId = isCapturedOrCountering ? castleData.AttackerGuildId : castleData.GuildId;
  return guilds[guildId] || "";
}

function getAttackingGuild(castleData, guilds) {
  return guilds[castleData.AttackerGuildId] || "";
}

function areGuildsDifferent(nextGuilds) {
  const currentNames = getGuildEntries().map(guild => guild.name);
  const nextNames = nextGuilds.filter(name => name !== "");

  if (currentNames.length !== nextNames.length) return true;
  return nextNames.some((name, index) => currentNames[index] !== name);
}

function resetOccupationTabs() {
  occupationTabs = [createOccupationTab(1)];
  activeTabId = occupationTabs[0].id;
  editingTabId = "";
  pendingSelectStates = occupationTabs[0].selectStates;
  saveOccupationTabs();
  renderOccupationTabs();
}

function resetAllData() {
  const confirmed = window.confirm("すべてのタブ、拠点状態、保存済み設定を初期化しますか？");
  if (!confirmed) return;

  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

  currentBattleData = null;
  currentGuilds = [];
  pendingGuilds = [];
  pendingSelectStates = [];
  occupationTabs = [createOccupationTab(1)];
  activeTabId = occupationTabs[0].id;
  editingTabId = "";
  expandedWorldRangeKeys = new Set();

  elements.server.value = "1";
  elements.world.value = "";
  elements.battleClass.value = "3";
  elements.block.value = "0";

  renderEmptyGuildGrid();
  updateWorldOptions();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(occupationTabs[0].selectStates);
  saveOccupationTabs();
  setPendingState(false);
  elements.applyButton.disabled = true;
  setStatus("全データを初期化しました。", "success");
}

function closeMobilePointPicker() {
  activeMobilePoint = null;
  elements.mobilePointPicker.hidden = true;
  elements.mobilePointPickerOptions.replaceChildren();
}

function setPointGuild(point, role, guildName) {
  const select = point.querySelector(role === "attacker" ? ".point-attacker-select" : ".point-defender-select");
  select.value = guildName;

  if (role === "attacker") {
    updatePointDeclaration(point, guildName);
  } else {
    setPointAura(point, guildName);
    updatePointChip(point, guildName);
  }

  saveSelectStates();
  updateScores();
}

function openMobilePointPicker(point) {
  activeMobilePoint = point;
  const defenderSelect = point.querySelector(".point-defender-select");
  const attackerSelect = point.querySelector(".point-attacker-select");
  const pointLabel = point.dataset.id || "拠点";
  elements.mobilePointPickerTitle.textContent = pointLabel;

  const createOptionButton = (option, role, select) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-picker-option";
    button.textContent = option.label;
    button.style.backgroundColor = option.value ? getColorForGuildName(option.value) : "";
    button.setAttribute("aria-pressed", String(select.value === option.value));
    button.addEventListener("click", () => {
      setPointGuild(point, role, option.value);
      closeMobilePointPicker();
    });
    return button;
  };

  const createGroup = (title, role, select, emptyLabel) => {
    const group = document.createElement("section");
    group.className = "mobile-picker-group";

    const heading = document.createElement("h4");
    heading.textContent = title;
    group.appendChild(heading);

    const options = document.createElement("div");
    options.className = "mobile-picker-group-options";
    const optionItems = [
      { label: emptyLabel, value: "" },
      ...getGuildEntries().map((guild, index) => ({
        label: `${index + 1}. ${guild.name}`,
        value: guild.name
      }))
    ];
    options.replaceChildren(...optionItems.map(option => createOptionButton(option, role, select)));
    group.appendChild(options);
    return group;
  };

  elements.mobilePointPickerOptions.replaceChildren(
    createGroup("防衛側", "defender", defenderSelect, "未選択"),
    createGroup("布告側", "attacker", attackerSelect, "布告なし")
  );
  elements.mobilePointPicker.hidden = false;
}

function applyBattleData() {
  if (!currentBattleData || !Array.isArray(currentBattleData.castles)) return;

  const nextGuilds = pendingGuilds.length ? pendingGuilds : Object.values(currentBattleData.guilds || {});
  if (currentGuilds.length > 0 && areGuildsDifferent(nextGuilds)) {
    const confirmed = window.confirm(
      "最新の拠点情報から取得したギルド名が、現在の拠点情報のギルドと異なります。\n" +
      "各拠点情報およびタブをすべて初期化してから反映します。よろしいですか？"
    );

    if (!confirmed) return;
    resetOccupationTabs();
  }

  currentGuilds = nextGuilds;
  saveAppliedGuilds();
  renderGuildGrid(currentGuilds);
  updateGuildOptions();

  const guilds = currentBattleData.guilds || {};
  const castlesById = new Map(currentBattleData.castles.map(castle => [castle.CastleId, castle]));

  document.querySelectorAll(".point").forEach(point => {
    const castleId = Number(point.dataset.castleId);
    const defenderSelect = point.querySelector(".point-defender-select");
    const attackerSelect = point.querySelector(".point-attacker-select");
    const castleData = castlesById.get(castleId);
    const guildName = castleData ? getOccupyingGuild(castleData, guilds) : "";
    const attackerGuildName = castleData ? getAttackingGuild(castleData, guilds) : "";

    defenderSelect.value = guildName;
    attackerSelect.value = attackerGuildName;
    setPointAura(point, guildName);
    updatePointChip(point, guildName);
    updatePointDeclaration(point, attackerGuildName);
  });

  saveSelectStates();
  updateScores();
  setPendingState(false);
  setStatus("拠点情報を反映しました。", "success");
}

function bindEvents() {
  document.addEventListener("click", event => {
    if (suppressNextMenuClose) return;
    if (!event.target.closest(".tab-context-menu")) hideTabContextMenu();
    if (!event.target.closest(".combo-box")) hideWorldSuggestions();
  });

  elements.server.addEventListener("change", () => {
    expandedWorldRangeKeys = new Set();
    updateWorldOptions();
    fetchBattleDataIfReady();
  });
  elements.world.addEventListener("change", () => {
    elements.world.value = normalizeWorldName(elements.world.value);
    fetchBattleDataIfReady();
  });
  elements.world.addEventListener("input", renderWorldSuggestions);
  elements.world.addEventListener("focus", showWorldSuggestions);
  elements.world.addEventListener("blur", () => {
    if (isSelectingWorldSuggestion) {
      isSelectingWorldSuggestion = false;
      return;
    }

    if (isInteractingWithWorldSuggestions) {
      window.setTimeout(() => {
        isInteractingWithWorldSuggestions = false;
        elements.world.focus();
      }, 0);
      return;
    }

    elements.world.value = normalizeWorldName(elements.world.value);
    fetchBattleDataIfReady();
  });
  elements.world.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    elements.world.value = normalizeWorldName(elements.world.value);
    hideWorldSuggestions();
    fetchBattleDataIfReady();
  });
  elements.worldSuggestions.addEventListener("pointerdown", () => {
    isInteractingWithWorldSuggestions = true;
  });
  elements.worldSuggestions.addEventListener("mousedown", event => {
    event.preventDefault();
    event.stopPropagation();
    isInteractingWithWorldSuggestions = true;
  }, true);
  elements.worldSuggestions.addEventListener("click", event => {
    event.stopPropagation();
  });
  elements.worldSuggestions.addEventListener("touchstart", () => {
    isInteractingWithWorldSuggestions = true;
  }, { passive: true });
  elements.worldSuggestions.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      isInteractingWithWorldSuggestions = false;
    }, 0);
  });
  elements.worldSuggestions.addEventListener("pointercancel", () => {
    isInteractingWithWorldSuggestions = false;
  });
  elements.battleClass.addEventListener("change", fetchBattleDataIfReady);
  elements.block.addEventListener("change", fetchBattleDataIfReady);
  elements.applyButton.addEventListener("click", applyBattleData);
  elements.deleteTabButton.addEventListener("click", deleteActiveOccupationTab);
  elements.resetDataButton.addEventListener("click", resetAllData);

  getAllPointSelects().forEach(select => {
    select.addEventListener("change", () => {
      const point = select.closest(".point");
      if (select.classList.contains("point-attacker-select")) {
        updatePointDeclaration(point, select.value);
      } else {
        setPointAura(point, select.value);
        updatePointChip(point, select.value);
      }
      saveSelectStates();
      updateScores();
    });
  });

  elements.mobilePointPickerClose.addEventListener("click", closeMobilePointPicker);
  elements.mobilePointPicker.addEventListener("click", event => {
    if (event.target === elements.mobilePointPicker) closeMobilePointPicker();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initializeElements();
  renderEmptyGuildGrid();
  renderBattlePoints();
  loadAppliedGuilds();
  loadOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  restoreSelectStates();
  updateScores();
  bindEvents();

  try {
    await loadGroups();
    restoreBattleSelection();
    await fetchBattleDataIfReady();
  } catch (error) {
    setStatus(`初期化エラー: ${error.message}`, "error");
  }
});
