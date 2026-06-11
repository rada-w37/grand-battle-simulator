# Grand Battle Simulator DDD Refactor Plan

## 目的

Grand Battle Simulatorを、AI/Codexと人間が安全に実装・保守しやすい構成へ段階的に移行する。

この計画で目指すのは学術的に厳密なDDDではなく、個人開発向けの実用的DDDである。過剰な抽象化、Repositoryパターンの乱用、大規模な一括移行は避ける。既存のUI、API、仕様、表示挙動を変えず、純粋関数と責務境界を少しずつ増やす。

## 基本方針

- 1回の実装タスクは最大1時間程度、1コミット単位で完了できる粒度にする。
- 仕様変更、UI変更、DOM構造変更、スコア仕様変更は原則しない。
- 既存動作を壊さないことを最優先にする。
- 既存の`ui.js`、`api.js`、`utils.js`、`state.js`は当面互換ファサードとして残す。
- 既存importを急に書き換えず、新しい純粋モジュールへ委譲またはre-exportする。
- `layout/`はPhase6移行中のため、初期DDD化では安易に`domain`へ移さない。
- `tools/placement-tool`は`.gitignore`対象の補助ツールなので、今回のDDD化対象外とする。

## 現状責務

### `main.js`

アプリ初期化、循環依存ブリッジ、layout CSS vars適用、viewport変更時の再描画、dev layout editor起動を担当している。

### `state.js`

グローバルmutable state、setter群、DOM registryのre-exportを担当している。UI状態、API取得状態、占領状態、タブ状態、編集状態が同じファイルに集まっている。

### `ui.js`

最も責務が混在している中心ファイル。

- ステータス表示
- guild保存と表示
- MAP拠点DOM生成
- guild select更新
- スコア計算
- スコア表DOM描画
- 占領履歴undo/redo
- 占領タブ保存
- mobile point picker
- API取得データの反映
- 全データリセット

DDD化では、最初にここからドメインロジックだけを純粋関数として外へ出す。

### `api.js`

HTTP fetch、API URL生成、world選択、battle selection保存復元、APIレスポンスからguild/occupationを読む処理、UI callbackブリッジが混在している。

初期段階では、HTTPや`localStorage`を触る部分をinfrastructure、APIレスポンス解釈をdomain/applicationへ分ける候補とする。

### `utils.js`

DOM helper、storage helper、占領状態正規化、guild utility、tab utility、world名正規化、score utilityが混在している。

`normalizePointState`、`cloneOccupationStates`、`createEmptyOccupationStates`、score関連は純粋関数として最初に分離しやすい。

### `events.js`

DOMイベントbinding、MAP zoom/pan状態、visibility toggle、select change時の状態保存・再計算が混在している。

初期DDD化では大きく動かさず、domain/applicationの抽出が進んだ後にpresentation層として整理する。

### `layout/`

MAP座標、拠点定義、viewport別CSS vars、point offset、layout editor連携を担当している。

Phase6 layout migrationの途中であり、`point-offsets.js`、`point-ui-layout.js`、`target-rules.js`、`dev-layout-editor.js`は既存ロードマップを優先する。DDD化初期では、layoutを無理にdomainへ移さない。

## ドメイン概念

- `BattleSelection`: server、world、class、blockの選択。
- `WorldGroup` / `WorldOption`: API world groupから作るworld候補。
- `Guild` / `GuildSlot` / `GuildName`: 最大4枠のguild表示名と色。
- `BattlePoint`: id、castleId、type、座標を持つ拠点。
- `PointOccupation`: defenderとattackerの選択状態。
- `OccupationTab`: Day単位の占領状態。
- `OccupationHistory`: undo/redo用の占領差分。
- `Score` / `CumulativeScore`: 拠点種別ごとの点数と累計。
- `BattleApiSnapshot`: APIのcastles/guildsからUI用占領状態へ変換する入力。
- `MapLayout`: 表示座標、offset、viewport別layout。初期DDD化ではpresentation supportとして扱う。

## 責務が混ざっている箇所

- `ui.js`のスコア計算はDOM描画と密結合している。
- `ui.js`の占領履歴は差分計算、stack管理、DOM反映が同じ場所にある。
- `ui.js`の`applyBattleData()`はAPIデータ解釈、確認ダイアログ、DOM select更新、保存、履歴、スコア更新を同時に行う。
- `api.js`のworld候補計算はHTTP取得やDOM state参照と同居している。
- `api.js`の`getOccupyingGuild()` / `getAttackingGuild()`はAPIレスポンス解釈のドメインルールだが、infrastructure寄りファイルにある。
- `utils.js`はDOM helperと純粋なドメイン処理が混在している。
- `guildNameEditor.js`のguild renameは、参照置換というドメイン操作とUI保存・再描画が混ざっている。
- `state.js`はUI状態、取得データ、ドメイン状態、DOM registryを同じglobal moduleで管理している。

