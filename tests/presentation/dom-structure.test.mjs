import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const indexHtml = readFileSync(
  fileURLToPath(new URL("../../index.html", import.meta.url)),
  "utf8"
);

test("provides semantic structure for the static application shell", () => {
  assert.match(indexHtml, /<h1 class="visually-hidden">Grand Battle Simulator<\/h1>/);
  assert.match(indexHtml, /<section class="panel source-panel" aria-labelledby="source-heading">/);
  assert.match(indexHtml, /<fieldset class="source-grid">[\s\S]*<legend class="visually-hidden">/);
  assert.match(indexHtml, /<section class="guild-display" aria-labelledby="guild-heading">/);
  assert.match(indexHtml, /id="guild-grid" class="guild-grid" role="list"/);
  assert.match(indexHtml, /<caption class="visually-hidden">ギルド別獲得ポイント<\/caption>/);
  assert.equal((indexHtml.match(/scope="col"/g) || []).length, 7);
  assert.match(indexHtml, /<section class="panel map-panel" aria-labelledby="map-heading">/);
  assert.match(indexHtml, /<header class="tab-row">/);
  assert.match(indexHtml, /class="map-history-controls" role="group" aria-label="MAP操作"/);
  assert.match(indexHtml, /id="map-screenshot-button" class="map-history-button map-screenshot-button"/);
  assert.match(indexHtml, /<dialog id="battle-data-confirmation-dialog"/);
  assert.match(indexHtml, /data-dialog-action="overwrite"/);
  assert.match(indexHtml, /data-dialog-action="new-tab"/);
  assert.match(indexHtml, /data-dialog-action="cancel"/);
  assert.match(indexHtml, /class="map-zoom-controls" role="group"/);
  assert.match(indexHtml, /id="mobile-point-picker" class="mobile-point-picker" role="dialog" aria-modal="true" aria-labelledby="mobile-point-picker-title"/);
});
