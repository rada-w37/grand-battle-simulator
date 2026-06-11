import { BATTLE_POINTS } from "../layout/layout-config.js?v=20260524-visibility-toggles";

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

export function cloneOccupationStates(states = createEmptyOccupationStates()) {
  return BATTLE_POINTS.map((_, index) => ({ ...normalizePointState(states[index]) }));
}

export function createEmptyOccupationStates() {
  return BATTLE_POINTS.map(() => ({ defender: "", attacker: "" }));
}
