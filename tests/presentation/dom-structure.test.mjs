import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const indexHtml = readFileSync(
  fileURLToPath(new URL("../../index.html", import.meta.url)),
  "utf8"
);
const uiSource = readFileSync(
  fileURLToPath(new URL("../../js/ui.js", import.meta.url)),
  "utf8"
);
const occupationTabsSource = readFileSync(
  fileURLToPath(new URL("../../js/occupationTabs.js", import.meta.url)),
  "utf8"
);
const mapExportSource = readFileSync(
  fileURLToPath(new URL("../../js/presentation/map-export.js", import.meta.url)),
  "utf8"
);
const eventsSource = readFileSync(
  fileURLToPath(new URL("../../js/events.js", import.meta.url)),
  "utf8"
);
const apiSource = readFileSync(
  fileURLToPath(new URL("../../js/api.js", import.meta.url)),
  "utf8"
);
const guildGridSource = readFileSync(
  fileURLToPath(new URL("../../js/renderGuildGrid.js", import.meta.url)),
  "utf8"
);
const styleSource = readFileSync(
  fileURLToPath(new URL("../../style.css", import.meta.url)),
  "utf8"
);

test("provides semantic structure for the static application shell", () => {
  assert.match(indexHtml, /<h1 class="visually-hidden">Grand Battle Simulator<\/h1>/);
  assert.match(indexHtml, /<section class="panel source-panel" aria-labelledby="source-heading">/);
  assert.match(indexHtml, /<fieldset class="source-grid">[\s\S]*<legend class="visually-hidden">/);
  assert.match(indexHtml, /id="battle-class-tabs" class="battle-class-tabs" role="tablist"/);
  assert.equal((indexHtml.match(/class="battle-block-card" data-block-value=/g) || []).length, 4);
  assert.equal((indexHtml.match(/data-block-guild-grid=/g) || []).length, 4);
  assert.match(indexHtml, /id="battle-selection-summary" class="battle-selection-summary"/);
  assert.match(indexHtml, /id="guild-name-editor-controls" hidden/);
  assert.doesNotMatch(indexHtml, /id="score-body"/);
  assert.doesNotMatch(indexHtml, /class="panel score-panel"/);
  assert.doesNotMatch(indexHtml, /name="highlight-guild"/);
  assert.equal((indexHtml.match(/scope="col"/g) || []).length, 6);
  assert.match(indexHtml, /<section class="panel map-panel" aria-labelledby="map-heading">/);
  assert.match(indexHtml, /<header class="tab-row">/);
  assert.match(indexHtml, /class="map-history-controls" role="group" aria-label="MAP操作"/);
  assert.match(indexHtml, /id="map-screenshot-button" class="map-history-button map-screenshot-button"/);
  assert.match(indexHtml, /<dialog id="battle-data-confirmation-dialog"/);
  assert.match(indexHtml, /data-dialog-action="overwrite"/);
  assert.match(indexHtml, /data-dialog-action="new-tab"/);
  assert.match(indexHtml, /data-dialog-action="cancel"/);
  assert.match(indexHtml, /class="map-zoom-controls" role="group"/);
  assert.match(indexHtml, /id="map-score-panel" class="map-score-panel"/);
  assert.match(indexHtml, /id="map-score-panel-toggle" class="map-score-panel-toggle"/);
  assert.match(indexHtml, /id="map-score-body"/);
  assert.match(indexHtml, /resource\/map-score-temple\.png/);
  assert.match(indexHtml, /resource\/map-score-castle\.png/);
  assert.match(indexHtml, /resource\/map-score-church\.png/);
  assert.match(indexHtml, /class="map-score-structure-icon map-score-temple-icon"/);
  assert.match(indexHtml, /class="map-score-structure-icon map-score-castle-icon"/);
  assert.match(indexHtml, /class="map-score-structure-icon map-score-church-icon"/);
  assert.match(indexHtml, /<path d="M18 21V8m0 0-3 3m3-3 3 3" \/>/);
  assert.match(indexHtml, /id="mobile-point-picker" class="mobile-point-picker" role="dialog" aria-modal="true" aria-labelledby="mobile-point-picker-title"/);
});

