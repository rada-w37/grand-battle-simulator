import test from "node:test";
import assert from "node:assert/strict";

import {
  cloneOccupationStates,
  createEmptyOccupationStates,
  normalizePointState
} from "../../js/domain/occupation-state.js?v=test";

const battlePoints = [
  { id: "point-1" },
  { id: "point-2" },
  { id: "point-3" }
];

test("normalizes legacy string state as defender", () => {
  assert.deepEqual(normalizePointState("Guild A"), {
    defender: "Guild A",
    attacker: ""
  });
});

test("normalizes legacy guildName fields", () => {
  assert.deepEqual(normalizePointState({
    guildName: "Legacy Defender",
    attackerGuildName: "Legacy Attacker"
  }), {
    defender: "Legacy Defender",
    attacker: "Legacy Attacker"
  });
});

test("normalizes empty values", () => {
  assert.deepEqual(normalizePointState(null), { defender: "", attacker: "" });
  assert.deepEqual(normalizePointState(undefined), { defender: "", attacker: "" });
  assert.deepEqual(normalizePointState(0), { defender: "", attacker: "" });
  assert.deepEqual(normalizePointState({}), { defender: "", attacker: "" });
});

test("clones defender and attacker states without mutating source objects", () => {
  const sourceState = { defender: "Guild A", attacker: "Guild B" };
  const states = [sourceState];
  const cloned = cloneOccupationStates(states, battlePoints);

  assert.deepEqual(cloned[0], sourceState);
  assert.notEqual(cloned[0], sourceState);

  cloned[0].defender = "Changed";
  assert.equal(sourceState.defender, "Guild A");
});

test("fills missing clone entries with empty occupation states", () => {
  const cloned = cloneOccupationStates([{ defender: "Guild A", attacker: "Guild B" }], battlePoints);

  assert.equal(cloned.length, battlePoints.length);
  assert.deepEqual(cloned[1], { defender: "", attacker: "" });
});

test("creates empty occupation states for every battle point", () => {
  const states = createEmptyOccupationStates(battlePoints);

  assert.equal(states.length, battlePoints.length);
  assert.ok(states.every(state => state.defender === "" && state.attacker === ""));
});
