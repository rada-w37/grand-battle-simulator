import { normalizePointState } from "./occupation-state.js?v=20260524-visibility-toggles";

export function createOccupationHistoryEntry(beforeStates, afterStates, battlePoints = beforeStates) {
  const changes = battlePoints.map((point, index) => {
    const before = normalizePointState(beforeStates[index]);
    const after = normalizePointState(afterStates[index]);

    if (before.attacker === after.attacker && before.defender === after.defender) return null;
    return { pointId: point.id, before, after };
  }).filter(Boolean);

  return changes.length ? { changes } : null;
}

export function applyOccupationHistoryEntryToStates(currentStates, entry, direction, battlePoints = currentStates) {
  const stateKey = direction === "undo" ? "before" : "after";
  const nextStates = currentStates.map(pointState => ({ ...normalizePointState(pointState) }));

  entry?.changes?.forEach(change => {
    const pointIndex = battlePoints.findIndex(point => point.id === change.pointId);
    if (pointIndex < 0) return;
    nextStates[pointIndex] = { ...normalizePointState(change[stateKey]) };
  });

  return nextStates;
}
