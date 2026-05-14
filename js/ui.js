import { GUILD_COLORS, GUILD_MARKER_ICONS, GUILD_MARKER_COLORS, GUILD_AURA_COLORS, EMPTY_POINT_COLOR, MAP_IMAGE_SIZE, SWORD_MARKER_ICON, MAP_STRUCTURE_PLACEMENTS, MAP_BANNER_PLACEMENTS, BATTLE_POINTS, POINT_AURA_COORDINATES, STORAGE_KEYS, POINT_SCORES } from "./constants.js";
import * as state from "./state.js";
import { parseStoredJson, cloneOccupationStates, normalizePointState, createEmptyOccupationStates, getGuildEntries, getGuildIndex, getColorForGuildName, getAuraColorForGuildName, setMapImagePosition, createScoreCell, createScoreIconCell, createEmptyScores, addPointScore, getTabDayNumber, getNextTabDayNumber, getActiveTab, createOption, getAllPointSelects, normalizeWorldName } from "./utils.js";
import { getGroupedWorldOptions, getSelectedWorld, getFilteredWorldOptions, getOccupyingGuild, getAttackingGuild, areGuildsDifferent } from "./api.js";

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

// Guild Grid Display
export function renderEmptyGuildGrid() {
  renderGuildGrid(["", "", "", ""]);
}

export function renderGuildGrid(guildNames) {
  const cells = Array.from({ length: 4 }, (_, index) => {
    const cell = document.createElement("div");
    cell.className = `guild-cell guild-cell${index + 1}`;
    cell.textContent = guildNames[index] || "";
    return cell;
  });

  state.elements.guildGrid.replaceChildren(...cells);
}

// Guild Storage
export function loadAppliedGuilds() {
  state.setCurrentGuilds(parseStoredJson(STORAGE_KEYS.appliedGuilds, []));
}

export function saveAppliedGuilds() {
  localStorage.setItem(STORAGE_KEYS.appliedGuilds, JSON.stringify(state.currentGuilds));
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

export function updateAllPointChips() {
  document.querySelectorAll(".point").forEach(point => {
    const select = point.querySelector(".point-defender-select");
    updatePointChip(point, select.value);
    updatePointDeclaration(point, point.querySelector(".point-attacker-select")?.value || "");
  });
}

// Render Battle Points Map
export function renderBattlePoints() {
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

  state.elements.battlePoints.replaceChildren(fragment);
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
    //label.style.transform = `translate(-50%, calc(-50% - 2px)) scale(${placement.scale}%)`;
    label.style.transform = `translate(-50%, calc(-50% - 1px)) scale(${placement.scale / 35})`;
    label.style.transformOrigin = "center";
    setMapImagePosition(label, placement.x, placement.y);
    fragment.appendChild(label);
  });
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

  state.elements.scoreBody.replaceChildren(...rows);
}

// Select States
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

export function scheduleLongPressRename(tabId, target) {
  window.clearTimeout(state.longPressTimer);
  state.setLongPressTimer(window.setTimeout(() => {
    const rect = target.getBoundingClientRect();
    showTabContextMenu(tabId, rect.left, rect.bottom + 4);
    state.setSuppressNextMenuClose(true);
    window.setTimeout(() => {
      state.setSuppressNextMenuClose(false);
    }, 500);
  }, 650));
}

export function cancelLongPressRename() {
  window.clearTimeout(state.longPressTimer);
  state.setLongPressTimer(0);
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

  state.elements.occupationTabs.replaceChildren(...buttons, addButton);
  state.elements.deleteTabButton.disabled = state.occupationTabs.length <= 1;
}

export function switchOccupationTab(tabId) {
  if (tabId === state.activeTabId) return;

  persistCurrentTabState();
  state.setActiveTabId(tabId);
  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
}

