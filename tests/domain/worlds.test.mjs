import test from "node:test";
import assert from "node:assert/strict";

import {
  getGroupedWorldOptions,
  getWorldOptionsForServer,
  getWorldRangeKey,
  normalizeWorldName
} from "../../js/domain/worlds.js?v=test";

const worldGroupData = [
  { group_id: 101, worlds: [1001, 1002, 1010, 2011] },
  { group_id: 102, worlds: [1002, 1012, 1021] }
];

test("normalizes numeric world names", () => {
  assert.equal(normalizeWorldName("1"), "W1");
  assert.equal(normalizeWorldName("W001"), "W1");
  assert.equal(normalizeWorldName(" ｗ１２ "), "W12");
});

test("keeps non-numeric world names uppercase", () => {
  assert.equal(normalizeWorldName("alpha"), "ALPHA");
  assert.equal(normalizeWorldName(""), "");
  assert.equal(normalizeWorldName("  "), "");
});

test("creates unique sorted world options for a server", () => {
  const options = getWorldOptionsForServer(worldGroupData, "1");

  assert.deepEqual(options, [
    { id: "W1", numeric: 1001, groupId: 101 },
    { id: "W2", numeric: 1002, groupId: 102 },
    { id: "W10", numeric: 1010, groupId: 101 },
    { id: "W12", numeric: 1012, groupId: 102 },
    { id: "W21", numeric: 1021, groupId: 102 }
  ]);
});

test("groups world options by current range labels", () => {
  const grouped = getGroupedWorldOptions([
    { id: "W1", numeric: 1001, groupId: 101 },
    { id: "W9", numeric: 1009, groupId: 101 },
    { id: "W10", numeric: 1010, groupId: 101 },
    { id: "W12", numeric: 1012, groupId: 102 },
    { id: "W21", numeric: 1021, groupId: 102 }
  ]);

  assert.equal(getWorldRangeKey({ id: "W9" }), "1");
  assert.deepEqual(grouped, [
    {
      key: "1",
      worlds: [
        { id: "W1", numeric: 1001, groupId: 101 },
        { id: "W9", numeric: 1009, groupId: 101 }
      ],
      label: "W1 ・・W9"
    },
    {
      key: "10",
      worlds: [
        { id: "W10", numeric: 1010, groupId: 101 },
        { id: "W12", numeric: 1012, groupId: 102 }
      ],
      label: "W10 ・・W12"
    },
    {
      key: "20",
      worlds: [
        { id: "W21", numeric: 1021, groupId: 102 }
      ],
      label: "W21 ・・W21"
    }
  ]);
});

test("does not mutate world group input", () => {
  const before = structuredClone(worldGroupData);

  getWorldOptionsForServer(worldGroupData, "1");

  assert.deepEqual(worldGroupData, before);
});
