import test from "node:test";
import assert from "node:assert/strict";

import {
  areGuildNameListsDifferent,
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
    usesFallbackGuilds: true
  });
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
