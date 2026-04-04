# Wordlists Workspace

追加ワードセットの収集、レビュー、公開前ビルドを一元管理するための作業領域。

## Goals

- 公開用の安全な基本語彙と、追加ワードセット候補を分離する
- 収集元、ライセンス、レビュー状態、除外理由を追跡できるようにする
- 地名や専門用語を opt-in のサブセットとして管理できるようにする

## Directory Layout

```text
wordlists/
  config.toml
  README.md
  00_rules/
  10_sources/
  20_working/
  30_curated/
  40_build/
  90_scripts/
```

### `00_rules/`

- `global.md`: 全セット共通の公開基準
- `base.md`: デフォルト同梱の基本語彙向けの基準
- `geography.md`: 地名セット向けの追加ルール
- `domain.md`: 専門語セット向けの追加ルール
- `names.md`: 人名セット向けの追加ルール

### `10_sources/`

各収集元ごとに `manifest.toml` と `raw/` を置く。

- `manifest.toml`: 出典、URL、取得日、ライセンス、想定用途、注意点
- `raw/`: 未加工の元データ

### `20_working/`

レビュー途中のデータ置き場。

- `candidates/`: 正規化済みだが未レビューの候補
- `needs_review.csv`: 自動判定だけでは残せない語
- `rejects.csv`: 落とした語と理由

### `30_curated/`

公開候補としてレビューを通した語彙。

- `base/manual.csv`: 手動管理している基本語彙の本体
- `base/*.csv`: 基本語彙のサブカテゴリ
- `geography/*.csv`: 地域別の地名セット
- `domain/*.csv`: 分野別の専門語セット
- `names/*.csv`: 人名の追加セット

### `40_build/`

スクリプト生成物。

- `active/`: 各セット単体の正規化出力

## File Format

公開対象の CSV は `wordlists/30_curated/base/manual.csv` と同じくヘッダなし 2 列。

```csv
表記,よみ
```

補助管理ファイルではヘッダ付き CSV を使ってよい。`rejects.csv` は次の列を推奨する。

```csv
surface,kana,source_id,reason,notes
```

## Workflow

1. `10_sources/<group>/<source>/manifest.toml` に収集元を登録する
2. 元データを `raw/` に保存する
3. 正規化して `20_working/candidates/*.csv` に落とす
4. `bun run wordlists/90_scripts/validate_curated.ts` などで機械チェックする
5. 判断保留は `20_working/needs_review.csv`、除外は `20_working/rejects.csv` に振り分ける
6. レビュー済みの語を `30_curated/` に昇格させる
7. 必要なら `bun run wordlists/90_scripts/build_wordlists.ts` で単体セットの正規化出力を作る

一般に日本の中学生までで習うような一般的な単語は、原則として `base/manual.csv` か `curated/base/*.csv` のいずれかに入れる。

## Initial Source Candidates

一次収集の候補として、次のような出典を想定している。

| Source | Use | License / Terms |
| --- | --- | --- |
| NINJAL 日本語教育基本語彙データベース | 基本語彙の母集団 | CC BY 4.0 |
| NINJAL 教育基本語彙データベース | 基本語彙の補強 | CC BY 4.0 |
| SudachiDict `core` / `small` | 読み仮名・基本形の補助 | Apache 2.0 |
| 国土地理院 地名情報 | 地名候補の収集 | 国土地理院コンテンツ利用規約 |
| e-Stat 標準地域コード | 地域別セットの整理、読み補助 | 政府標準利用規約系の公開データ |
| shuheilocale Japanese Personal Name Dataset | 名・姓の人名候補収集 | MIT |

BCCWJ のような頻度情報は候補の順位付けには有用だが、用途制限や再配布条件を都度確認すること。

## Commands

```bash
bun run wordlists/90_scripts/fetch_sources.ts --list
bun run wordlists/90_scripts/fetch_sources.ts
bun run wordlists/90_scripts/fetch_sources.ts --source estat-region-codes
bun run wordlists/90_scripts/normalize_sources.ts
bun run wordlists/90_scripts/normalize_sources.ts --source ninjal-basic-vocab-2009
bun run wordlists/90_scripts/triage_candidates.ts
bun run wordlists/90_scripts/triage_candidates.ts --source ninjal-basic-vocab-2009
bun run wordlists/90_scripts/validate_curated.ts
bun run wordlists/90_scripts/build_wordlists.ts
```

`validate_curated.ts` は `30_curated/` 配下の公開候補を検証する。`base/manual.csv` と `base/*.csv` も常に対象に含める。

フロントエンドは `30_curated/base/*.csv` と追加セット CSV を実行時に結合する。組み合わせ済みファイルは事前生成しない。

## Source Fetching

`fetch_sources.ts` は `10_sources/**/manifest.toml` を読み、`fetch = "auto"` の出典だけを `raw/` に保存する。

`normalize_sources.ts` は取得済みの `raw/` から、レビュー前の 2 列 CSV を `20_working/candidates/*.csv` に書き出す。文字コードはソースごとに切り替えており、NINJAL 2009 は Shift_JIS、e-Stat は UTF-8、NINJAL 1984 は `.xlsx` の XML を直接読む。

NINJAL 2009 では passphrase 向けに名詞系だけを候補化し、注記だけの表記や人名注記付きの行は候補から外す。

`triage_candidates.ts` は `20_working/candidates/*.csv` を見て、次の 3 系統に振り分ける。

- `20_working/rejects.generated.csv`: 長さ、文字種、記号など機械的に落とせる語
- `20_working/needs_review.generated.csv`: 地名、ソースまたぎの読み重複、センシティブ語候補など人手確認が必要な語
- `20_working/promote_ready/*.csv`: 機械チェックでは問題が見つからなかった語

`promote_ready` に出た語も自動では `30_curated/` に移さない。卑語や差別語のように文脈依存で判断が必要な語は、生成 AI や人手レビューなしでは安全に確定できないため。

地名系はひとまず保守的に次のように扱う。

- 市区町村、村、郡など個別地名は `promote_ready` に回す
- 県名、地方名、全国市部のような広域ラベルや著名ラベルは `needs_review.generated.csv` に残す

- 自動取得対象: NINJAL 2件、e-Stat 標準地域コード、shuheilocale 人名データ
- 手動管理: 国土地理院 地名情報、SudachiDict core

国土地理院 地名情報は公式ページ上で安定した機械取得 URL の確認が取れていない。SudachiDict core は Apache 2.0 だが、辞書同梱物の扱いを追加確認したうえで限定利用したいため、現時点ではどちらも手動取得のままにしている。
