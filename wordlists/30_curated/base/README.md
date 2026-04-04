# Base Subcategories

`manual.csv` を補う一般語は、このディレクトリに review 済み CSV として追加する。

運用:

- 手動レビューの再開点は [`CODEX_STATE.md`](/mnt/c/Users/abcde/dev/web/react/passphrase-generator-japanese/wordlists/30_curated/base/CODEX_STATE.md)
- Codex が追加する review 済み CSV は `codex-gpt54-batch-NN.csv` の連番に固定する
- 追加前に重複チェック、追加後に validation を必ず行う

対象:

- 一般に日本の中学生までで習うような一般的な単語
- デフォルト同梱してよい語
- 地名セットや専門語セットに分ける必要がない語

フロントエンドと `wordlists/90_scripts/*.ts` は `manual.csv` とこのディレクトリ配下の CSV をまとめて基本語彙として扱う。
