import test from "node:test";
import assert from "node:assert/strict";

import {
  addPointScore,
  calculateCumulativeScores,
  calculateScoresFromStates,
  createEmptyScores
} from "../../js/domain/scoring.js?v=test";

const battlePoints = [
  { id: "temple-point", type: "temple" },
  { id: "castle-point", type: "castle" },
  { id: "church-point", type: "church" }
];

test("adds score by point type", () => {
  const scores = createEmptyScores(["Guild A"]);

  addPointScore(scores, "Guild A", "temple");
  addPointScore(scores, "Guild A", "castle");
  addPointScore(scores, "Guild A", "church");

  assert.deepEqual(scores["Guild A"], {
    total: 7,
    temple: 1,
    castle: 1,
    church: 1
  });
});

test("does not add score for empty or unknown guilds", () => {
  const scores = createEmptyScores(["Guild A"]);

  addPointScore(scores, "", "temple");
  addPointScore(scores, "Guild B", "temple");

  assert.deepEqual(scores["Guild A"], {
    total: 0,
    temple: 0,
    castle: 0,
    church: 0
  });
});

test("keeps current unknown point type behavior", () => {
  const scores = createEmptyScores(["Guild A"]);

  addPointScore(scores, "Guild A", "unknown");

  assert.equal(scores["Guild A"].total, 0);
  assert.ok(Number.isNaN(scores["Guild A"].unknown));
});

test("calculates active score from occupation states", () => {
  const scores = calculateScoresFromStates([
    { defender: "Guild A", attacker: "" },
    { defender: "Guild B", attacker: "" },
    { defender: "", attacker: "" }
  ], ["Guild A", "Guild B"], battlePoints);

  assert.deepEqual(scores["Guild A"], {
    total: 4,
    temple: 1,
    castle: 0,
    church: 0
  });
  assert.deepEqual(scores["Guild B"], {
    total: 2,
    temple: 0,
    castle: 1,
    church: 0
  });
});

test("calculates cumulative score through the active tab", () => {
  const scores = calculateCumulativeScores({
    occupationTabs: [
      {
        id: "tab-1",
        selectStates: [
          { defender: "Guild A", attacker: "" },
          { defender: "", attacker: "" },
          { defender: "Guild B", attacker: "" }
        ]
      },
      {
        id: "tab-2",
        selectStates: [
          { defender: "Guild B", attacker: "" },
          { defender: "Guild A", attacker: "" },
          { defender: "", attacker: "" }
        ]
      }
    ],
    activeTabId: "tab-2",
    currentSelectStates: [
      { defender: "Guild B", attacker: "" },
      { defender: "Guild A", attacker: "" },
      { defender: "", attacker: "" }
    ],
    guildNames: ["Guild A", "Guild B"],
    battlePoints
  });

  assert.equal(scores["Guild A"].total, 6);
  assert.equal(scores["Guild B"].total, 5);
  assert.equal(scores["Guild A"].temple, 0);
  assert.equal(scores["Guild B"].church, 0);
});

test("does not mutate input occupation states", () => {
  const selectStates = [
    { defender: "Guild A", attacker: "Guild B" },
    { defender: "Guild B", attacker: "Guild A" }
  ];
  const before = structuredClone(selectStates);

  calculateScoresFromStates(selectStates, ["Guild A", "Guild B"], battlePoints);

  assert.deepEqual(selectStates, before);
});
