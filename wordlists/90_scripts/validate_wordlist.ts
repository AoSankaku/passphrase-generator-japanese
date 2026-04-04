import { isHiragana, kanaUnits, readWordRows } from "./common";

const asciiPattern = /[A-Za-z0-9]/;
const symbolPattern = /[!-/:-@[-`{-~]/;

export async function validateRows(csvPath: string): Promise<string[]> {
  const rows = await readWordRows(csvPath);
  const errors: string[] = [];
  const seenKana = new Map<string, string>();

  rows.forEach(([surface, kana], index) => {
    const lineNo = index + 1;
    const units = kanaUnits(kana);
    if (units < 2 || units > 7) {
      errors.push(`${csvPath}:${lineNo}: kana length out of range: ${surface},${kana} (${units})`);
    }
    if (!isHiragana(kana)) {
      errors.push(`${csvPath}:${lineNo}: kana must be hiragana only: ${surface},${kana}`);
    }
    if (asciiPattern.test(surface) || asciiPattern.test(kana)) {
      errors.push(`${csvPath}:${lineNo}: ASCII is not allowed: ${surface},${kana}`);
    }
    if (symbolPattern.test(surface)) {
      errors.push(`${csvPath}:${lineNo}: symbol detected in surface: ${surface},${kana}`);
    }
    const previous = seenKana.get(kana);
    if (previous && previous !== surface) {
      errors.push(`${csvPath}:${lineNo}: duplicate kana '${kana}' for '${previous}' and '${surface}'`);
    } else {
      seenKana.set(kana, surface);
    }
  });

  return errors;
}