## 推奨構成

最初から完全なレイヤー構成にせず、既存構成の横に小さい純粋モジュールを追加する。

```text
js/
  domain/
    occupation-state.js
    scoring.js
    guilds.js
    worlds.js
    battle-snapshot.js
  infrastructure/
    storage.js
    mentemori-api.js
  presentation/
    (後続でDOM描画やevent handlerを段階的に移す)
```

### `domain`

DOM、`window`、`document`、`localStorage`、`fetch`に依存しない純粋関数だけを置く。

### `infrastructure`

外部入出力を担当する。初期対象は`localStorage`とHTTP fetch。

### `presentation`

DOM生成、イベントbinding、CSS class/data属性更新などを担当する。初期段階では既存`ui.js`、`events.js`を残し、後続で段階的に寄せる。

### `application`

必要になった段階で追加する。`applyBattleData`、guild rename確定、tab切替など、domain関数とpresentation/infrastructureを接続する薄いuse caseを置く候補とする。最初から作らない。

## 移行ステップ

### Step 0: DDD化計画をdocs-onlyで記録

- この`docs/grand-battle-simulator-ddd-refactor-plan.md`を追加する。
- 実装コードは変更しない。
- UI/API/仕様変更はしない。
- 検証: `git diff --check`

### Step 1: Occupation state extraction

- `js/domain/occupation-state.js`を追加する。
- `normalizePointState`、`cloneOccupationStates`、`createEmptyOccupationStates`を移す。
- `utils.js`は互換exportを残す。
- 既存call siteの挙動を変えない。
- `tests/domain/occupation-state.test.mjs`を追加し、旧形式string、legacy `guildName`、空値、defender/attacker cloneを検証する。

### Step 2: Scoring extraction

- `js/domain/scoring.js`を追加する。
- `createEmptyScores`、`addPointScore`、`calculateScoresFromStates`を移す。
- `ui.js`は新domain関数を呼ぶだけにする。
- temple=4、castle=2、church=1、空guildは無視する挙動をテストする。

### Step 3: Occupation history difference extraction

- 占領履歴の差分作成を純粋関数として切り出す。
- undo/redo stack管理とDOM反映はまだ`ui.js`に残す。
- 差分なしの場合に履歴entryを作らないことをテストする。

### Step 4: Battle snapshot extraction

- `js/domain/battle-snapshot.js`を追加する。
- `getOccupyingGuild`、`getAttackingGuild`、API castles/guildsからselect statesを作る処理を分離する。
- `GvgCastleState`が2または3の場合はattackerをdefender扱いする既存ルールを維持する。

### Step 5: World selection extraction

- `js/domain/worlds.js`を追加する。
- `normalizeWorldName`、world候補生成、range groupingを分離する。
- DOMの候補表示は`worldSelector.js`に残す。

### Step 6: Guild rename extraction

- `js/domain/guilds.js`を追加する。
- guild名変更時のdefender/attacker/highlight参照置換を純粋関数化する。
- `guildNameEditor.js`は状態更新と再描画の接続役に寄せる。

### Step 7: Storage adapter extraction

- `js/infrastructure/storage.js`を追加する。
- `parseStoredJson`と主要storage keyの読み書きを移す。
- domain moduleから`localStorage`を参照しないルールを固定する。

### Step 8: Mentemori API adapter extraction

- `js/infrastructure/mentemori-api.js`を追加する。
- `fetchJson`、API URL生成、HTTPエラー処理を移す。
- APIレスポンスのドメイン解釈はdomain側に寄せる。

### Step 9: Application service candidates

- 必要になった段階で`js/application/`を追加する。
- `applyBattleData`、guild rename確定、tab切替などを薄いuse caseへ分解する。
- DOM更新順、保存順、履歴作成順は既存通り維持する。

### Step 10: Presentation cleanup

- `ui.js`を互換ファサードとして縮小する。
- DOM生成・イベント・状態反映を、必要に応じて`presentation/`へ移す。
- この段階までUI構造や見た目は変えない。

### Step 11: Layout boundary review

- Phase6 layout migrationと衝突しない範囲で、layout責務の境界を再確認する。
- layoutは初期DDD化ではdomainではなくpresentation supportとして扱う。
- `dev-layout-editor.js`はPhase6-C/D/Eの計画に合わせて別途扱う。

