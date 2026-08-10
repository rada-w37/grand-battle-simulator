# Handoff.md

## Current Goal

Grand Battle Simulator の DDD 化初期リファクタリング Step 0-14 は完了。
次の作業者が入る前に、ブラウザで既存 UI/API/保存復元の手動確認を行う。

今回のリファクタリングの目的は、仕様や UI を変えずに、AI/Codex でも安全に改修しやすい境界を作ること。
厳密な DDD の全面移行ではなく、既存の `ui.js` / `api.js` / `utils.js` を互換 facade として残しながら、純粋関数と外部入出力を段階的に分離した。

## Recent UI Work (2026-08-10)

- Map内スコアパネルを追加済み。折り畳み、ギルド別の累計/合計、神殿/城/教会の保有数を表示する。
- 累計アイコンは積み上げ矢印、合計アイコンは `Σ`。拠点アイコンは `resource/map-score-*.png` を使用する。
- 神殿は控えめなゴールド、城はシルバー、教会は控えめなブロンズとしてCSS filterで配色している。元PNGは変更しない。
- 最新コミット: `044fa08 スコアアイコンのゴールドとブロンズを強調`
- ユーザー側の未追跡コピー `resource/map-score-*-コピー.png` は変更・削除・コミットしていない。

## Completed: Step 0-14

- Step 0: `docs/grand-battle-simulator-ddd-refactor-plan.md` を追加し、DDD 化方針、現状責務、移行ステップ、テスト方針を記録した。
- Step 1: `js/domain/occupation-state.js` を追加し、占領状態の正規化、clone、空状態生成を分離した。
- Step 2: `js/domain/scoring.js` を追加し、スコア生成、拠点種別加点、active/cumulative score 計算を分離した。
- Step 3: `js/domain/occupation-history.js` を追加し、占領履歴差分、undo/redo 用の純粋処理を分離した。
- Step 4: `js/domain/battle-snapshot.js` を追加し、API battle snapshot から占領状態を作る処理を分離した。
- Step 5: `js/domain/worlds.js` を追加し、world 名正規化、world option/range helper を分離した。
- Step 6: `js/domain/guilds.js` を追加し、guild entry、guild rename、色/slot 参照 helper を分離した。
- Step 7: `js/infrastructure/storage.js` を追加し、localStorage 読み書きと JSON storage helper を分離した。
- Step 8: `js/infrastructure/mentemori-api.js` を追加し、API URL 生成、`fetchJson`、HTTP/API error handling を分離した。
- Step 9: `js/application/battle-data-boundary.js` を追加し、API/UI 境界のデータ準備処理を置いた。
- Step 10: facade import を整理し、domain から layout/constants へ寄りすぎる依存を減らした。
- Step 11 前 cleanup: `js/config/app-config.js` を追加し、`API_BASE_URL` と `STORAGE_KEYS` を `constants.js` から分離した。
- Step 11: application service を拡張し、fetch/localStorage/DOM を持たないデータ準備層として整理した。
- Step 12: `js/presentation/dom-helpers.js` を追加し、option/cell 生成の小さな DOM helper を分離した。
- Step 13: `docs/grand-battle-simulator-layout-boundary.md` を追加し、`layout/` は domain ではなく presentation-support / layout-support と明文化した。
- Step 14: final import/export cleanup を実施し、未使用 import を削除し、最終境界方針を refactor plan に追記した。

## Current Structure

```text
js/
  domain/
    occupation-state.js
    scoring.js
    occupation-history.js
    battle-snapshot.js
    worlds.js
    guilds.js
  application/
    battle-data-boundary.js
  infrastructure/
    storage.js
    mentemori-api.js
  presentation/
    dom-helpers.js
  config/
    app-config.js
  layout/
    ...
  api.js
  ui.js
  utils.js
  constants.js
  state.js
```

責務の目安:

- `domain/`: DOM、fetch、localStorage、layout に依存しない純粋なルール/変換。
- `application/`: UI/API 間にあるデータ準備。副作用の実行層ではない。
- `infrastructure/`: localStorage と HTTP/API など外部入出力。
- `presentation/`: DOM 作成や表示補助。イベント登録や大きな描画 orchestration はまだ `ui.js` 側。
- `config/`: API base URL や storage keys など、layout 再 export を含まない小さな設定。
- `layout/`: domain ではなく presentation-support / layout-support。Phase6 互換と dev layout editor 連携を優先する。

## Facades Kept Intentionally

- `constants.js`: 既存 import 互換のため残す。`API_BASE_URL` / `STORAGE_KEYS` は `config/app-config.js` から re-export し、layout 関連定数の既存参照も維持する。
- `utils.js`: 既存 call site 互換のため残す。domain/presentation helper への委譲・re-export を担う。
- `api.js`: 既存 API facade として残す。API orchestration、既存 export、UI からの呼び出し口を急に変えない。
- `ui.js`: 既存 presentation facade として残す。DOM 更新、イベントに近い orchestration、既存 UI export の互換を維持する。
- `guildNameEditor.js`: guild rename の UI bridge として残す。domain helper は利用するが、表示更新や編集 UI の流れは急に移動しない。

