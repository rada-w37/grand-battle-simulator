import { normalizePointState } from "./occupation-state.js?v=20260524-visibility-toggles";

const DEFAULT_EMPTY_POINT_COLOR = "rgba(255, 255, 255, 0.86)";

export function getGuildEntries(guildNames, colors = []) {
  return guildNames
    .map((name, index) => ({
      name,
      color: colors[index]
    }))
    .filter(guild => guild.name !== "");
}

export function getGuildIndex(guildEntries, guildName) {
  return guildEntries.findIndex(guild => guild.name === guildName) + 1;
}

export function getColorForGuildName(guildEntries, guildName, emptyColor = DEFAULT_EMPTY_POINT_COLOR) {
  const match = guildEntries.find(guild => guild.name === guildName);
  return match?.color || emptyColor;
}

export function getAuraColorForGuildName(guildEntries, guildName, auraColors = []) {
  const index = getGuildIndex(guildEntries, guildName);
  return index ? auraColors[index - 1] : "transparent";
}

export function createGuildRenameMap(previousNames, nextNames) {
  return new Map(previousNames
    .map((name, index) => [name, nextNames[index]])
    .filter(([from, to]) => from && to && from !== to));
}

export function renamePointStateGuildReferences(pointState, renameMap) {
  const normalized = normalizePointState(pointState);
  return {
    defender: renameMap.get(normalized.defender) || normalized.defender,
    attacker: renameMap.get(normalized.attacker) || normalized.attacker
  };
}

export function renameOccupationTabsGuildReferences(occupationTabs, renameMap) {
  return occupationTabs.map(tab => ({
    ...tab,
    selectStates: tab.selectStates.map(pointState => renamePointStateGuildReferences(pointState, renameMap))
  }));
}

export function renameGuildReferences({ occupationTabs, pendingSelectStates, highlightedGuildName, previousNames, nextNames }) {
  const renameMap = createGuildRenameMap(previousNames, nextNames);
  if (renameMap.size === 0) {
    return {
      changed: false,
      occupationTabs,
      pendingSelectStates,
      highlightedGuildName
    };
  }

  return {
    changed: true,
    occupationTabs: renameOccupationTabsGuildReferences(occupationTabs, renameMap),
    pendingSelectStates: pendingSelectStates.map(pointState => renamePointStateGuildReferences(pointState, renameMap)),
    highlightedGuildName: renameMap.get(highlightedGuildName) || highlightedGuildName
  };
}
