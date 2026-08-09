import test from "node:test";
import assert from "node:assert/strict";

import { BATTLE_POINTS } from "../../js/layout/base.js";
import {
  ADJACENT_POINT_IDS,
  CASTLE_POINT_IDS,
  getDeclarationCandidateGuildNames
} from "../../js/domain/declaration-candidates.js?v=test";

function createSelectStates(battlePoints, defendersByPointId) {
  return battlePoints.map(point => ({
    defender: defendersByPointId[point.id] || "",
    attacker: ""
  }));
}

test("defines a symmetric adjacency entry for every battle point", () => {
  const battlePointIds = BATTLE_POINTS.map(point => point.id).sort();

  assert.deepEqual(Object.keys(ADJACENT_POINT_IDS).sort(), battlePointIds);
  Object.entries(ADJACENT_POINT_IDS).forEach(([pointId, adjacentPointIds]) => {
    adjacentPointIds.forEach(adjacentPointId => {
      assert.equal(ADJACENT_POINT_IDS[adjacentPointId]?.includes(pointId), true);
    });
  });
  assert.deepEqual(CASTLE_POINT_IDS, ["tiferet", "yesod", "keter", "malkuth"]);
});

test("returns the target and adjacent defenders in existing guild order", () => {
  const selectStates = createSelectStates(BATTLE_POINTS, {
    ein: "Guild A",
    tiferet: "Guild B",
    yesod: "Guild A",
    keter: "",
    malkuth: "Guild C",
    ganette: "Guild D"
  });

  assert.deepEqual(getDeclarationCandidateGuildNames({
    targetPointId: "ein",
    battlePoints: BATTLE_POINTS,
    selectStates,
    guildNames: ["Guild D", "Guild C", "Guild B", "Guild A", "Guild B", ""]
  }), ["Guild C", "Guild B", "Guild A"]);
});

test("requires castle candidates to occupy at least two churches", () => {
  const selectStates = createSelectStates(BATTLE_POINTS, {
    tiferet: "Guild A",
    ganette: "Guild B",
    cushel: "Guild C",
    floryte: "Guild D",
    ein: "Guild E",
    pharia: "Guild A",
    citri: "Guild A",
    rula: "Guild B",
    toppaz: "Guild D",
    perido: "Guild F",
    meral: "Guild F"
  });

  assert.deepEqual(getDeclarationCandidateGuildNames({
    targetPointId: "tiferet",
    battlePoints: BATTLE_POINTS,
    selectStates,
    guildNames: ["Guild F", "Guild D", "Guild C", "Guild B", "Guild A", "Guild E"]
  }), ["Guild D", "Guild B", "Guild A"]);
});

test("returns no candidates for an unknown point without mutating inputs", () => {
  const selectStates = createSelectStates(BATTLE_POINTS, { ganette: "Guild A" });
  const before = structuredClone(selectStates);

  assert.deepEqual(getDeclarationCandidateGuildNames({
    targetPointId: "unknown",
    battlePoints: BATTLE_POINTS,
    selectStates,
    guildNames: ["Guild A"]
  }), []);
  assert.deepEqual(selectStates, before);
});
