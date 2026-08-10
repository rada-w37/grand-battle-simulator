import test from "node:test";
import assert from "node:assert/strict";

import {
  areGuildNameListsDifferent,
  areBattleDataContextsDifferent,
  areOccupationStatesEqual,
  createBattleDataContext,
  decideBattleDataApplication,
  prepareBattleDataFetchFailureState,
  prepareBattleDataApplicationState,
  prepareFetchedBattleDataState,
  resolveBattleDataGuildNames,
  resolveFallbackGuildNames,
  shouldResetBattleDataApplication
} from "../../js/application/battle-data-boundary.js?v=test";

const battlePoints = [
  { id: "point-1", castleId: 101 },
  { id: "point-2", castleId: 102 }
];

const battleData = {
  guilds: {
    "1": "Guild A",
    "2": "Guild B"
  },
  castles: [
    {
      CastleId: 101,
      GvgCastleState: 1,
      GuildId: "1",
      AttackerGuildId: "2"
    },
    {
      CastleId: 102,
      GvgCastleState: 2,
      GuildId: "1",
      AttackerGuildId: "2"
    }
  ]
};

test("resolves fallback guild names from pending guilds first", () => {
  assert.deepEqual(resolveFallbackGuildNames({
    pendingGuilds: ["Pending A"],
    editableGuildNames: ["Editable A"]
  }), ["Pending A"]);
});

test("resolves fallback guild names from editable names when pending is empty", () => {
  assert.deepEqual(resolveFallbackGuildNames({
    pendingGuilds: [],
    editableGuildNames: ["Editable A"]
  }), ["Editable A"]);
});

test("resolves battle data guild names from pending guilds first", () => {
  assert.deepEqual(resolveBattleDataGuildNames({
    battleData,
    pendingGuilds: ["Pending A"]
  }), ["Pending A"]);
});

test("resolves battle data guild names from API guild values when pending is empty", () => {
  assert.deepEqual(resolveBattleDataGuildNames({
    battleData,
    pendingGuilds: []
  }), ["Guild A", "Guild B"]);
});

test("prepares guild names and occupation states for UI application", () => {
  const result = prepareBattleDataApplicationState({
    battleData,
    pendingGuilds: [],
    battlePoints
  });

  assert.deepEqual(result.guilds, ["Guild A", "Guild B"]);
  assert.deepEqual(result.occupationStates, [
    { defender: "Guild A", attacker: "Guild B" },
    { defender: "Guild B", attacker: "Guild B" }
  ]);
});

test("prepares fetched battle data state for existing api facade", () => {
  assert.deepEqual(prepareFetchedBattleDataState(battleData), {
    battleData,
    pendingGuilds: ["Guild A", "Guild B"],
    usesFallbackGuilds: false
  });
});

test("prepares fallback state for failed battle data fetches", () => {
  assert.deepEqual(prepareBattleDataFetchFailureState(["Fallback A", "Fallback B"]), {
    battleData: null,
    pendingGuilds: ["Fallback A", "Fallback B"],
    usesFallbackGuilds: true,
    occupationStates: null
  });
});

test("compares effective battle data contexts without treating world labels as identity", () => {
  const first = createBattleDataContext({
    server: "1",
    world: "W1",
    groupId: "group-a",
    battleClass: "3",
    block: "0"
  });
  const sameGroup = { ...first, world: "W2" };
  const differentGroup = { ...first, groupId: "group-b" };

  assert.equal(areBattleDataContextsDifferent(first, sameGroup), false);
  assert.equal(areBattleDataContextsDifferent(first, differentGroup), true);
});

test("compares occupation states by defender and attacker values", () => {
  const states = [{ defender: "Guild A", attacker: "Guild B" }];

  assert.equal(areOccupationStatesEqual(states, [{ defender: "Guild A", attacker: "Guild B" }]), true);
  assert.equal(areOccupationStatesEqual(states, [{ defender: "Guild B", attacker: "Guild A" }]), false);
});

test("decides replacement before dirty-tab confirmation", () => {
  const result = decideBattleDataApplication({
    currentContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    pendingContext: { server: "1", groupId: "group-b", battleClass: "3", block: "0" },
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild B"],
    currentStates: [{ defender: "Guild A", attacker: "" }],
    baselineStates: [],
    pendingStates: [{ defender: "Guild B", attacker: "" }],
    tabCount: 2
  });

  assert.deepEqual(result, { mode: "replace", reason: "context" });
});

test("asks for confirmation only when the active tab is dirty", () => {
  const result = decideBattleDataApplication({
    currentContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    pendingContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild A"],
    currentStates: [{ defender: "Guild B", attacker: "" }],
    baselineStates: [{ defender: "Guild A", attacker: "" }],
    pendingStates: [{ defender: "Guild A", attacker: "" }]
  });

  assert.deepEqual(result, { mode: "confirm", reason: "dirty" });
});

test("applies immediately when current state already equals pending state", () => {
  const states = [{ defender: "Guild A", attacker: "" }];
  const result = decideBattleDataApplication({
    currentContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    pendingContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild A"],
    currentStates: states,
    baselineStates: states,
    pendingStates: states
  });

  assert.deepEqual(result, { mode: "immediate", reason: "already-applied" });
});

test("keeps dirty confirmation even when pending data matches the edited map", () => {
  const states = [{ defender: "Guild A", attacker: "" }];
  const result = decideBattleDataApplication({
    currentContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    pendingContext: { server: "1", groupId: "group-a", battleClass: "3", block: "0" },
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild A"],
    currentStates: states,
    baselineStates: [{ defender: "Guild B", attacker: "" }],
    pendingStates: states
  });

  assert.deepEqual(result, { mode: "confirm", reason: "dirty" });
});

test("detects guild list changes with current non-empty next guild behavior", () => {
  assert.equal(areGuildNameListsDifferent(["Guild A", "Guild B"], ["Guild A", "Guild B"]), false);
  assert.equal(areGuildNameListsDifferent(["Guild A", "Guild B"], ["Guild A", "", "Guild B"]), false);
  assert.equal(areGuildNameListsDifferent(["Guild A", "Guild B"], ["Guild B", "Guild A"]), true);
  assert.equal(areGuildNameListsDifferent(["Guild A"], ["Guild A", "Guild B"]), true);
});

test("requests battle data reset only when existing guilds differ from next guilds", () => {
  assert.equal(shouldResetBattleDataApplication({
    currentGuilds: [],
    nextGuilds: ["Guild A"]
  }), false);

  assert.equal(shouldResetBattleDataApplication({
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild A"]
  }), false);

  assert.equal(shouldResetBattleDataApplication({
    currentGuilds: ["Guild A"],
    nextGuilds: ["Guild B"]
  }), true);
});