export function addOccupationTab() {
  persistCurrentTabState();

  const nextIndex = getNextTabDayNumber();
  const sourceStates = getActiveTab()?.selectStates || createEmptyOccupationStates();
  const newTab = createOccupationTab(nextIndex, cloneOccupationStates(sourceStates));
  state.occupationTabs.push(newTab);
  state.setActiveTabId(newTab.id);
  state.setEditingTabId(newTab.id);
  saveOccupationTabs();
  renderOccupationTabs();
  focusEditingTabName();
  updateGuildOptions();
  applySelectStates(newTab.selectStates);
}

export function deleteActiveOccupationTab() {
  if (state.occupationTabs.length <= 1) return;

  const activeIndex = state.occupationTabs.findIndex(tab => tab.id === state.activeTabId);
  const activeTab = getActiveTab();
  if (!activeTab) return;

  const confirmed = window.confirm(`タブ「${activeTab.name}」の拠点状態を削除しますか？`);
  if (!confirmed) return;

  hideTabContextMenu();
  state.setEditingTabId("");
  state.occupationTabs.splice(activeIndex, 1);
  const nextIndex = Math.max(0, activeIndex - 1);
  state.setActiveTabId(state.occupationTabs[nextIndex].id);

  saveOccupationTabs();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(getActiveTab()?.selectStates);
}

export function resetOccupationTabs() {
  state.setOccupationTabs([createOccupationTab(1)]);
  state.setActiveTabId(state.occupationTabs[0].id);
  state.setEditingTabId("");
  state.setPendingSelectStates(state.occupationTabs[0].selectStates);
  saveOccupationTabs();
  renderOccupationTabs();
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
  const groups = getGroupedWorldOptions();

  if (groups.length === 0) {
    const empty = document.createElement("div");
    empty.className = "combo-empty";
    empty.textContent = "候補がありません";
    state.elements.worldSuggestions.replaceChildren(empty);
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

  state.elements.worldSuggestions.replaceChildren(fragment);
}

export function updateWorldOptions() {
  const currentWorld = normalizeWorldName(state.elements.world.value);
  const options = [];

  getFilteredWorldOptions().forEach(world => {
    const option = createOption(world.id, world.id);
    option.dataset.numeric = String(world.numeric);
    options.push(option);
  });

  state.elements.worldOptions.replaceChildren(...options);
  renderWorldSuggestions();

  if (currentWorld) {
    state.elements.world.value = currentWorld;
  }
}

// Mobile Point Picker
export function closeMobilePointPicker() {
  state.setActiveMobilePoint(null);
  state.elements.mobilePointPicker.hidden = true;
  state.elements.mobilePointPickerOptions.replaceChildren();
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

  state.elements.mobilePointPickerOptions.replaceChildren(
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
  });

  saveSelectStates();
  updateScores();
  if (_setPendingStateFn) {
    _setPendingStateFn(false);
  }
  setStatus("拠点情報を反映しました。", "success");
}

// Reset Data
export function resetAllData() {
  const confirmed = window.confirm("すべてのタブ、拠点状態、保存済み設定を初期化しますか？");
  if (!confirmed) return;

  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

  state.setCurrentBattleData(null);
  state.setCurrentGuilds([]);
  state.setPendingGuilds([]);
  state.setPendingSelectStates([]);
  state.setOccupationTabs([createOccupationTab(1)]);
  state.setActiveTabId(state.occupationTabs[0].id);
  state.setEditingTabId("");
  state.setExpandedWorldRangeKeys(new Set());

  state.elements.server.value = "1";
  state.elements.world.value = "";
  state.elements.battleClass.value = "3";
  state.elements.block.value = "0";

  renderEmptyGuildGrid();
  updateWorldOptions();
  renderOccupationTabs();
  updateGuildOptions();
  applySelectStates(state.occupationTabs[0].selectStates);
  saveOccupationTabs();
  if (_setPendingStateFn) {
    _setPendingStateFn(false);
  }
  state.elements.applyButton.disabled = true;
  setStatus("全データを初期化しました。", "success");
}
