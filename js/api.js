import * as state from "./state.js?v=20260810-empty-side";
import { normalizeWorldName, getGuildEntries } from "./utils.js?v=20260810-empty-side";
import { readJsonStorage, STORAGE_KEYS, writeJsonStorage } from "./infrastructure/storage.js?v=20260524-visibility-toggles";
import {
  fetchLatestBattleData,
  fetchWorldGroups
} from "./infrastructure/mentemori-api.js?v=20260524-visibility-toggles";
import {
  areGuildNameListsDifferent,
  createBattleDataContext,
  prepareBattleDataFetchFailureState,
  prepareBattleDataApplicationState,
  prepareFetchedBattleDataState
} from "./application/battle-data-boundary.js?v=20260810-empty-side";
import { BATTLE_POINTS } from "./layout/layout-config.js?v=20260524-visibility-toggles";
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
export {
  fetchJson
} from "./infrastructure/mentemori-api.js?v=20260524-visibility-toggles";

const FALLBACK_GUILDS = ["ギルド1", "ギルド2", "ギルド3", "ギルド4"];

let battleFetchRequestId = 0;

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

// Load World Groups
export async function loadGroups() {
  if (_setStatus) _setStatus("ワールド情報を読み込み中...");
  state.setWorldGroupData(await fetchWorldGroups());
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
  return getDomainWorldRangeLabel(rangeStart, worlds);
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
  writeJsonStorage(STORAGE_KEYS.battleSelection, {
    server: state.elements.server.value,
    world: normalizeWorldName(state.elements.world.value),
    battleClass: state.elements.battleClass.value,
    block: state.elements.block.value
  });
}

export function restoreBattleSelection() {
  const selection = readJsonStorage(STORAGE_KEYS.battleSelection, {});

  if (selection.server) state.elements.server.value = selection.server;
  if (_updateWorldOptions) _updateWorldOptions();
  if (selection.world) state.elements.world.value = selection.world;
  if (selection.battleClass) state.elements.battleClass.value = selection.battleClass;
  if (selection.block) state.elements.block.value = selection.block;
}

// Fetch Battle Data
export function resetFetchedData() {
  battleFetchRequestId += 1;
  state.setCurrentBattleData(null);
  state.setPendingGuilds([]);
  state.setPendingBattleApplication(null);
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

  const requestId = ++battleFetchRequestId;
  state.setPendingBattleApplication(null);
  setPendingState(false);

  let selectedContext = null;
  try {
    if (_setStatus) _setStatus("最新データを読み込み中...");
    state.elements.applyButton.disabled = true;

    const selectedWorld = getSelectedWorld();
    if (!selectedWorld) throw new Error("ワールドが見つかりません");

    state.elements.world.value = selectedWorld.id;
    const worldNumeric = selectedWorld.numeric;
    const groupId = getSelectedGroupId(worldNumeric);
    selectedContext = createBattleDataContext({
      server: state.elements.server.value,
      world: selectedWorld.id,
      groupId,
      battleClass: state.elements.battleClass.value,
      block: state.elements.block.value
    });

    const nextBattleState = prepareFetchedBattleDataState(await fetchLatestBattleData({
      groupId,
      battleClass: state.elements.battleClass.value,
      block: state.elements.block.value
    }));
    if (requestId !== battleFetchRequestId) return;

    const preparedApplication = prepareBattleDataApplicationState({
      battleData: nextBattleState.battleData,
      pendingGuilds: nextBattleState.pendingGuilds,
      battlePoints: BATTLE_POINTS
    });
    state.setCurrentBattleData(nextBattleState.battleData);
    state.setPendingGuilds(nextBattleState.pendingGuilds);
    state.setPendingBattleApplication({
      requestId,
      context: selectedContext,
      guilds: preparedApplication.guilds,
      occupationStates: preparedApplication.occupationStates,
      sourceType: "api"
    });
    state.setUsesFallbackGuilds(nextBattleState.usesFallbackGuilds);

    if (_renderGuildGrid) _renderGuildGrid(state.pendingGuilds);
    setPendingState(true);
    state.elements.applyButton.disabled = false;
    if (_setStatus) _setStatus("最新データを取得しました。", "success");
  } catch (error) {
    if (requestId !== battleFetchRequestId) return;

    const fallbackBattleState = prepareBattleDataFetchFailureState(FALLBACK_GUILDS);
    state.setCurrentBattleData(fallbackBattleState.battleData);
    state.setPendingGuilds(fallbackBattleState.pendingGuilds);
    state.setPendingBattleApplication({
      requestId,
      context: selectedContext,
      guilds: fallbackBattleState.pendingGuilds,
      occupationStates: fallbackBattleState.occupationStates,
      sourceType: "fallback"
    });
    state.setUsesFallbackGuilds(fallbackBattleState.usesFallbackGuilds);
    state.elements.applyButton.disabled = false;
    setPendingState(true);
    if (_renderGuildGrid) _renderGuildGrid(FALLBACK_GUILDS);
    if (_setStatus) _setStatus(`エラー: ${error.message} / 仮名ギルドで手動反映できます`, "error");
    return;
  }
}

export function areGuildsDifferent(nextGuilds) {
  const currentNames = getGuildEntries().map(guild => guild.name);
  return areGuildNameListsDifferent(currentNames, nextGuilds);
}

export function setPendingState(isPending) {
  state.setHasUnappliedBattleData(isPending);
  state.elements.pendingMessage.hidden = !isPending;
  state.elements.applyButton.classList.toggle("has-pending", isPending);
}
