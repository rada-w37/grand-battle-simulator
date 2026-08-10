import { GUILD_COLORS, GUILD_MARKER_ICONS, GUILD_MARKER_COLORS, SWORD_MARKER_ICON } from "./constants.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS, POINT_AURA_COORDINATES } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import * as state from "./state.js?v=20260810-empty-row";
import { cloneOccupationStates, normalizePointState, createEmptyOccupationStates, getGuildEntries, getGuildIndex, getColorForGuildName, getAuraColorForGuildName, setMapImagePosition, createScoreCell, getTabDayNumber, getNextTabDayNumber, getActiveTab, createOption } from "./utils.js?v=20260810-empty-row";
import { getStorageItem, readJsonStorage, removeStorageItem, removeStorageKeys, setStorageItem, STORAGE_KEYS, writeJsonStorage } from "./infrastructure/storage.js?v=20260524-visibility-toggles";
import { updateWorldOptions } from "./worldSelector.js?v=20260810-empty-row";
import { getEditableGuildNames, updateGuildNameEditControls } from "./guildNameEditor.js?v=20260810-empty-row";
import { renderEmptyGuildGrid, renderGuildGrid } from "./renderGuildGrid.js?v=20260810-empty-row";
import { renderStructurePlacements, renderBannerPlacements } from "./renderMapDecorations.js?v=20260810-empty-row";
import { renderOccupationTabs, resetOccupationTabs } from "./occupationTabs.js?v=20260810-empty-row";
import { applyPointUiOffsets } from "./layout/point-ui-layout.js?v=20260524-visibility-toggles";
import { setDevLayoutMetadata } from "./presentation/dom-helpers.js?v=20260524-visibility-toggles";
import { decideBattleDataApplication, prepareBattleDataApplicationState, resolveFallbackGuildNames } from "./application/battle-data-boundary.js?v=20260810-empty-row";
import { showBattleDataConfirmation, showDestructiveConfirmation } from "./presentation/battle-data-dialog.js?v=20260810-empty-row";
import {
  canSharePngFile,
  captureMapPng,
  createMapExportFilename,
  downloadPngFile,
  sharePngFile
} from "./presentation/map-export.js?v=20260810-empty-row";
import { applyOccupationHistoryEntryToStates, createOccupationHistoryEntry } from "./domain/occupation-history.js?v=20260524-visibility-toggles";
import { getDeclarationCandidateGuildNames } from "./domain/declaration-candidates.js?v=20260810-declaration-candidates";
import { addPointScore, calculateCumulativeScores, calculateScoresFromStates as calculateDomainScoresFromStates, createEmptyScores } from "./domain/scoring.js?v=20260524-visibility-toggles";

export {
  _setFetchBattleDataFn,
  hideWorldSuggestions,
  showWorldSuggestions,
  selectWorld,
  renderWorldSuggestions,
  updateWorldOptions
} from "./worldSelector.js?v=20260810-empty-row";

export {
  startGuildNameEditing,
  cancelGuildNameEditing,
  confirmGuildNameEditing,
  getEditableGuildNames,
  updateGuildNameEditControls
} from "./guildNameEditor.js?v=20260810-empty-row";

export {
  renderEmptyGuildGrid,
  renderGuildGrid
} from "./renderGuildGrid.js?v=20260810-empty-row";

export {
  focusEditingTabName,
  hideTabContextMenu,
  startEditingTab,
  commitEditingTab,
  cancelEditingTab,
  showTabContextMenu,
  renderOccupationTabs,
  switchOccupationTab,
  addOccupationTab,
  deleteActiveOccupationTab,
  resetOccupationTabs,
  updateTabScrollState
} from "./occupationTabs.js?v=20260810-empty-row";

export {
  refreshMapLayout
} from "./layout/point-ui-layout.js?v=20260810-empty-row";

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
  state.setCurrentGuilds(readJsonStorage(STORAGE_KEYS.appliedGuilds, []));
}

export function saveAppliedGuilds() {
  writeJsonStorage(STORAGE_KEYS.appliedGuilds, state.currentGuilds);
}

