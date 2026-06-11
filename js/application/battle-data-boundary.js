import { createOccupationStatesFromBattleSnapshot } from "../domain/battle-snapshot.js?v=20260524-visibility-toggles";

export function resolveFallbackGuildNames({
  pendingGuilds = [],
  editableGuildNames = []
} = {}) {
  return pendingGuilds.length ? pendingGuilds : editableGuildNames;
}

export function resolveBattleDataGuildNames({
  battleData = null,
  pendingGuilds = []
} = {}) {
  return pendingGuilds.length ? pendingGuilds : Object.values(battleData?.guilds || {});
}

export function prepareFetchedBattleDataState(battleData) {
  return {
    battleData,
    pendingGuilds: Object.values(battleData?.guilds || {}),
    usesFallbackGuilds: false
  };
}

export function prepareBattleDataFetchFailureState(fallbackGuilds = []) {
  return {
    battleData: null,
    pendingGuilds: fallbackGuilds,
    usesFallbackGuilds: true
  };
}

export function prepareBattleDataApplicationState({
  battleData = null,
  pendingGuilds = [],
  battlePoints = []
} = {}) {
  return {
    guilds: resolveBattleDataGuildNames({ battleData, pendingGuilds }),
    occupationStates: createOccupationStatesFromBattleSnapshot(battleData, battlePoints)
  };
}

export function areGuildNameListsDifferent(currentNames = [], nextNames = []) {
  const nextNonEmptyNames = nextNames.filter(name => name !== "");

  if (currentNames.length !== nextNonEmptyNames.length) return true;
  return nextNonEmptyNames.some((name, index) => currentNames[index] !== name);
}

export function shouldResetBattleDataApplication({
  currentGuilds = [],
  nextGuilds = []
} = {}) {
  return currentGuilds.length > 0 && areGuildNameListsDifferent(currentGuilds, nextGuilds);
}
