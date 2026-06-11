import { API_BASE_URL, STORAGE_KEYS } from "./constants.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS } from "./layout/layout-config.js?v=20260524-visibility-toggles";
import * as state from "./state.js?v=20260524-visibility-toggles";
import { parseStoredJson, normalizeWorldName, getGuildEntries } from "./utils.js?v=20260524-visibility-toggles";
import {
  getGroupedWorldOptions as groupWorldOptions,
  getWorldOptionsForServer as createWorldOptionsForServer,
  getWorldRangeKey as getDomainWorldRangeKey,
  getWorldRangeLabel as getDomainWorldRangeLabel
} from "./domain/worlds.js?v=20260524-visibility-toggles";
export {
  getAttackingGuild,
  getOccupyingGuild
} from "./domain/battle-snapshot.js?v=20260524-visibility-toggles";

const FALLBACK_GUILDS = ["ギルド1", "ギルド2", "ギルド3", "ギルド4"];

// UI Function References (set by main.js)
let _setStatus = null;
let _renderGuildGrid = null;
let _renderEmptyGuildGrid = null;
let _updateGuildOptions = null;
let _applySelectStates = null;
let _updateWorldOptions = null;

export function _setUiFunctions(fns) {
  _setStatus = fns.setStatus;
  _renderGuildGrid = fns.renderGuildGrid;
  _renderEmptyGuildGrid = fns.renderEmptyGuildGrid;
  _updateGuildOptions = fns.updateGuildOptions;
  _applySelectStates = fns.applySelectStates;
  _updateWorldOptions = fns.updateWorldOptions;
}

// API Fetch
export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);

  const json = await response.json();
  if (json.status !== 200) throw new Error(`APIエラー: status ${json.status}`);

  return json.data;
}

// Load World Groups
export async function loadGroups() {
  if (_setStatus) _setStatus("ワールド情報を読み込み中...");
  state.setWorldGroupData(await fetchJson(`${API_BASE_URL}/wgroups`));
  if (_updateWorldOptions) _updateWorldOptions();
  if (_setStatus) _setStatus("");
}

// World Selection Utilities
export function getWorldOptionsForServer(serverId) {
  return createWorldOptionsForServer(state.worldGroupData, serverId);
}

export function getFilteredWorldOptions() {
  return getWorldOptionsForServer(state.elements.server.value);
}

export function getWorldRangeKey(world) {
  return getDomainWorldRangeKey(world);
}

export function getWorldRangeLabel(rangeStart, worlds) {
  const first = worlds[0].id;
  const last = worlds[worlds.length - 1].id;
  return `${first} ～ ${last}`;
}

export function getGroupedWorldOptions() {
  return groupWorldOptions(getFilteredWorldOptions());
}

export function getSelectedWorld() {
  const rawWorld = state.elements.world.value.trim();
  const normalizedWorld = normalizeWorldName(state.elements.world.value);
  if (!normalizedWorld) return null;

  return getWorldOptionsForServer(state.elements.server.value)
    .find(world => (
      world.id.toUpperCase() === normalizedWorld.toUpperCase() ||
      String(world.numeric) === rawWorld
    )) || null;
}

export function getSelectedGroupId(worldNumeric) {
  const group = state.worldGroupData.find(item => item.worlds.includes(worldNumeric));
  if (!group) throw new Error("ワールドに対応するグループが見つかりません");
  return group.group_id;
}

export function canFetchBattleData() {
  return state.elements.server.value &&
    getSelectedWorld() &&
    state.elements.battleClass.value &&
    state.elements.block.value;
}

// Battle Selection Storage
export function saveBattleSelection() {
  localStorage.setItem(STORAGE_KEYS.battleSelection, JSON.stringify({
    server: state.elements.server.value,
    world: normalizeWorldName(state.elements.world.value),
    battleClass: state.elements.battleClass.value,
    block: state.elements.block.value
  }));
}

export function restoreBattleSelection() {
  const selection = parseStoredJson(STORAGE_KEYS.battleSelection, {});

  if (selection.server) state.elements.server.value = selection.server;
  if (_updateWorldOptions) _updateWorldOptions();
  if (selection.world) state.elements.world.value = selection.world;
  if (selection.battleClass) state.elements.battleClass.value = selection.battleClass;
  if (selection.block) state.elements.block.value = selection.block;
}

// Fetch Battle Data
export function resetFetchedData() {
  state.setCurrentBattleData(null);
  state.setPendingGuilds([]);
  state.setUsesFallbackGuilds(false);
  state.elements.applyButton.disabled = true;
  setPendingState(false);
  if (_renderEmptyGuildGrid) _renderEmptyGuildGrid();
}

export async function fetchBattleDataIfReady() {
  saveBattleSelection();

  if (!canFetchBattleData()) {
    resetFetchedData();
    if (_setStatus) _setStatus("ワールドを選択してください。");
    return;
  }

  try {
    if (_setStatus) _setStatus("最新データを読み込み中...");
    state.elements.applyButton.disabled = true;

    const selectedWorld = getSelectedWorld();
    if (!selectedWorld) throw new Error("ワールドが見つかりません");

    state.elements.world.value = selectedWorld.id;
    const worldNumeric = selectedWorld.numeric;
    const groupId = getSelectedGroupId(worldNumeric);
    const url = `${API_BASE_URL}/wg/${groupId}/globalgvg/${state.elements.battleClass.value}/${state.elements.block.value}/latest`;

    state.setCurrentBattleData(await fetchJson(url));
    state.setPendingGuilds(Object.values(state.currentBattleData.guilds || {}));
    state.setUsesFallbackGuilds(false);

    if (_renderGuildGrid) _renderGuildGrid(state.pendingGuilds);
    setPendingState(true);
    state.elements.applyButton.disabled = false;
    if (_setStatus) _setStatus("最新データを取得しました。", "success");
  } catch (error) {
    state.setCurrentBattleData(null);
    state.setPendingGuilds(FALLBACK_GUILDS);
    state.setUsesFallbackGuilds(true);
    state.elements.applyButton.disabled = false;
    setPendingState(true);
    if (_renderGuildGrid) _renderGuildGrid(FALLBACK_GUILDS);
    if (_setStatus) _setStatus(`エラー: ${error.message} / 仮名ギルドで手動反映できます`, "error");
    return;
  }
}

export function areGuildsDifferent(nextGuilds) {
  const currentNames = getGuildEntries().map(guild => guild.name);
  const nextNames = nextGuilds.filter(name => name !== "");

  if (currentNames.length !== nextNames.length) return true;
  return nextNames.some((name, index) => currentNames[index] !== name);
}

export function setPendingState(isPending) {
  state.setHasUnappliedBattleData(isPending);
  state.elements.pendingMessage.hidden = !isPending;
  state.elements.applyButton.classList.toggle("has-pending", isPending);
}