これらは「消し忘れ」ではなく、既存挙動と外部参照を守るための互換層。
今後削る場合も、1コミット単位で参照調査、テスト、ブラウザ確認を行う。

## Current Validation Baseline

最新のスコアアイコン配色調整後:

- `node --test tests`: 71 pass
- `node --check js/ui.js js/events.js js/presentation/map-export.js js/dom-elements.js`: pass
- `git diff --check`: pass
- `http://127.0.0.1:5180/index.html` で表示確認済み。スコアパネル、MAP上の配置、神殿/城/教会の配色を確認した。
- ブラウザのコンソールエラーなし。
- 配色調整はUI改善サイクル2回（調整1回、再監査1回）で完了。追加の色変更は不要と判断した。
- push / deploy は実施していない。
- 作業ツリーは追跡対象ファイルがクリーンで、未追跡コピー3件のみ残っている。

Step 14 完了時点の確認:

- `node --test tests`: 54 pass
- `node --check` for changed/major JS files: pass
- `git diff --check`: pass
- HTTP static check: `/` and `/js/main.js` returned 200
- Step 14 commit: `84920eb refactor: finalize ddd import cleanup`

現在残っている import cycle は既存 facade/layout/UI 系のみ。
DDD 化で追加した `domain/`、`application/`、`infrastructure/`、`config/` 側に新しい循環は作っていない。

## Manual Browser Check Items

最終手動確認では、仕様変更がないことを優先して見る。

1. 初期表示
   - `/` が開ける
   - console error が出ない
   - map、guild list、score 表示、tabs が表示される

2. world/block 選択
   - server/world/class/block の選択肢が表示される
   - 選択変更で既存と同じように状態が更新される
   - reload 後に選択状態が復元される

3. API データ適用
   - API 取得ボタンまたは既存導線で battle data を適用できる
   - guild 名と占領状態が既存と同じ形で反映される
   - API エラー時の表示/挙動が既存から変わっていない

4. 占領状態変更
   - 各拠点の defender/attacker 選択ができる
   - temple/castle/church の score が既存仕様どおり更新される
   - 空 guild や未占領状態が加点されない

5. undo/redo
   - 占領状態変更後に undo できる
   - redo できる
   - tab をまたいだときに既存どおり履歴が扱われる

6. guild rename
   - guild 名編集ができる
   - defender/attacker/highlight/score 表示が既存どおり追従する
   - 空欄や未変更時の挙動が変わっていない

7. score 表示
   - active tab の score が正しい
   - active tab までの cumulative score が正しい
   - 表示順、class、テキストが変わっていない

8. reload 後の復元
   - world/block selection が復元される
   - guild 名、占領状態、tabs、score が既存保存形式から復元される
   - localStorage key や保存形式の破壊がない

9. layout / Phase6 周辺
   - map 上の point label/select の位置が崩れていない
   - desktop/mobile の表示が既存と大きく変わっていない
   - dev layout editor を使う場合、既存の layout metadata が壊れていない

## Future Improvement Candidates

- `ui.js` の大きな orchestration を、DOM 更新順を変えない範囲でさらに小さな presentation helper へ分ける。
- `api.js` の UI bridge と infrastructure 呼び出しの境界を、既存 export 互換を保ちながら薄くする。
- `state.js` の global mutable state はまだ大きい。すぐ分割せず、先に利用箇所を調査して小さな state accessor 単位で切る。
- `utils.js` facade は互換維持で残っている。参照が減った helper から順に import 元を新 module へ寄せる。
- import cycle は既存 facade/layout/UI 系に残っている。挙動確認が十分になってから、presentation 側の整理として別タスク化する。
- `layout/` は domain へ移さない。変更する場合は `docs/grand-battle-simulator-layout-boundary.md` の方針に従う。
- tests は domain/application/infrastructure 中心に増えた。今後 UI helper を増やす場合は fake DOM が重くなりすぎない範囲で behavior 寄りに足す。

## Where To Touch Next

次に触るなら、まずは手動ブラウザ確認を完了する。
そこで問題がなければ、次の安全な候補はどちらか。

1. Presentation small cleanup
   - `ui.js` から DOM 作成 helper をもう少し `presentation/` へ移す。
   - DOM 構造、class、表示テキスト、イベント登録順は変えない。

2. Facade call site cleanup
   - `utils.js` 経由で呼んでいる domain helper の一部を、明らかに安全な call site だけ直接 import に寄せる。
   - 既存 export は削除しない。

避けるべき次手:

- `state.js` の大規模分解。
- `layout/` の domain 移動。
- `ui.js` の丸ごと分割。
- Repository パターンや新しい use-case 層の導入。
- 保存キー、保存形式、API URL、DOM 構造、CSS class の変更。

## Recommended Commands

```powershell
node --test tests
node --check js/ui.js
node --check js/api.js
node --check js/utils.js
node --check js/constants.js
git diff --check
git status --short --untracked-files=all
```

ブラウザ確認用の簡易サーバ例:

```powershell
python -m http.server 5180
```

または Node の一時 static server を使う。
Windows 環境では Python の挙動が不安定な場合があるため、接続できない場合は Node 側で確認する。
