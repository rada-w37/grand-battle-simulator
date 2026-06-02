import { GUILD_COLORS, GUILD_MARKER_ICONS, GUILD_MARKER_COLORS, GUILD_AURA_COLORS, EMPTY_POINT_COLOR, SWORD_MARKER_ICON, STORAGE_KEYS, POINT_SCORES } from "./constants.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS, POINT_AURA_COORDINATES, getMapLayoutCssVars, getMapPointUiOffsets } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import * as state from "./state.js?v=20260524-visibility-toggles";
import { parseStoredJson, cloneOccupationStates, normalizePointState, createEmptyOccupationStates, getGuildEntries, getGuildIndex, getColorForGuildName, getAuraColorForGuildName, setMapImagePosition, createScoreCell, createEmptyScores, addPointScore, getTabDayNumber, getNextTabDayNumber, getActiveTab, createOption, getAllPointSelects } from "./utils.js?v=20260524-visibility-toggles";
import { getSelectedWorld, getOccupyingGuild, getAttackingGuild, areGuildsDifferent } from "./api.js?v=20260524-visibility-toggles";
import { updateWorldOptions } from "./worldSelector.js?v=20260524-visibility-toggles";
import { getEditableGuildNames, updateGuildNameEditControls } from "./guildNameEditor.js?v=20260524-visibility-toggles";
import { renderEmptyGuildGrid, renderGuildGrid } from "./renderGuildGrid.js?v=20260524-visibility-toggles";
import { renderStructurePlacements, renderBannerPlacements } from "./renderMapDecorations.js?v=20260524-visibility-toggles";

export {
  _setFetchBattleDataFn,
  hideWorldSuggestions,
  showWorldSuggestions,
  selectWorld,
  renderWorldSuggestions,
  updateWorldOptions
} from "./worldSelector.js?v=20260524-visibility-toggles";

export {
  startGuildNameEditing,
  cancelGuildNameEditing,
  confirmGuildNameEditing,
  getEditableGuildNames,
  updateGuildNameEditControls
} from "./guildNameEditor.js?v=20260524-visibility-toggles";

export {
  renderEmptyGuildGrid,
  renderGuildGrid
} from "./renderGuildGrid.js?v=20260524-visibility-toggles";

function getRequiredElement(elementKey, id) {
  const element = state.elements[elementKey] || document.getElementById(id);
  if (element) {
    state.elements[elementKey] = element;
    return element;
  }

  console.warn(`Missing DOM element: #${id}`);
  return null;
}

// Status Message
export function setStatus(message, type = "") {
  window.clearTimeout(state.statusTimer);
  state.elements.statusMessage.textContent = message;
  state.elements.statusMessage.dataset.type = type;

  if (type === "success" && message) {
    state.setStatusTimer(window.setTimeout(() => {
      state.elements.statusMessage.textContent = "";
      state.elements.statusMessage.dataset.type = "";
    }, 3000));
  }
}

// Guild Storage
export function loadAppliedGuilds() {
  state.setCurrentGuilds(parseStoredJson(STORAGE_KEYS.appliedGuilds, []));
}

export function saveAppliedGuilds() {
  localStorage.setItem(STORAGE_KEYS.appliedGuilds, JSON.stringify(state.currentGuilds));
}

export function loadHighlightedGuildName() {
  const savedName = localStorage.getItem(STORAGE_KEYS.highlightedGuildName) || "";
  if (savedName && state.currentGuilds.includes(savedName)) {
    state.setHighlightedGuildName(savedName);
    return;
  }

  state.setHighlightedGuildName("");
  if (savedName) {
    localStorage.removeItem(STORAGE_KEYS.highlightedGuildName);
  }
}

function saveHighlightedGuildName(guildName) {
  if (guildName) {
    localStorage.setItem(STORAGE_KEYS.highlightedGuildName, guildName);
  } else {
    localStorage.removeItem(STORAGE_KEYS.highlightedGuildName);
  }
}

