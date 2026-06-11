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