export function loadHighlightedGuildName() {
  const savedName = getStorageItem(STORAGE_KEYS.highlightedGuildName) || "";
  if (savedName && state.currentGuilds.includes(savedName)) {
    state.setHighlightedGuildName(savedName);
    return;
  }

  state.setHighlightedGuildName("");
  if (savedName) {
    removeStorageItem(STORAGE_KEYS.highlightedGuildName);
  }
}

function saveHighlightedGuildName(guildName) {
  if (guildName) {
    setStorageItem(STORAGE_KEYS.highlightedGuildName, guildName);
  } else {
    removeStorageItem(STORAGE_KEYS.highlightedGuildName);
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
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-labelledby", `point-label-${point.id}`);
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
function replaceGuildSelectOptions(select, guildNames) {
  select.replaceChildren(
    createOption("", "選択"),
    ...guildNames.map(guildName => createOption(guildName, guildName))
  );
}

export function updateAttackerGuildOptions(selectStates = getCurrentSelectStates()) {
  const guildNames = getGuildEntries().map(guild => guild.name);

  document.querySelectorAll(".point").forEach((point, index) => {
    const attackerSelect = point.querySelector(".point-attacker-select");
    const pointState = normalizePointState(selectStates[index]);
    const candidateGuildNames = getDeclarationCandidateGuildNames({
      targetPointId: point.dataset.id,
      battlePoints: BATTLE_POINTS,
      selectStates,
      guildNames
    });

    replaceGuildSelectOptions(attackerSelect, candidateGuildNames);
    attackerSelect.value = candidateGuildNames.includes(pointState.attacker) ? pointState.attacker : "";
    updatePointDeclaration(point, attackerSelect.value);
    updatePointSelfAttackState(point);
  });
}

export function updateGuildOptions() {
  const guilds = getGuildEntries();
  const guildNames = guilds.map(guild => guild.name);
  const points = Array.from(document.querySelectorAll(".point"));
  const pointStates = points.map((point, index) => {
    const pendingPointState = normalizePointState(state.pendingSelectStates[index]);
    return {
      defender: point.querySelector(".point-defender-select").value || pendingPointState.defender,
      attacker: point.querySelector(".point-attacker-select").value || pendingPointState.attacker
    };
  });

  points.forEach((point, index) => {
    const defenderSelect = point.querySelector(".point-defender-select");
    replaceGuildSelectOptions(defenderSelect, guildNames);
    defenderSelect.value = guildNames.includes(pointStates[index].defender) ? pointStates[index].defender : "";
    setPointAura(point, defenderSelect.value);
    updatePointChip(point, defenderSelect.value);
  });

  updateAttackerGuildOptions(points.map((point, index) => ({
    defender: point.querySelector(".point-defender-select").value,
    attacker: pointStates[index].attacker
  })));
}

// Score Calculation
export function calculateScoresFromStates(selectStates, guildNames) {
  return calculateDomainScoresFromStates(selectStates, guildNames, BATTLE_POINTS);
}

export function getCumulativeScores(guildNames) {
  return calculateCumulativeScores({
    occupationTabs: state.occupationTabs,
    activeTabId: state.activeTabId,
    currentSelectStates: getCurrentSelectStates(),
    guildNames,
    battlePoints: BATTLE_POINTS
  });
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
  const nextStates = applyOccupationHistoryEntryToStates(getCurrentSelectStates(), entry, direction, BATTLE_POINTS);

  applySelectStates(nextStates);
  saveSelectStates();
  updateOccupationHistoryControls();
}

export function recordCurrentOccupationEdit() {
  const activeTab = getActiveTab();
  if (!activeTab) return;

  pushOccupationHistory(createOccupationHistoryEntry(activeTab.selectStates, getCurrentSelectStates(), BATTLE_POINTS), activeTab.id);
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

export function deleteOccupationHistory(tabId) {
  if (!tabId) return;
  delete state.occupationHistoryByTabId[tabId];
}

export function clearOccupationHistory() {
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

    defenderSelect.value = pointState.defender;
    setPointAura(point, pointState.defender);
    updatePointChip(point, pointState.defender);
  });
  updateAttackerGuildOptions(state.pendingSelectStates);
  state.setPendingSelectStates(getCurrentSelectStates());
  updateScores();
}

export function saveSelectStates() {
  persistCurrentTabState();
}

export function restoreSelectStates() {
  applySelectStates(getActiveTab()?.selectStates);
}

// Tab Management
export function createOccupationTab(index, selectStates = createEmptyOccupationStates(), appliedSnapshotStates = null) {
  return {
    id: `tab-${Date.now()}-${index}`,
    name: `Day ${index}`,
    selectStates: cloneOccupationStates(selectStates),
    appliedSnapshotStates: Array.isArray(appliedSnapshotStates)
      ? cloneOccupationStates(appliedSnapshotStates)
      : null
  };
}

export function persistCurrentTabState() {
  const activeTab = getActiveTab();
  if (!activeTab) return;

  activeTab.selectStates = getCurrentSelectStates();
  saveOccupationTabs();
}

export function saveOccupationTabs() {
  writeJsonStorage(STORAGE_KEYS.occupationTabs, {
    activeTabId: state.activeTabId,
    appliedContext: state.appliedBattleContext,
    tabs: state.occupationTabs
  });
}

export function loadOccupationTabs() {
  const saved = readJsonStorage(STORAGE_KEYS.occupationTabs, null);
  const legacySelectStates = readJsonStorage(STORAGE_KEYS.selectStates, null);

  if (saved?.tabs?.length) {
    state.setOccupationTabs(saved.tabs.map((tab, index) => ({
      id: tab.id || `tab-${index + 1}`,
      name: tab.name || String(index + 1),
      selectStates: Array.isArray(tab.selectStates) ? cloneOccupationStates(tab.selectStates) : createEmptyOccupationStates(),
      appliedSnapshotStates: Array.isArray(tab.appliedSnapshotStates)
        ? cloneOccupationStates(tab.appliedSnapshotStates)
        : null
    })));
    state.setAppliedBattleContext(saved.appliedContext || null);
    state.setActiveTabId(saved.activeTabId || state.occupationTabs[0].id);
    return;
  }

  state.setOccupationTabs([
    createOccupationTab(1, Array.isArray(legacySelectStates) ? legacySelectStates : createEmptyOccupationStates())
  ]);
  state.setAppliedBattleContext(null);
  state.setActiveTabId(state.occupationTabs[0].id);
  saveOccupationTabs();
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
  const selectedGuildName = select.value;

  if (role === "attacker") {
    updatePointDeclaration(point, selectedGuildName);
  } else {
    setPointAura(point, selectedGuildName);
    updatePointChip(point, selectedGuildName);
    updateAttackerGuildOptions();
  }

  updatePointSelfAttackState(point);
  saveSelectStates();
  updateScores();
}

export function openMobilePointPicker(point) {
  state.setActiveMobilePoint(point);
  const defenderSelect = point.querySelector(".point-defender-select");
  const attackerSelect = point.querySelector(".point-attacker-select");
  const guilds = getGuildEntries();
  const attackerGuildNames = new Set(getDeclarationCandidateGuildNames({
    targetPointId: point.dataset.id,
    battlePoints: BATTLE_POINTS,
    selectStates: getCurrentSelectStates(),
    guildNames: guilds.map(guild => guild.name)
  }));
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
    const optionGuilds = role === "attacker"
      ? guilds.filter(guild => attackerGuildNames.has(guild.name))
      : guilds;
    const optionItems = [
      { label: emptyLabel, value: "" },
      ...optionGuilds.map((guild, index) => ({
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
let isBattleDataApplyInProgress = false;
let pendingMapExport = null;
let mapExportStatusTimer = 0;

function getPendingBattleApplication() {
  if (state.pendingBattleApplication) return state.pendingBattleApplication;

  if (state.currentBattleData && Array.isArray(state.currentBattleData.castles)) {
    const prepared = prepareBattleDataApplicationState({
      battleData: state.currentBattleData,
      pendingGuilds: state.pendingGuilds,
      battlePoints: BATTLE_POINTS
    });
    return {
      context: null,
      guilds: prepared.guilds,
      occupationStates: prepared.occupationStates,
      sourceType: "legacy"
    };
  }

  if (state.usesFallbackGuilds) {
    return {
      context: null,
      guilds: resolveFallbackGuildNames({
        pendingGuilds: state.pendingGuilds,
        editableGuildNames: getEditableGuildNames()
      }),
      occupationStates: createEmptyOccupationStates(),
      sourceType: "fallback"
    };
  }

  return null;
}

function setAppliedSnapshot(activeTab, snapshotStates) {
  if (!activeTab) return;

  const currentStates = getCurrentSelectStates();
  activeTab.selectStates = cloneOccupationStates(currentStates);
  activeTab.appliedSnapshotStates = cloneOccupationStates(snapshotStates);
}

function finishBattleDataApply(pending) {
  state.setPendingBattleApplication(null);
  state.setUsesFallbackGuilds(false);
  if (_setPendingStateFn) {
    _setPendingStateFn(false);
  }
  state.setAppliedBattleContext(pending.context || null);
  saveOccupationTabs();
  updateScores();
  updateOccupationHistoryControls();
}

function applyBattleDataToCurrentTab({ pending, beforeSelectStates, recordHistory }) {
  const nextGuilds = pending.guilds;
  const snapshotStates = pending.occupationStates || createEmptyOccupationStates();
  const activeTab = getActiveTab();

  state.setCurrentGuilds(nextGuilds);
  saveAppliedGuilds();
  renderGuildGrid(state.currentGuilds);
  updateGuildOptions();
  applySelectStates(snapshotStates);

  const afterSelectStates = getCurrentSelectStates();
  if (recordHistory && activeTab) {
    pushOccupationHistory(
      createOccupationHistoryEntry(beforeSelectStates, afterSelectStates, BATTLE_POINTS),
      activeTab.id
    );
  }

  setAppliedSnapshot(activeTab, snapshotStates);
  saveSelectStates();
  saveOccupationTabs();
  finishBattleDataApply(pending);
}

function replaceBattleDataWorkspace(pending) {
  const snapshotStates = pending.occupationStates || createEmptyOccupationStates();

  clearOccupationHistory();
  state.setAppliedBattleContext(pending.context || null);
  state.setCurrentGuilds(pending.guilds);
  saveAppliedGuilds();
  renderGuildGrid(state.currentGuilds);
  resetOccupationTabs({
    selectStates: snapshotStates,
    appliedSnapshotStates: snapshotStates
  });
  updateGuildOptions();
  applySelectStates(snapshotStates);
  setAppliedSnapshot(getActiveTab(), snapshotStates);
  saveOccupationTabs();
  finishBattleDataApply(pending);
}

function createBattleDataTab(pending) {
  const snapshotStates = pending.occupationStates || createEmptyOccupationStates();
  const nextIndex = getNextTabDayNumber();

  persistCurrentTabState();
  state.setAppliedBattleContext(pending.context || null);
  const newTab = createOccupationTab(nextIndex, snapshotStates, snapshotStates);
  state.occupationTabs.push(newTab);
  state.setActiveTabId(newTab.id);
  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(snapshotStates);
  saveOccupationTabs();
  finishBattleDataApply(pending);
}

export async function applyBattleData() {
  if (isBattleDataApplyInProgress) return;

  const pending = getPendingBattleApplication();
  const activeTab = getActiveTab();
  if (!pending || !activeTab) return;

  const beforeSelectStates = getCurrentSelectStates();
  const decision = decideBattleDataApplication({
    currentContext: state.appliedBattleContext,
    pendingContext: pending.context,
    currentGuilds: state.currentGuilds,
    nextGuilds: pending.guilds,
    currentStates: beforeSelectStates,
    baselineStates: activeTab.appliedSnapshotStates ?? null,
    pendingStates: pending.occupationStates || createEmptyOccupationStates(),
    tabCount: state.occupationTabs.length,
    usesFallbackGuilds: pending.sourceType === "fallback"
  });

  let action = "immediate";
  if (decision.mode !== "immediate") {
    isBattleDataApplyInProgress = true;
    try {
      action = await showBattleDataConfirmation({
        mode: decision.mode,
        reason: decision.reason,
        context: pending.context
      });
    } finally {
      isBattleDataApplyInProgress = false;
    }

    if (state.pendingBattleApplication && state.pendingBattleApplication !== pending) return;
    if (action === "cancel") return;
  }

  if (decision.mode === "replace" || action === "replace") {
    replaceBattleDataWorkspace(pending);
  } else if (action === "new-tab") {
    createBattleDataTab(pending);
  } else {
    applyBattleDataToCurrentTab({
      pending,
      beforeSelectStates,
      recordHistory: decision.reason !== "already-applied"
    });
  }

  setStatus("拠点情報を反映しました。", "success");
}

function setMapExportStatus(message, { showSaveButton = false, type = "" } = {}) {
  const status = state.elements.mapExportStatus;
  const messageElement = state.elements.mapExportStatusMessage;
  const saveButton = state.elements.mapExportSaveButton;
  if (!status || !messageElement || !saveButton) return;

  window.clearTimeout(mapExportStatusTimer);
  messageElement.textContent = message;
  status.dataset.type = type;
  status.hidden = !message;
  saveButton.hidden = !showSaveButton;
  saveButton.disabled = false;

  if (message && !showSaveButton) {
    mapExportStatusTimer = window.setTimeout(() => {
      status.hidden = true;
      messageElement.textContent = "";
      status.dataset.type = "";
    }, 5000);
  }
}

export async function exportCurrentMapPng() {
  const button = state.elements.mapScreenshotButton;
  if (!button || button.disabled) return;

  const activeTab = getActiveTab();
  const tabName = activeTab?.name || "Day";
  const filename = createMapExportFilename(tabName);
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  setMapExportStatus("MAP画像を作成しています。");

  try {
    const blob = await captureMapPng(document.querySelector(".map-container"));
    const file = new File([blob], filename, { type: "image/png" });

    if (canSharePngFile(file)) {
      pendingMapExport = { file, filename };
      setMapExportStatus("画像を作成しました。保存ボタンを押してください。", {
        showSaveButton: true,
        type: "success"
      });
    } else {
      downloadPngFile(blob, filename);
      setMapExportStatus("MAP画像を保存しました。", { type: "success" });
    }
  } catch (error) {
    setMapExportStatus(error.message || "MAP画像の保存に失敗しました。", { type: "error" });
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}

export async function savePendingMapExport() {
  if (!pendingMapExport) return;

  const { file, filename } = pendingMapExport;
  const saveButton = state.elements.mapExportSaveButton;
  if (saveButton) saveButton.disabled = true;

  try {
    if (canSharePngFile(file)) {
      await sharePngFile(file);
      setMapExportStatus("保存先を選択しました。", { type: "success" });
      pendingMapExport = null;
      return;
    }

    downloadPngFile(file, filename);
    setMapExportStatus("MAP画像を保存しました。", { type: "success" });
    pendingMapExport = null;
  } catch (error) {
    if (error?.name === "AbortError") {
      setMapExportStatus("保存をキャンセルしました。");
      return;
    }

    downloadPngFile(file, filename);
    setMapExportStatus("MAP画像をダウンロードしました。", { type: "success" });
    pendingMapExport = null;
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

// Reset Data
export async function resetAllData() {
  const confirmed = await showDestructiveConfirmation({
    title: "全データを初期化しますか？",
    message: "全ての占拠データ、タブ、履歴を初期化します。",
    confirmLabel: "初期化"
  });
  if (!confirmed) return;

  removeStorageKeys();
  clearOccupationHistory();

  state.setCurrentBattleData(null);
  state.setCurrentGuilds([]);
  state.setPendingGuilds([]);
  state.setPendingBattleApplication(null);
  state.setPendingSelectStates([]);
  state.setHighlightedGuildName("");
  state.setIsEditingGuildNames(false);
  state.setGuildNameDrafts([]);
  state.setUsesFallbackGuilds(false);
  state.setAppliedBattleContext(null);
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
