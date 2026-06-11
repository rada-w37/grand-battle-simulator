import test from "node:test";
import assert from "node:assert/strict";

import {
  createOption,
  createScoreCell,
  setDevLayoutMetadata
} from "../../js/presentation/dom-helpers.js?v=test";

function installFakeDocument() {
  globalThis.document = {
    createElement: tagName => ({
      tagName,
      value: "",
      textContent: "",
      className: "",
      dataset: {}
    })
  };
}

test("creates option elements with existing value and text behavior", () => {
  installFakeDocument();

  const option = createOption("Guild A", "Guild A");

  assert.equal(option.tagName, "option");
  assert.equal(option.value, "Guild A");
  assert.equal(option.textContent, "Guild A");
});

test("creates score cells with stringified text and optional class", () => {
  installFakeDocument();

  const plainCell = createScoreCell(4);
  const totalCell = createScoreCell(10, "score-total");

  assert.equal(plainCell.tagName, "td");
  assert.equal(plainCell.textContent, "4");
  assert.equal(plainCell.className, "");
  assert.equal(totalCell.textContent, "10");
  assert.equal(totalCell.className, "score-total");
});

test("sets development layout metadata without changing target fallback behavior", () => {
  const element = { dataset: {} };

  setDevLayoutMetadata(element, {
    targetId: "point:point-1",
    layoutKey: "BATTLE_POINTS",
    pointId: "point-1",
    role: "shield"
  });

  assert.deepEqual(element.dataset, {
    devLayoutId: "point:point-1",
    devLayoutKey: "BATTLE_POINTS",
    devLayoutPointId: "point-1",
    devLayoutTargetType: "shield",
    devLayoutRole: "shield"
  });
});