### Step 12: Facade cleanup

- テストと移行が十分に進んだ後、不要になった旧exportや重複helperを削る。
- 削除は最後の独立コミットにする。

## テスト方針

現状は`package.json`やテストディレクトリがないため、最初はNode標準の`node:test`を使う。

推奨コマンド:

```powershell
node --test tests
node --check js/domain/occupation-state.js
git diff --check
```

### 優先してテストする対象

- Occupation state:
  - string形式のlegacy stateをdefenderへ変換する。
  - `guildName` / `attackerGuildName`のlegacy keyを読む。
  - 空値や不正値を`{ defender: "", attacker: "" }`へ正規化する。
  - clone時に入力配列を破壊しない。
- Scoring:
  - temple=4、castle=2、church=1。
  - 空guildや未知guildは無視する。
  - active scoreとcumulative scoreが既存と一致する。
- Battle snapshot:
  - `GvgCastleState`が2または3の場合は`AttackerGuildId`を占領guildとして扱う。
  - attacker表示は`AttackerGuildId`から取得する。
- Guild rename:
  - defender/attackerの参照を置換する。
  - highlight対象の置換を維持する。
- World selection:
  - `1`、`W001`、全角数字などを既存通り正規化する。
  - world range groupingを維持する。

### UI/レイアウト検証

DDD初期ステップではUIやlayoutを変更しない。

layout変更を伴う将来ステップでは、既存のPhase6方針に従い、以下を優先する。

- `node --check`
- `git diff --check`
- fake DOMによるCSS custom property確認
- 必要時のみ静的HTTPサーバでのブラウザ確認

## Step 1で実施する具体タスク

次のStep 1では、`Occupation state extraction`を実施する。

作業内容:

1. `js/domain/occupation-state.js`を追加する。
2. `utils.js`から以下を新moduleへ移す。
   - `normalizePointState`
   - `cloneOccupationStates`
   - `createEmptyOccupationStates`
3. `utils.js`は既存import互換のため、同名exportを維持する。
4. `tests/domain/occupation-state.test.mjs`を追加する。
5. 既存UI/API/仕様/DOM構造は変更しない。

Step 1の検証:

```powershell
node --test tests
node --check js/domain/occupation-state.js
node --check js/utils.js
git diff --check
```

## Step 13 Layout Boundary Review

Step 13ではdocs-onlyで `layout/` の境界方針を明文化した。

詳細は `docs/grand-battle-simulator-layout-boundary.md` を参照する。

要点:

- `js/layout/` はdomainではなく presentation-support / layout-support として扱う。
- `domain/` は `layout/`、`BATTLE_POINTS`、CSS vars、dev layout editor metadataへ直接依存しない。
- `layout/` はPhase6 layout migrationとdev layout editorの互換契約を含むため、DDD refactorのついでにdomainへ移動しない。
- `ui.js`、`main.js`、map rendering modulesからのlayout importは、表示支援責務として許容する。
- Step 14 final import cleanupでは、layoutをdomainへ移すのではなく、facade/import noiseの整理に留める。

## Step 14 Final Import/Export Cleanup

Step 14では削除を主目的にせず、Step 1からStep 13で作った境界が実装と矛盾していないかを確認した。

最終方針:

- `domain/` は `layout/`、`constants.js`、`localStorage`、`fetch`、DOMへ依存しない。
- `infrastructure/` は `config/` と外部入出力だけを扱い、`ui.js`、`state.js`、`presentation/` へ依存しない。
- `application/` はDOM/event/localStorage/fetchを持たず、UI/API間のデータ準備に留める。
- `presentation/` は小さなDOM helperに留め、domain ruleを直接持たない。
- `config/` はlayoutやutilsへ依存しない。
- `constants.js`、`utils.js`、`api.js`、`ui.js` の既存exportは、互換facadeとして必要なものを残す。

Step 14で実施したコード整理:

- `api.js` の未使用 `BATTLE_POINTS` importを削除した。
- `ui.js` の未使用API helper importを削除した。

残したfacade:

- `constants.js`: 既存import互換のため、config値と表示定数、layout再exportを保持する。
- `utils.js`: 既存call site互換のため、domain/presentation helperへの委譲exportを保持する。
- `api.js`: 既存API facadeとして `fetchJson` re-exportやbattle API orchestrationを保持する。
- `ui.js`: 既存presentation facadeとして各UI exportと既存bridgeを保持する。