// Point Aura and Chip Updates
export function setPointAura(point, guildName) {
  const aura = document.querySelector(`.point-aura[data-point-id="${point.dataset.id}"]`);
  if (!aura) return;

  aura.style.setProperty("--point-aura-color", getAuraColorForGuildName(guildName));
}

export function updatePointChip(point, guildName, role = "defender") {
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

export function updatePointDeclaration(point, guildName) {
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

export function updatePointSelfAttackState(point) {
  const attackerSelect = point.querySelector(".point-attacker-select");
  const defenderSelect = point.querySelector(".point-defender-select");
  const isSelfAttack = Boolean(attackerSelect?.value) && attackerSelect.value === defenderSelect?.value;

  point.classList.toggle("has-self-attack", isSelfAttack);
  attackerSelect?.classList.toggle("is-self-attack", isSelfAttack);
}

export function updateAllPointChips() {
  document.querySelectorAll(".point").forEach(point => {
    const select = point.querySelector(".point-defender-select");
    updatePointChip(point, select.value);
    updatePointDeclaration(point, point.querySelector(".point-attacker-select")?.value || "");
    updatePointSelfAttackState(point);
  });
}

function updateHighlightedGuildSelects() {
  document.querySelectorAll(".point-attacker-select, .point-defender-select").forEach(select => {
    select.classList.toggle("is-highlight-guild", Boolean(state.highlightedGuildName) && select.value === state.highlightedGuildName);
  });
}

function createScoreGuildRadioCell(guildName) {
  const cell = document.createElement("td");
  const radio = document.createElement("input");

  cell.className = "score-guild-radio-cell";
  radio.type = "radio";
  radio.name = "highlight-guild";
  radio.value = guildName;
  radio.checked = Boolean(guildName) && state.highlightedGuildName === guildName;
  radio.disabled = !guildName;
  radio.addEventListener("pointerdown", () => {
    radio.dataset.wasChecked = String(radio.checked);
  });
  radio.addEventListener("click", event => {
    if (radio.dataset.wasChecked !== "true") return;

    event.preventDefault();
    radio.checked = false;
    radio.dataset.wasChecked = "false";
    state.setHighlightedGuildName("");
    saveHighlightedGuildName("");
    updateHighlightedGuildSelects();
    updateScores();
  });
  radio.setAttribute("aria-label", guildName ? `${guildName}をマップ上で強調` : "ギルド未選択");
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    state.setHighlightedGuildName(radio.value);
    saveHighlightedGuildName(radio.value);
    updateHighlightedGuildSelects();
  });

  cell.appendChild(radio);
  return cell;
}

function setDevLayoutMetadata(element, { targetId, layoutKey, pointId, role = "", targetType = "" }) {
  element.dataset.devLayoutId = targetId;
  element.dataset.devLayoutKey = layoutKey;
  element.dataset.devLayoutPointId = pointId;
  element.dataset.devLayoutTargetType = targetType || role || layoutKey;
  if (role) {
    element.dataset.devLayoutRole = role;
  }
}

const POINT_UI_OFFSET_VARS = {
  pointLabels: {
    x: "--map-point-labels-left",
    y: "--map-point-labels-top",
    width: "--map-point-labels-width",
    height: "--map-point-labels-height"
  },
  sword: {
    x: "--map-sword-left",
    y: "--map-sword-top",
    size: "--map-sword-size"
  },
  shield: {
    x: "--map-shield-left",
    y: "--map-shield-top",
    size: "--map-shield-size"
  },
  select: {
    x: "--map-point-select-left",
    y: "--map-point-select-top",
    width: "--map-point-select-width",
    height: "--map-point-select-height"
  }
};

function getCssPxNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCssPx(value) {
  return `${Math.round(value * 100) / 100}px`;
}

