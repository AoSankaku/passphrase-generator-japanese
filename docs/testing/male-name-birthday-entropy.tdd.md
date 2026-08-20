# 男性名＋誕生日の単語エントロピー例 — TDD evidence

## Source and user journey

No plan file was supplied. The journey was derived from the request:

- As a visitor reviewing the safety-level explanation, I want to see a randomly selected male-name-and-birthday password with its estimated choice-based entropy so that I can compare it with generated passphrases.

## Task report

| Behavior | Validation | Result | Guarantee |
|---|---|---|---|
| Male-name-and-birthday entropy | `bun test tests/passwordExample.test.ts` | PASS | Entropy is calculated from the male-name candidate count and 16,802 valid birthday choices. |
| Random male-name selection | `bun test tests/passwordExample.test.ts` | PASS | Boundary random values select valid first/last entries and an empty list is rejected. |
| Random birthday generation | `bun test tests/passwordExample.test.ts` | PASS | Dates are valid, zero-padded `YYYYMMDD` values between 1960-01-01 and 2005-12-31. |
| Inline entropy emphasis | `bun test tests/EntropyDisplay.test.tsx` | PASS | The entropy value renders as a bold `<span>` rather than a block-level paragraph. |
| Production integration | `bun run build` | PASS | The React and TypeScript production build accepts the example data and modal rendering. |

## RED / GREEN evidence

- RED: `bun test src/lib/passwordExample.test.ts` failed with `Cannot find module './passwordExample'`, proving that the newly specified helper behavior did not exist.
- RED (word-entropy correction): `bun test tests/passwordExample.test.ts` failed with `Export named 'calculateMaleNameBirthdayEntropy' not found`, proving the example still lacked the choice-based calculation.
- RED (inline typography): `bun test tests/EntropyDisplay.test.tsx` failed with `Export named 'InlineEntropyValue' not found`; GREEN passed after rendering the bold value as a `<span>`.
- GREEN: `bun test tests/passwordExample.test.ts --coverage` passed all tests after implementation.
- Checkpoint commits were not created because project instructions prohibit automatic commits.

## Coverage and known gaps

- Utility coverage command: `bun test tests/passwordExample.test.ts --coverage`.
- Result before the final edge-case additions: 100% functions and 92.59% lines; the final verification reruns and supersedes this result.
- The modal placement is type-checked and production-built; the repository has no component-test or browser-test setup.
