import * as state from "./state.js?v=20260810-map-score";
import { normalizeWorldName, getGuildEntries } from "./utils.js?v=20260810-map-score";
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
} from "./application/battle-data-boundary.js?v=20260810-map-score";
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
const BATTLE_BLOCK_VALUES = ["0", "1", "2", "3"];

let battleFetchRequestId = 0;
let pendingBattleApplicationsByBlock = new Map();

// UI Function References (set by main.js)
let _setStatus = null;
let _renderGuildGrid = null;
let _renderBattleBlockGuilds = null;
let _renderEmptyGuildGrid = null;
let _syncBattleSelectionControls = null;
let _updateGuildOptions = null;
let _applySelectStates = null;
let _updateWorldOptions = null;

export function _setUiFunctions(fns) {
  _setStatus = fns.setStatus;
  _renderGuildGrid = fns.renderGuildGrid;
  _renderBattleBlockGuilds = fns.renderBattleBlockGuilds;
  _renderEmptyGuildGrid = fns.renderEmptyGuildGrid;
  _syncBattleSelectionControls = fns.syncBattleSelectionControls;
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
  if (_syncBattleSelectionControls) _syncBattleSelectionControls();
}

// Fetch Battle Data
export function resetFetchedData() {
  battleFetchRequestId += 1;
  pendingBattleApplicationsByBlock = new Map();
  state.setCurrentBattleData(null);
  state.setPendingGuilds([]);
  state.setPendingBattleApplication(null);
  state.setUsesFallbackGuilds(false);
  state.elements.applyButton.disabled = true;
  setPendingState(false);
  if (_renderEmptyGuildGrid) _renderEmptyGuildGrid();
}

function createBlockContext({ block, groupId, selectedWorld }) {
  return createBattleDataContext({
    server: state.elements.server.value,
    world: selectedWorld.id,
    groupId,
    battleClass: state.elements.battleClass.value,
    block
  });
}

async function fetchBlockApplication({ block, groupId, selectedWorld, requestId }) {
  const context = createBlockContext({ block, groupId, selectedWorld });

  try {
    const nextBattleState = prepareFetchedBattleDataState(await fetchLatestBattleData({
      groupId,
      battleClass: state.elements.battleClass.value,
      block
    }));
    const preparedApplication = prepareBattleDataApplicationState({
      battleData: nextBattleState.battleData,
      pendingGuilds: nextBattleState.pendingGuilds,
      battlePoints: BATTLE_POINTS
    });

    return {
      block,
      battleData: nextBattleState.battleData,
      guilds: preparedApplication.guilds,
      usesFallbackGuilds: nextBattleState.usesFallbackGuilds,
      application: {
        requestId,
        context,
        guilds: preparedApplication.guilds,
        occupationStates: preparedApplication.occupationStates,
        sourceType: "api"
      },
      error: null
    };
  } catch (error) {
    const fallbackBattleState = prepareBattleDataFetchFailureState(FALLBACK_GUILDS);
    return {
      block,
      battleData: fallbackBattleState.battleData,
      guilds: fallbackBattleState.pendingGuilds,
      usesFallbackGuilds: fallbackBattleState.usesFallbackGuilds,
      application: {
        requestId,
        context,
        guilds: fallbackBattleState.pendingGuilds,
        occupationStates: fallbackBattleState.occupationStates,
        sourceType: "fallback"
      },
      error
    };
  }
}

function activatePendingBattleBlock(blockValue) {
  const result = pendingBattleApplicationsByBlock.get(blockValue);
  if (!result) return false;

  state.setCurrentBattleData(result.battleData);
  state.setPendingGuilds(result.guilds);
  state.setPendingBattleApplication(result.application);
  state.setUsesFallbackGuilds(result.usesFallbackGuilds);
  state.elements.applyButton.disabled = false;
  setPendingState(true);
  if (_renderGuildGrid) _renderGuildGrid(result.guilds, blockValue);
  if (_syncBattleSelectionControls) _syncBattleSelectionControls();
  return true;
}

export function selectBattleBlock(blockValue) {
  if (!BATTLE_BLOCK_VALUES.includes(String(blockValue))) return;

  state.elements.block.value = String(blockValue);
  saveBattleSelection();
  if (_syncBattleSelectionControls) _syncBattleSelectionControls();
  if (!activatePendingBattleBlock(String(blockValue))) {
    return fetchBattleDataIfReady();
  }
}

export async function fetchBattleDataIfReady() {
  saveBattleSelection();
  if (_syncBattleSelectionControls) _syncBattleSelectionControls();

  if (!canFetchBattleData()) {
    resetFetchedData();
    if (_setStatus) _setStatus("ワールドを選択してください。");
    return;
  }

  const requestId = ++battleFetchRequestId;
  pendingBattleApplicationsByBlock = new Map();
  state.setPendingBattleApplication(null);
  setPendingState(false);

  try {
    if (_setStatus) _setStatus("4ブロックの最新データを読み込み中...");
    state.elements.applyButton.disabled = true;
    if (_renderEmptyGuildGrid) _renderEmptyGuildGrid();

    const selectedWorld = getSelectedWorld();
    if (!selectedWorld) throw new Error("ワールドが見つかりません");

    state.elements.world.value = selectedWorld.id;
    const worldNumeric = selectedWorld.numeric;
    const groupId = getSelectedGroupId(worldNumeric);
    const blockResults = await Promise.all(BATTLE_BLOCK_VALUES.map(block => (
      fetchBlockApplication({ block, groupId, selectedWorld, requestId })
    )));
    if (requestId !== battleFetchRequestId) return;

    pendingBattleApplicationsByBlock = new Map(blockResults.map(result => [result.block, result]));
    if (_renderBattleBlockGuilds) {
      _renderBattleBlockGuilds(Object.fromEntries(blockResults.map(result => [result.block, result.guilds])));
    }
    activatePendingBattleBlock(state.elements.block.value);
    saveBattleSelection();

    const failedCount = blockResults.filter(result => result.error).length;
    if (failedCount > 0) {
      if (_setStatus) _setStatus(`${failedCount}ブロックの取得に失敗しました。仮名ギルドで手動反映できます。`, "error");
    }
  } catch (error) {
    if (requestId !== battleFetchRequestId) return;
    resetFetchedData();
    if (_setStatus) _setStatus(`エラー: ${error.message}`, "error");
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