test("uses modal confirmation for destructive actions and keeps map export labels visible", () => {
  assert.doesNotMatch(uiSource, /window\.confirm/);
  assert.doesNotMatch(occupationTabsSource, /window\.confirm/);
  assert.match(uiSource, /showDestructiveConfirmation/);
  assert.match(occupationTabsSource, /showDestructiveConfirmation/);
  assert.match(mapExportSource, /root\.dataset\.showAttacker = mapContainer\.dataset\.showAttacker/);
  assert.match(mapExportSource, /root\.dataset\.showDefender = mapContainer\.dataset\.showDefender/);
  assert.match(mapExportSource, /copyMapCssVariables\(document\.documentElement, root\)/);
  assert.match(mapExportSource, /\.point-selects\{display:grid!important/);
  assert.match(mapExportSource, /\.point-name-label\[data-point-id='/);
  assert.match(mapExportSource, /is-export-empty-attacker/);
  assert.match(mapExportSource, /map-export-select\.is-export-empty-attacker\{visibility:hidden!important;/);
  assert.match(mapExportSource, /point\.has-self-attack \.point-sword-frame/);
  assert.match(mapExportSource, /point\.has-self-attack \.point-labels::before/);
  assert.match(mapExportSource, /point\.has-self-attack \.point-attacker-select\{visibility:hidden!important;/);
  assert.match(mapExportSource, /is-export-empty-defender/);
  assert.match(mapExportSource, /point\.is-export-empty-defender \.point-frame/);
  assert.match(mapExportSource, /point\.is-export-empty-defender \.point-labels::after/);
  assert.match(mapExportSource, /sourceMapScorePanel/);
  assert.match(mapExportSource, /sourceMapScorePanel\.cloneNode/);
  assert.match(uiSource, /export function updateMapScorePanel/);
  assert.match(uiSource, /export function toggleMapScorePanel/);
  assert.match(uiSource, /className = "map-score-guild-button"/);
  assert.match(uiSource, /row\.className = `map-score-row guild-row\$\{index \+ 1\}`/);
  assert.match(uiSource, /row\.classList\.toggle\("is-highlighted", isHighlighted\)/);
  assert.match(uiSource, /state\.highlightedGuildName === guild\.name \? "" : guild\.name/);
  assert.match(uiSource, /nameButton\.setAttribute\("aria-pressed"/);
  assert.doesNotMatch(uiSource, /createScoreGuildRadioCell/);
  assert.match(apiSource, /Promise\.all\(BATTLE_BLOCK_VALUES\.map/);
  assert.match(apiSource, /export function selectBattleBlock/);
  assert.match(guildGridSource, /export function renderBattleBlockGuilds/);
  assert.match(guildGridSource, /export function syncBattleSelectionControls/);
  assert.match(eventsSource, /document\.querySelectorAll\("\[data-class-value\]"\)/);
  assert.match(eventsSource, /document\.querySelectorAll\("\[data-block-value\]"\)/);
  assert.match(eventsSource, /state\.elements\.block\.value === card\.dataset\.blockValue/);
  assert.match(eventsSource, /mapScorePanelToggle\?\.addEventListener/);
  assert.match(styleSource, /\.map-score-temple-icon[\s\S]*?invert\(72%\)/);
  assert.match(styleSource, /\.map-score-castle-icon[\s\S]*?invert\(70%\)/);
  assert.match(styleSource, /\.map-score-church-icon[\s\S]*?invert\(51%\)/);
  assert.match(styleSource, /\.map-score-guild-button[\s\S]*?padding: 0 4px 0 5px/);
  assert.match(styleSource, /\.guild-grid \.guild-cell1[\s\S]*?151, 53, 57/);
  assert.match(styleSource, /\.guild-grid \.guild-cell2[\s\S]*?54, 82, 143/);
  assert.match(styleSource, /\.guild-grid \.guild-cell3[\s\S]*?57, 112, 71/);
  assert.match(styleSource, /\.guild-grid \.guild-cell4[\s\S]*?139, 108, 37/);
  assert.match(uiSource, /message: "全ての占拠データ、タブ、履歴を初期化します。"/);
  assert.match(occupationTabsSource, /message: "選択中のタブと、そのタブの履歴を削除します。"/);
  const battleDataDialogSource = readFileSync(
    fileURLToPath(new URL("../../js/presentation/battle-data-dialog.js", import.meta.url)),
    "utf8"
  );
  assert.match(battleDataDialogSource, /noteText = "この操作はUndoでは戻せません。"/);
  assert.match(battleDataDialogSource, /noteTone: "danger"/);
});
