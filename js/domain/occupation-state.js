export function normalizePointState(state) {
  if (typeof state === "string") {
    return { defender: state, attacker: "" };
  }

  if (!state || typeof state !== "object") {
    return { defender: "", attacker: "" };
  }

  return {
    defender: state.defender || state.guildName || "",
    attacker: state.attacker || state.attackerGuildName || ""
  };
}

export function cloneOccupationStates(states = createEmptyOccupationStates(), battlePoints = states) {
  return battlePoints.map((_, index) => ({ ...normalizePointState(states[index]) }));
}

export function createEmptyOccupationStates(battlePoints = []) {
  return battlePoints.map(() => ({ defender: "", attacker: "" }));
}
