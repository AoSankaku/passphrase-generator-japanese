# CLAUDE.md

Project-specific instructions for Claude Code.

## Project Overview

Japanese passphrase generator — picks 4 random words from a curated wordlist and displays them as a passphrase in both romaji and kanji.

## Tech Stack

- React 19 + TypeScript (Vite)
- MUI v7 for UI components
- styled-components v6 for custom styling
- wanakana for kana↔romaji conversion
- papaparse for CSV parsing
- Bun as the package manager (not npm or yarn)

## Commands

```bash
bun dev        # start dev server
bun run build  # type-check + build
bun run lint   # ESLint
bun run preview # preview production build
```

## Key Files

- `src/App.tsx` — main app logic and passphrase generation
- `src/components/TestSlider.tsx` — word count slider (WIP)
- `src/assets/wordlist.csv` — curated word list (columns: kanji, kana)
- `src/assets/wordlist_rules.md` — rules for which words are allowed in the wordlist
- `src/assets/WordListSorter.py` — utility script for sorting the wordlist

## Wordlist Rules (summary)

See `src/assets/wordlist_rules.md` for the full spec. Key points:
- Words must be immediately understandable from hiragana/romaji alone
- 2–7 hiragana characters (contracted sounds like ぁ count as 0.5)
- Common everyday words only — no jargon, proper nouns, trademarks, or ambiguous homophones
- No offensive, discriminatory, or contextually inappropriate words

## Conventions

- Use MUI components for interactive UI elements; use styled-components for layout/typography overrides
- Keep components in `src/components/`
- Do not use npm or yarn — always use `bun`
- Do not auto-commit changes unless explicitly asked
- Avoid layout shifts (CLS): never conditionally render elements that affect layout. Use `visibility: hidden` instead of conditional rendering to reserve space for elements that appear after user interaction.
