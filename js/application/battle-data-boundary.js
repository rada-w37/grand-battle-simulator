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
    usesFallbackGuilds: true,
    occupationStates: null
  };
}

export function createBattleDataContext({
  server = "",
  world = "",
  groupId = "",
  battleClass = "",
  block = ""
} = {}) {
  return {
    server: String(server),
    world: String(world),
    groupId: String(groupId),
    battleClass: String(battleClass),
    block: String(block)
  };
}

export function areBattleDataContextsDifferent(currentContext, nextContext) {
  if (!currentContext || !nextContext) return false;

  return ["server", "groupId", "battleClass", "block"].some(key => (
    String(currentContext[key] ?? "") !== String(nextContext[key] ?? "")
  ));
}

export function areOccupationStatesEqual(currentStates = [], nextStates = []) {
  if (!Array.isArray(currentStates) || !Array.isArray(nextStates)) return false;
  if (currentStates.length !== nextStates.length) return false;

  return currentStates.every((state, index) => {
    const nextState = nextStates[index] || {};
    return (state?.defender || "") === (nextState.defender || "") &&
      (state?.attacker || "") === (nextState.attacker || "");
  });
}

export function hasOccupationStateValues(selectStates = []) {
  return Array.isArray(selectStates) && selectStates.some(pointState => (
    Boolean(pointState?.defender || pointState?.attacker)
  ));
}

export function decideBattleDataApplication({
  currentContext = null,
  pendingContext = null,
  currentGuilds = [],
  nextGuilds = [],
  currentStates = [],
  baselineStates = null,
  pendingStates = [],
  tabCount = 1,
  usesFallbackGuilds = false
} = {}) {
  const hasExistingWorkspace = Boolean(currentContext) ||
    currentGuilds.some(Boolean) ||
    hasOccupationStateValues(currentStates) ||
    tabCount > 1;
  const guildsDifferent = areGuildNameListsDifferent(currentGuilds, nextGuilds);
  const contextDifferent = areBattleDataContextsDifferent(currentContext, pendingContext);

  if (hasExistingWorkspace && (contextDifferent || guildsDifferent || usesFallbackGuilds)) {
    return { mode: "replace", reason: contextDifferent ? "context" : "guilds" };
  }

  const isDirty = baselineStates === null
    ? hasOccupationStateValues(currentStates)
    : !areOccupationStatesEqual(currentStates, baselineStates);

  if (isDirty) return { mode: "confirm", reason: "dirty" };
  if (areOccupationStatesEqual(currentStates, pendingStates)) {
    return { mode: "immediate", reason: "already-applied" };
  }

  return { mode: "immediate", reason: "clean" };
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
