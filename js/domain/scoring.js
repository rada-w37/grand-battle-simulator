import { POINT_SCORES } from "../constants.js?v=20260524-visibility-toggles";
import { BATTLE_POINTS } from "../layout/layout-config.js?v=20260524-visibility-toggles";
import { normalizePointState } from "./occupation-state.js?v=20260524-visibility-toggles";

export function createEmptyScores(guildNames) {
  return Object.fromEntries(guildNames.map(name => [
    name,
    { total: 0, temple: 0, castle: 0, church: 0 }
  ]));
}

export function addPointScore(scores, guildName, type) {
  if (!guildName || !(guildName in scores)) return;

  scores[guildName][type] += 1;
  scores[guildName].total += POINT_SCORES[type] || 0;
}

export function calculateScoresFromStates(selectStates, guildNames, battlePoints = BATTLE_POINTS) {
  const scores = createEmptyScores(guildNames);

  battlePoints.forEach((point, index) => {
    addPointScore(scores, normalizePointState(selectStates[index]).defender, point.type || "church");
  });

  return scores;
}

export function calculateCumulativeScores({
  occupationTabs = [],
  activeTabId = "",
  currentSelectStates = [],
  guildNames = [],
  battlePoints = BATTLE_POINTS
} = {}) {
  const scores = createEmptyScores(guildNames);
  const activeIndex = Math.max(0, occupationTabs.findIndex(tab => tab.id === activeTabId));

  occupationTabs.slice(0, activeIndex + 1).forEach(tab => {
    const selectStates = tab.id === activeTabId ? currentSelectStates : tab.selectStates;
    const tabScores = calculateScoresFromStates(selectStates, guildNames, battlePoints);

    guildNames.forEach(guildName => {
      scores[guildName].total += tabScores[guildName].total;
    });
  });

  return scores;
}