function applyPointUiOffsets(element, pointId, width = window.innerWidth) {
  const offsets = getMapPointUiOffsets(pointId, width);
  if (!offsets) return;

  const baseVars = getMapLayoutCssVars(width);
  Object.entries(offsets).forEach(([targetType, targetOffsets]) => {
    const targetVars = POINT_UI_OFFSET_VARS[targetType];
    if (!targetVars) return;
    const targetElement = targetType === "select"
      ? element.querySelector(".point-selects") || element
      : element;

    Object.entries(targetOffsets).forEach(([property, offset]) => {
      const variableName = targetVars[property];
      const baseValue = getCssPxNumber(baseVars[variableName]);
      if (!variableName || baseValue === null) return;
      const finalValue = formatCssPx(baseValue + offset);
      targetElement.style.setProperty(variableName, finalValue);
      if (targetType === "select" && property === "height") {
        targetElement.style.setProperty("--map-point-select-min-height", finalValue);
      }
    });
  });
}

function clearPointUiOffsets(element) {
  Object.values(POINT_UI_OFFSET_VARS).forEach(targetVars => {
    Object.values(targetVars).forEach(variableName => {
      element.style.removeProperty(variableName);
    });
  });

  const selectGroup = element.querySelector(".point-selects");
  if (selectGroup) {
    Object.values(POINT_UI_OFFSET_VARS.select).forEach(variableName => {
      selectGroup.style.removeProperty(variableName);
    });
    selectGroup.style.removeProperty("--map-point-select-min-height");
  }
}

export function refreshMapLayout(width = window.innerWidth) {
  document.querySelectorAll(".point").forEach(point => {
    clearPointUiOffsets(point);
    applyPointUiOffsets(point, point.dataset.id, width);
  });

  MAP_BANNER_PLACEMENTS.forEach(placement => {
    const label = document.querySelector(`.point-name-label[data-point-id="${placement.pointId}"]`);
    if (!label) return;

    const textOffset = getBannerTextOffset(placement);
    setMapImagePosition(
      label,
      placement.x + textOffset.x,
      placement.y + textOffset.y
    );
  });
}

