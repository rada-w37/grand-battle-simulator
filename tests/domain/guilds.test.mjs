import test from "node:test";
import assert from "node:assert/strict";

import {
  createGuildRenameMap,
  getAuraColorForGuildName,
  getColorForGuildName,
  getGuildEntries,
  getGuildIndex,
  renameGuildReferences,
  renamePointStateGuildReferences
} from "../../js/domain/guilds.js?v=test";

test("creates guild entries from non-empty guild names", () => {
  assert.deepEqual(getGuildEntries(["Guild A", "", "Guild C"], ["red", "blue", "green"]), [
    { name: "Guild A", color: "red" },
    { name: "Guild C", color: "green" }
  ]);
});

test("resolves guild index and colors from entries", () => {
  const entries = getGuildEntries(["Guild A", "Guild B"], ["red", "blue"]);

  assert.equal(getGuildIndex(entries, "Guild B"), 2);
  assert.equal(getGuildIndex(entries, "Missing"), 0);
  assert.equal(getColorForGuildName(entries, "Guild A", "empty"), "red");
  assert.equal(getColorForGuildName(entries, "Missing", "empty"), "empty");
  assert.equal(getAuraColorForGuildName(entries, "Guild B", ["aura-a", "aura-b"]), "aura-b");
  assert.equal(getAuraColorForGuildName(entries, "Missing", ["aura-a", "aura-b"]), "transparent");
});

test("creates rename map only for actual non-empty changes", () => {
  assert.deepEqual(Array.from(createGuildRenameMap(
    ["Guild A", "Guild B", "", "Guild D"],
    ["Guild A2", "Guild B", "Guild C", ""]
  ).entries()), [
    ["Guild A", "Guild A2"]
  ]);
});

test("renames defender and attacker references in point states", () => {
  const renameMap = createGuildRenameMap(["Guild A", "Guild B"], ["Guild A2", "Guild B2"]);

  assert.deepEqual(renamePointStateGuildReferences({
    defender: "Guild A",
    attacker: "Guild B"
  }, renameMap), {
    defender: "Guild A2",
    attacker: "Guild B2"
  });
});

test("renames tabs, pending states, and highlighted guild without mutating inputs", () => {
  const input = {
    occupationTabs: [
      {
        id: "tab-1",
        name: "Day 1",
        selectStates: [
          { defender: "Guild A", attacker: "Guild B" },
          { defender: "Guild C", attacker: "" }
        ]
      }
    ],
    pendingSelectStates: [
      { defender: "Guild B", attacker: "Guild A" }
    ],
    highlightedGuildName: "Guild A",
    previousNames: ["Guild A", "Guild B"],
    nextNames: ["Guild A2", "Guild B2"]
  };
  const before = structuredClone(input);
  const result = renameGuildReferences(input);

  assert.equal(result.changed, true);
  assert.deepEqual(result.occupationTabs[0].selectStates, [
    { defender: "Guild A2", attacker: "Guild B2" },
    { defender: "Guild C", attacker: "" }
  ]);
  assert.deepEqual(result.pendingSelectStates, [
    { defender: "Guild B2", attacker: "Guild A2" }
  ]);
  assert.equal(result.highlightedGuildName, "Guild A2");
  assert.deepEqual(input, before);
});

test("returns original references when no guild names changed", () => {
  const occupationTabs = [{ id: "tab-1", selectStates: [] }];
  const pendingSelectStates = [];
  const result = renameGuildReferences({
    occupationTabs,
    pendingSelectStates,
    highlightedGuildName: "Guild A",
    previousNames: ["Guild A"],
    nextNames: ["Guild A"]
  });

  assert.equal(result.changed, false);
  assert.equal(result.occupationTabs, occupationTabs);
  assert.equal(result.pendingSelectStates, pendingSelectStates);
  assert.equal(result.highlightedGuildName, "Guild A");
});
