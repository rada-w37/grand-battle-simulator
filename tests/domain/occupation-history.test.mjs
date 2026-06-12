import test from "node:test";
import assert from "node:assert/strict";

import {
  applyOccupationHistoryEntryToStates,
  createOccupationHistoryEntry
} from "../../js/domain/occupation-history.js?v=test";

const battlePoints = [
  { id: "point-a" },
  { id: "point-b" },
  { id: "point-c" }
];

test("creates history entry only for changed occupation states", () => {
  const entry = createOccupationHistoryEntry([
    { defender: "Guild A", attacker: "" },
    { defender: "Guild B", attacker: "Guild C" },
    { defender: "", attacker: "" }
  ], [
    { defender: "Guild A", attacker: "" },
    { defender: "Guild D", attacker: "Guild C" },
    { defender: "", attacker: "Guild A" }
  ], battlePoints);

  assert.deepEqual(entry, {
    changes: [
      {
        pointId: "point-b",
        before: { defender: "Guild B", attacker: "Guild C" },
        after: { defender: "Guild D", attacker: "Guild C" }
      },
      {
        pointId: "point-c",
        before: { defender: "", attacker: "" },
        after: { defender: "", attacker: "Guild A" }
      }
    ]
  });
});

test("returns null when no occupation states changed", () => {
  const entry = createOccupationHistoryEntry([
    { defender: "Guild A", attacker: "Guild B" }
  ], [
    { defender: "Guild A", attacker: "Guild B" }
  ], battlePoints);

  assert.equal(entry, null);
});

test("normalizes legacy state values while creating entries", () => {
  const entry = createOccupationHistoryEntry([
    "Guild A"
  ], [
    { guildName: "Guild B", attackerGuildName: "Guild C" }
  ], battlePoints);

  assert.deepEqual(entry, {
    changes: [
      {
        pointId: "point-a",
        before: { defender: "Guild A", attacker: "" },
        after: { defender: "Guild B", attacker: "Guild C" }
      }
    ]
  });
});

test("applies undo and redo history entries without mutating inputs", () => {
  const currentStates = [
    { defender: "Guild D", attacker: "Guild C" },
    { defender: "Guild E", attacker: "" }
  ];
  const entry = {
    changes: [
      {
        pointId: "point-a",
        before: { defender: "Guild A", attacker: "" },
        after: { defender: "Guild D", attacker: "Guild C" }
      }
    ]
  };

  const undoStates = applyOccupationHistoryEntryToStates(currentStates, entry, "undo", battlePoints);
  const redoStates = applyOccupationHistoryEntryToStates(undoStates, entry, "redo", battlePoints);

  assert.deepEqual(undoStates[0], { defender: "Guild A", attacker: "" });
  assert.deepEqual(redoStates[0], { defender: "Guild D", attacker: "Guild C" });
  assert.deepEqual(currentStates[0], { defender: "Guild D", attacker: "Guild C" });
  assert.notEqual(undoStates, currentStates);
});

test("ignores changes for unknown point ids", () => {
  const currentStates = [{ defender: "Guild A", attacker: "" }];
  const nextStates = applyOccupationHistoryEntryToStates(currentStates, {
    changes: [
      {
        pointId: "unknown",
        before: { defender: "Guild B", attacker: "" },
        after: { defender: "Guild C", attacker: "" }
      }
    ]
  }, "undo", battlePoints);

  assert.deepEqual(nextStates, currentStates);
  assert.notEqual(nextStates, currentStates);
});
