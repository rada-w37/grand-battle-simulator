# Handoff.md

## Current Goal

GrandBattleSimulator Phase6-D/E: point guild select row, background band, offset vocabulary, and dev editor responsibilitiesを分離する。

## Current Status

Phase6-B完了: `.point-selects` row heightは`--map-point-select-row-height`参照済み。  
Phase6-D-1完了: legacy/new offset互換reader追加済み。  
Phase6-D-2完了: desktopの`select.height` legacy offsetは全拠点で新語彙へ移行済み。

## Architecture

- `.point-labels`が背景帯を担当し、`::before`/`::after`で2本を描画する。
- `.point-selects`がselect 2行のgrid stackを担当する。
- `.point select`がnative select control本体を担当する。
- `applyPointUiOffsets()`がpoint offsetをCSS variablesへ反映する。
- `clearPointUiOffsets()`がruntime反映したCSS variablesを削除する。

## Decisions

- DOM構造はまだ変更しない。
- `TYPE_LAYOUT` / `VIEWPORT_LAYOUT` / `mergeLayoutLayers`本適用はまだしない。
- dev layout editor整合はPhase6-Cとして保留。
- `select.x` / `select.y`はlegacy語彙のまま維持。
- mobile `pointLabels.height`系は未着手。
- 新offsetがlegacyと同じCSS varを対象にする場合はnew優先。

## Important Files

- `js/layout/point-ui-layout.js`
- `js/layout/point-offsets.js`
- `js/layout/target-rules.js`
- `js/dev/dev-layout-editor.js`
- `style.css`
- `docs/phase6-layout-migration-roadmap.md`

## Remaining Tasks

1. Phase6-D-3: `select.x` / `select.y`を新語彙へ移行するか調査する。
2. Phase6-D-4: `pointLabels.height` / background band系offsetの分離方針を決める。
3. Phase6-C: dev layout editorを新offset語彙に合わせて再設計する。
4. Phase6-E: `.point-labels`と`.point-selects`の配置モデル統一を検討する。

## Known Issues

- 背景帯とselect行はまだsibling DOMかつ別基準配置。
- native selectの文字描画中心はzoom倍率で揺れやすい。
- dev layout editorはlegacy offset前提。
- mobile背景帯offsetは`pointLabels`依存が強い。

## Validation Status

- 最新確認: `node --check js/layout/point-offsets.js`
- 最新確認: `git diff --check`
- fake DOMでdesktop select height vars出力確認済み。
- build/test/typecheckは未実施。

## Next Session Start

まず`git status`を確認し、`docs/phase6-layout-migration-roadmap.md`と`js/layout/point-offsets.js`を読んでから、`select.x` / `select.y`の新語彙移行調査に入る。