// Render Battle Points Map
export function renderBattlePoints() {
  const battlePoints = getRequiredElement("battlePoints", "battle-points");
  if (!battlePoints) return;

  const fragment = document.createDocumentFragment();

  BATTLE_POINTS.forEach(point => {
    const auraCoordinates = POINT_AURA_COORDINATES[point.id];
    if (auraCoordinates) {
      const aura = document.createElement("span");
      aura.className = `point-aura point-aura-${point.type}`;
      aura.dataset.pointId = point.id;
      setDevLayoutMetadata(aura, {
        targetId: `aura:${point.id}`,
        layoutKey: "POINT_AURA_COORDINATES",
        pointId: point.id,
        targetType: "aura"
      });
      setMapImagePosition(aura, auraCoordinates.x, auraCoordinates.y);
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
    setDevLayoutMetadata(wrapper, {
      targetId: `point:${point.id}`,
      layoutKey: "BATTLE_POINTS",
      pointId: point.id,
      targetType: "point"
    });

    const frame = document.createElement("span");
    frame.className = "point-frame";
    setDevLayoutMetadata(frame, {
      targetId: `shield:${point.id}`,
      layoutKey: "MAP_LAYOUT_CSS_VARS",
      pointId: point.id,
      role: "shield",
      targetType: "shield"
    });
    wrapper.appendChild(frame);

    const swordFrame = document.createElement("span");
    swordFrame.className = "point-sword-frame";
    setDevLayoutMetadata(swordFrame, {
      targetId: `sword:${point.id}`,
      layoutKey: "MAP_LAYOUT_CSS_VARS",
      pointId: point.id,
      role: "sword",
      targetType: "sword"
    });
    wrapper.appendChild(swordFrame);

    const labels = document.createElement("div");
    labels.className = "point-labels";
    setDevLayoutMetadata(labels, {
      targetId: `labels:${point.id}`,
      layoutKey: "MAP_LAYOUT_CSS_VARS",
      pointId: point.id,
      role: "pointLabels",
      targetType: "pointLabels"
    });

    const selectGroup = document.createElement("div");
    selectGroup.className = "point-selects";
    setDevLayoutMetadata(selectGroup, {
      targetId: `select:${point.id}`,
      layoutKey: "MAP_LAYOUT_CSS_VARS",
      pointId: point.id,
      role: "select",
      targetType: "select"
    });

    const attackerSelect = document.createElement("select");
    attackerSelect.className = "point-attacker-select";
    attackerSelect.setAttribute("aria-label", `${point.id} attacking guild`);
    selectGroup.appendChild(attackerSelect);

    const defenderSelect = document.createElement("select");
    defenderSelect.className = "point-defender-select";
    defenderSelect.setAttribute("aria-label", `${point.id} occupying guild`);
    selectGroup.appendChild(defenderSelect);
    wrapper.appendChild(labels);
    wrapper.appendChild(selectGroup);
    applyPointUiOffsets(wrapper, point.id);

    // const mobileIcons = document.createElement("div");
    // mobileIcons.className = "point-mobile-icons";

    // const attackerChip = document.createElement("button");
    // attackerChip.type = "button";
    // attackerChip.className = "point-chip point-attacker-chip";
    // attackerChip.setAttribute("aria-label", `${point.id}の布告ギルドを選択`);
    // attackerChip.addEventListener("click", () => openMobilePointPicker(wrapper));
    // mobileIcons.appendChild(attackerChip);

    // const defenderChip = document.createElement("button");
    // defenderChip.type = "button";
    // defenderChip.className = "point-chip point-defender-chip";
    // defenderChip.setAttribute("aria-label", `${point.id}の占拠ギルドを選択`);
    // defenderChip.addEventListener("click", () => openMobilePointPicker(wrapper));
    // mobileIcons.appendChild(defenderChip);

    // wrapper.appendChild(mobileIcons);

    fragment.appendChild(wrapper);
  });

  battlePoints.replaceChildren(fragment);
}

// Guild Options Update
export function updateGuildOptions() {
  const guilds = getGuildEntries();

  document.querySelectorAll(".point").forEach((point, index) => {
    const pointState = normalizePointState(state.pendingSelectStates[index]);
    const defenderSelect = point.querySelector(".point-defender-select");
    const attackerSelect = point.querySelector(".point-attacker-select");
    const currentdefender = defenderSelect.value || pointState.defender;
    const currentAttacker = attackerSelect.value || pointState.attacker;

    [defenderSelect, attackerSelect].forEach(select => {
      select.replaceChildren(createOption("", select === attackerSelect ? "選択" : "選択"));
      guilds.forEach(guild => {
        select.appendChild(createOption(guild.name, guild.name));
      });
    });

    defenderSelect.value = guilds.some(guild => guild.name === currentdefender) ? currentdefender : "";
    attackerSelect.value = guilds.some(guild => guild.name === currentAttacker) ? currentAttacker : "";
    setPointAura(point, defenderSelect.value);
    updatePointChip(point, defenderSelect.value);
    updatePointDeclaration(point, attackerSelect.value);
    updatePointSelfAttackState(point);
  });
}

// Score Calculation
export function calculateScoresFromStates(selectStates, guildNames) {
  const scores = createEmptyScores(guildNames);

  BATTLE_POINTS.forEach((point, index) => {
    addPointScore(scores, normalizePointState(selectStates[index]).defender, point.type || "church");
  });

  return scores;
}

export function getCumulativeScores(guildNames) {
  const scores = createEmptyScores(guildNames);
  const activeIndex = Math.max(0, state.occupationTabs.findIndex(tab => tab.id === state.activeTabId));
  const currentSelectStates = getCurrentSelectStates();

  state.occupationTabs.slice(0, activeIndex + 1).forEach(tab => {
    const selectStates = tab.id === state.activeTabId ? currentSelectStates : tab.selectStates;
    const tabScores = calculateScoresFromStates(selectStates, guildNames);

    guildNames.forEach(guildName => {
      scores[guildName].total += tabScores[guildName].total;
    });
  });

  return scores;
}

export function updateCumulativeScope() {
  const activeIndex = state.occupationTabs.findIndex(tab => tab.id === state.activeTabId);
  if (activeIndex < 0 || state.occupationTabs.length === 0) {
    state.elements.cumulativeScope.textContent = "";
    return;
  }

  const targetTabs = state.occupationTabs.slice(0, activeIndex + 1).map(tab => tab.name);
  state.elements.cumulativeScope.textContent = `累計対象: ${targetTabs.join(" / ")}`;
}

export function updateScores() {
  updateCumulativeScope();
  const guilds = getGuildEntries();
  const guildNames = guilds.map(guild => guild.name);
  const activeScores = createEmptyScores(guildNames);
  const cumulativeScores = getCumulativeScores(guildNames);

  if (state.highlightedGuildName && !guildNames.includes(state.highlightedGuildName)) {
    state.setHighlightedGuildName("");
    saveHighlightedGuildName("");
  }

  document.querySelectorAll(".point").forEach(point => {
    const selectedGuild = point.querySelector(".point-defender-select").value;
    const type = point.dataset.type || "church";
    addPointScore(activeScores, selectedGuild, type);
    setPointAura(point, selectedGuild);
    updatePointChip(point, selectedGuild);
    updatePointSelfAttackState(point);
  });

  const rows = Array.from({ length: 4 }, (_, index) => {
    const guild = guilds[index] || { name: "", color: GUILD_COLORS[index] };
    const score = activeScores[guild.name] || { total: 0, temple: 0, castle: 0, church: 0 };
    const cumulativeScore = cumulativeScores[guild.name]?.total || 0;
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.className = `score-guild-name-cell guild-cell${index + 1}`;

    if (state.isEditingGuildNames) {
      const input = document.createElement("input");
      input.className = "score-guild-name-input";
      input.value = state.guildNameDrafts[index] || guild.name || `ギルド${index + 1}`;
      input.maxLength = 24;
      input.setAttribute("aria-label", `ギルド${index + 1}名`);
      input.addEventListener("input", () => {
        const drafts = [...state.guildNameDrafts];
        drafts[index] = input.value;
        state.setGuildNameDrafts(drafts);
      });
      nameCell.appendChild(input);
    } else {
      nameCell.textContent = guild.name;
    }
    row.append(
      createScoreGuildRadioCell(guild.name),
      nameCell,
      createScoreCell(score.temple),
      createScoreCell(score.castle),
      createScoreCell(score.church),
      createScoreCell(score.total, "score-total"),
      createScoreCell(cumulativeScore, "score-cumulative")
    );

    return row;
  });

  const scoreBody = getRequiredElement("scoreBody", "score-body");
  if (!scoreBody) return;

  scoreBody.replaceChildren(...rows);
  updateHighlightedGuildSelects();
}

// Select States
const OCCUPATION_HISTORY_LIMIT = 10;

function getOccupationHistory(tabId = state.activeTabId) {
  if (!tabId) return null;
  if (!state.occupationHistoryByTabId[tabId]) {
    state.occupationHistoryByTabId[tabId] = { undoStack: [], redoStack: [] };
  }
  return state.occupationHistoryByTabId[tabId];
}

function createOccupationHistoryEntry(beforeStates, afterStates) {
  const changes = BATTLE_POINTS.map((point, index) => {
    const before = normalizePointState(beforeStates[index]);
    const after = normalizePointState(afterStates[index]);

    if (before.attacker === after.attacker && before.defender === after.defender) return null;
    return { pointId: point.id, before, after };
  }).filter(Boolean);

  return changes.length ? { changes } : null;
}

function pushOccupationHistory(entry, tabId = state.activeTabId) {
  if (!entry?.changes?.length) return;

  const history = getOccupationHistory(tabId);
  if (!history) return;

  history.undoStack.push(entry);
  if (history.undoStack.length > OCCUPATION_HISTORY_LIMIT) {
    history.undoStack.shift();
  }
  history.redoStack = [];
  updateOccupationHistoryControls();
}

function applyOccupationHistoryEntry(entry, direction) {
  const nextStates = getCurrentSelectStates();
  const stateKey = direction === "undo" ? "before" : "after";

  entry.changes.forEach(change => {
    const pointIndex = BATTLE_POINTS.findIndex(point => point.id === change.pointId);
    if (pointIndex < 0) return;
    nextStates[pointIndex] = { ...change[stateKey] };
  });

  applySelectStates(nextStates);
  saveSelectStates();
  updateOccupationHistoryControls();
}

export function recordCurrentOccupationEdit() {
  const activeTab = getActiveTab();
  if (!activeTab) return;

  pushOccupationHistory(createOccupationHistoryEntry(activeTab.selectStates, getCurrentSelectStates()), activeTab.id);
}

export function canUndoOccupation(tabId = state.activeTabId) {
  return Boolean(getOccupationHistory(tabId)?.undoStack.length);
}

export function canRedoOccupation(tabId = state.activeTabId) {
  return Boolean(getOccupationHistory(tabId)?.redoStack.length);
}

export function updateOccupationHistoryControls() {
  if (state.elements.mapUndoButton) {
    state.elements.mapUndoButton.disabled = !canUndoOccupation();
  }
  if (state.elements.mapRedoButton) {
    state.elements.mapRedoButton.disabled = !canRedoOccupation();
  }
}

export function undoOccupationChange() {
  const history = getOccupationHistory();
  if (!history?.undoStack.length) return false;

  const entry = history.undoStack.pop();
  applyOccupationHistoryEntry(entry, "undo");
  history.redoStack.push(entry);
  updateOccupationHistoryControls();
  return true;
}

export function redoOccupationChange() {
  const history = getOccupationHistory();
  if (!history?.redoStack.length) return false;

  const entry = history.redoStack.pop();
  applyOccupationHistoryEntry(entry, "redo");
  history.undoStack.push(entry);
  updateOccupationHistoryControls();
  return true;
}

function deleteOccupationHistory(tabId) {
  if (!tabId) return;
  delete state.occupationHistoryByTabId[tabId];
}

function clearOccupationHistory() {
  state.setOccupationHistoryByTabId({});
  updateOccupationHistoryControls();
}

export function getCurrentSelectStates() {
  return Array.from(document.querySelectorAll(".point")).map(point => ({
    defender: point.querySelector(".point-defender-select")?.value || "",
    attacker: point.querySelector(".point-attacker-select")?.value || ""
  }));
}

export function applySelectStates(selectStates = createEmptyOccupationStates()) {
  state.setPendingSelectStates(cloneOccupationStates(selectStates));
  document.querySelectorAll(".point").forEach((point, index) => {
    const pointState = normalizePointState(state.pendingSelectStates[index]);
    const defenderSelect = point.querySelector(".point-defender-select");
    const attackerSelect = point.querySelector(".point-attacker-select");

    defenderSelect.value = pointState.defender;
    attackerSelect.value = pointState.attacker;
    setPointAura(point, pointState.defender);
    updatePointChip(point, pointState.defender);
    updatePointDeclaration(point, pointState.attacker);
    updatePointSelfAttackState(point);
  });
  updateScores();
}

export function saveSelectStates() {
  persistCurrentTabState();
}

export function restoreSelectStates() {
  applySelectStates(getActiveTab()?.selectStates);
}

// Tab Management
export function createOccupationTab(index, selectStates = createEmptyOccupationStates()) {
  return {
    id: `tab-${Date.now()}-${index}`,
    name: `Day ${index}`,
    selectStates: cloneOccupationStates(selectStates)
  };
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

export function persistCurrentTabState() {
  const activeTab = getActiveTab();
  if (!activeTab) return;

  activeTab.selectStates = getCurrentSelectStates();
  saveOccupationTabs();
}

export function saveOccupationTabs() {
  localStorage.setItem(STORAGE_KEYS.occupationTabs, JSON.stringify({
    activeTabId: state.activeTabId,
    tabs: state.occupationTabs
  }));
}

export function loadOccupationTabs() {
  const saved = parseStoredJson(STORAGE_KEYS.occupationTabs, null);
  const legacySelectStates = parseStoredJson(STORAGE_KEYS.selectStates, null);

  if (saved?.tabs?.length) {
    state.setOccupationTabs(saved.tabs.map((tab, index) => ({
      id: tab.id || `tab-${index + 1}`,
      name: tab.name || String(index + 1),
      selectStates: Array.isArray(tab.selectStates) ? cloneOccupationStates(tab.selectStates) : createEmptyOccupationStates()
    })));
    state.setActiveTabId(saved.activeTabId || state.occupationTabs[0].id);
    return;
  }

  state.setOccupationTabs([
    createOccupationTab(1, Array.isArray(legacySelectStates) ? legacySelectStates : createEmptyOccupationStates())
  ]);
  state.setActiveTabId(state.occupationTabs[0].id);
  saveOccupationTabs();
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
  const sourceStates = getActiveTab()?.selectStates || createEmptyOccupationStates();
  const newTab = createOccupationTab(nextIndex, cloneOccupationStates(sourceStates));
  state.occupationTabs.push(newTab);
  state.setActiveTabId(newTab.id);
  saveOccupationTabs();
  renderOccupationTabs();
  scrollOccupationTabsToEnd();
  updateGuildOptions();
  applySelectStates(newTab.selectStates);
  updateOccupationHistoryControls();
}

export function deleteActiveOccupationTab() {
  if (state.occupationTabs.length <= 1) return;

  const activeIndex = state.occupationTabs.findIndex(tab => tab.id === state.activeTabId);
  const activeTab = getActiveTab();
  if (!activeTab) return;

  const confirmed = window.confirm("選択中のタブを削除します。\nこの操作はUndoでは戻せません。");
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

export function resetOccupationTabs() {
  state.setOccupationTabs([createOccupationTab(1)]);
  state.setActiveTabId(state.occupationTabs[0].id);
  state.setEditingTabId("");
  state.setPendingSelectStates(state.occupationTabs[0].selectStates);
  saveOccupationTabs();
  renderOccupationTabs();
  updateOccupationHistoryControls();
}

// Mobile Point Picker
export function closeMobilePointPicker() {
  state.setActiveMobilePoint(null);
  state.elements.mobilePointPicker.hidden = true;
  const mobilePointPickerOptions = getRequiredElement("mobilePointPickerOptions", "mobile-point-picker-options");
  if (!mobilePointPickerOptions) return;

  mobilePointPickerOptions.replaceChildren();
}

export function setPointGuild(point, role, guildName) {
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

export function openMobilePointPicker(point) {
  state.setActiveMobilePoint(point);
  const defenderSelect = point.querySelector(".point-defender-select");
  const attackerSelect = point.querySelector(".point-attacker-select");
  const pointLabel = point.dataset.id || "拠点";
  state.elements.mobilePointPickerTitle.textContent = pointLabel;

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

  const mobilePointPickerOptions = getRequiredElement("mobilePointPickerOptions", "mobile-point-picker-options");
  if (!mobilePointPickerOptions) return;

  mobilePointPickerOptions.replaceChildren(
    createGroup("防衛側", "defender", defenderSelect, "未選択"),
    createGroup("布告側", "attacker", attackerSelect, "布告なし")
  );
  state.elements.mobilePointPicker.hidden = false;
}

// Internal function for applyBattleData
let _setPendingStateFn = null;

export function _setSetPendingStateFn(fn) {
  _setPendingStateFn = fn;
}

// Apply Battle Data
export function applyBattleData() {
  const beforeSelectStates = getCurrentSelectStates();

  if (state.usesFallbackGuilds) {
    const nextGuilds = state.pendingGuilds.length ? state.pendingGuilds : getEditableGuildNames();
    state.setCurrentGuilds(nextGuilds);
    saveAppliedGuilds();
    renderGuildGrid(state.currentGuilds);
    resetOccupationTabs();
    updateGuildOptions();
    applySelectStates(state.occupationTabs[0].selectStates);
    pushOccupationHistory(createOccupationHistoryEntry(beforeSelectStates, getCurrentSelectStates()));
    updateScores();
    state.setUsesFallbackGuilds(false);
    if (_setPendingStateFn) {
      _setPendingStateFn(false);
    }
    updateOccupationHistoryControls();
    setStatus("仮名ギルドを反映しました。", "success");
    return;
  }

  if (!state.currentBattleData || !Array.isArray(state.currentBattleData.castles)) return;

  const nextGuilds = state.pendingGuilds.length ? state.pendingGuilds : Object.values(state.currentBattleData.guilds || {});
  if (state.currentGuilds.length > 0 && areGuildsDifferent(nextGuilds)) {
    const confirmed = window.confirm(
      "最新の拠点情報から取得したギルド名が、現在の拠点情報のギルドと異なります。\n" +
      "各拠点情報およびタブをすべて初期化してから反映します。よろしいですか？"
    );

    if (!confirmed) return;
    resetOccupationTabs();
  }

  state.setCurrentGuilds(nextGuilds);
  saveAppliedGuilds();
  renderGuildGrid(state.currentGuilds);
  updateGuildOptions();

  const guilds = state.currentBattleData.guilds || {};
  const castlesById = new Map(state.currentBattleData.castles.map(castle => [castle.CastleId, castle]));

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
    updatePointSelfAttackState(point);
  });

  pushOccupationHistory(createOccupationHistoryEntry(beforeSelectStates, getCurrentSelectStates()));
  saveSelectStates();
  updateScores();
  if (_setPendingStateFn) {
    _setPendingStateFn(false);
  }
  updateOccupationHistoryControls();
  setStatus("拠点情報を反映しました。", "success");
}

// Reset Data
export function resetAllData() {
  const confirmed = window.confirm("全ての占拠データを初期化します。\nこの操作はUndoでは戻せません。");
  if (!confirmed) return;

  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  clearOccupationHistory();

  state.setCurrentBattleData(null);
  state.setCurrentGuilds([]);
  state.setPendingGuilds([]);
  state.setPendingSelectStates([]);
  state.setHighlightedGuildName("");
  state.setIsEditingGuildNames(false);
  state.setGuildNameDrafts([]);
  state.setUsesFallbackGuilds(false);
  state.setOccupationTabs([createOccupationTab(1)]);
  state.setActiveTabId(state.occupationTabs[0].id);
  state.setEditingTabId("");
  state.setExpandedWorldRangeKeys(new Set());

  state.elements.server.value = "1";
  state.elements.world.value = "";
  state.elements.battleClass.value = "3";
  state.elements.block.value = "0";

  renderEmptyGuildGrid();
  updateGuildNameEditControls();
  updateWorldOptions();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(state.occupationTabs[0].selectStates);
  saveOccupationTabs();
  if (_setPendingStateFn) {
    _setPendingStateFn(false);
  }
  state.elements.applyButton.disabled = true;
  updateOccupationHistoryControls();
  setStatus("全データを初期化しました。", "success");
}
