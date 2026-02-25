# 🇯🇵 日本語パスフレーズジェネレーター
### Japanese Passphrase Generator

**[→ 今すぐ使う / Try it now](https://passphrase.aosankaku.net)**

日本語の単語を組み合わせて、覚えやすくて強固なパスフレーズを生成するツールです。

A web tool that generates strong, memorable passphrases from Japanese words.

---

## これは何？ / What is this?

パスワードの代わりに、複数の日本語単語を組み合わせた「パスフレーズ」を生成します。英語のパスフレーズ生成ツールは多くありますが、**日本語に特化したツール**はほとんど存在しませんでした。

Instead of a random string of characters, a **passphrase** combines multiple words into something you can actually remember — while remaining far stronger than a typical password. This tool does that in Japanese.

### なぜ日本語？ / Why Japanese?

- 日本語話者にとって、日本語の単語の方が圧倒的に覚えやすい
- 日本語単語4つの組み合わせは、8桁英数字パスワードの**約50倍**の強度
- 生成されたパスフレーズはローマ字表記にも対応しており、どんなサービスにも入力できる

- Japanese words are far more memorable for Japanese speakers
- 4 Japanese words yield roughly **50× more entropy** than an 8-character alphanumeric password
- Output includes romaji so it can be typed anywhere

---

## 機能 / Features

- ランダムな日本語単語でパスフレーズを生成（漢字・ローマ字表示）
- 単語数・区切り文字・ローマ字スタイル・数字スロットをカスタマイズ可能
- エントロピー（強度）をリアルタイム表示
- すべての生成はブラウザ内で完結 — サーバーへの送信なし
- ダーク／ライトテーマ対応

---

- Generates passphrases from a curated Japanese wordlist (kanji + romaji display)
- Customizable word count, separator, romaji style, and number slot
- Real-time entropy/strength indicator
- Fully client-side — nothing is ever sent to a server
- Dark / light theme

---

## プライバシー / Privacy

生成したパスフレーズはブラウザ外に一切送信されません。サーバーへの通信も、ログの保存も行いません。

Generated passphrases never leave your browser. No network requests, no logging.

---

## 技術スタック / Tech Stack

|                   |                               |
| ----------------- | ----------------------------- |
| Framework         | React 19 + TypeScript (Vite)  |
| UI                | MUI v7 + styled-components v6 |
| Romaji conversion | wanakana                      |
| CSV parsing       | papaparse                     |
| Package manager   | Bun                           |

---

## 開発者向け / Development

```bash
bun install      # install dependencies
bun dev          # start dev server
bun run build    # type-check + build
bun run lint     # ESLint
bun run preview  # preview production build
```

### 単語リストについて / About the wordlist

`src/assets/wordlist.csv` にある単語リストは以下の基準で厳選されています：

The wordlist at `src/assets/wordlist.csv` is curated to include only words that:

- ひらがな・ローマ字だけで即座に意味がわかる / Are immediately understandable from hiragana/romaji alone
- ひらがな2〜7文字（拗音は0.5文字換算）/ Are 2–7 hiragana characters (contracted sounds count as 0.5)
- 一般的な日常語のみ（専門用語・固有名詞・商標・不適切語を除く）/ Are common everyday words (no jargon, proper nouns, trademarks, or offensive terms)

詳細は [`src/assets/wordlist_rules.md`](src/assets/wordlist_rules.md) を参照してください。

See [`src/assets/wordlist_rules.md`](src/assets/wordlist_rules.md) for the full specification.

---

## ライセンス / License

© 2026 [Blue Triangle](https://aosankaku.net) All rights reserved.
