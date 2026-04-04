import { readFile } from "node:fs/promises";

import { compareWordRows, isHiragana, kanaUnits, sortWordRows, type WordRow } from "./common";

const asciiPattern = /[A-Za-z0-9]/;
const symbolPattern = /[!-/:-@[-`{-~]/;

export type FailedValidationRow = {
  surface: string;
  kana: string;
  reasons: string[];
};

export type ValidationResult = {
  validRows: WordRow[];
  failedRows: FailedValidationRow[];
};

function parseCsvLine(line: string): { surface: string; kana: string; reasons: string[] } {
  const parts = line.split(",");
  if (parts.length !== 2) {
    return {
      surface: parts[0]?.trim() ?? "",
      kana: parts.slice(1).join(",").trim(),
      reasons: [`expected_2_columns:${parts.length}`],
    };
  }

  const surface = parts[0].trim();
  const kana = parts[1].trim();
  const reasons: string[] = [];

  if (!surface) {
    reasons.push("blank_surface");
  }
  if (!kana) {
    reasons.push("blank_kana");
  }

  return { surface, kana, reasons };
}

function getRowReasons(row: WordRow): string[] {
  const [surface, kana] = row;
  const reasons: string[] = [];
  const units = kanaUnits(kana);

  if (units < 2 || units > 7) {
    reasons.push(`kana_length_out_of_range:${units}`);
  }
  if (!isHiragana(kana)) {
    reasons.push("kana_not_hiragana");
  }
  if (asciiPattern.test(surface) || asciiPattern.test(kana)) {
    reasons.push("ascii_detected");
  }
  if (symbolPattern.test(surface)) {
    reasons.push("symbol_detected");
  }

  return reasons;
}

export async function validateRows(csvPath: string): Promise<ValidationResult> {
  const content = await readFile(csvPath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const validRows: WordRow[] = [];
  const failedRows: FailedValidationRow[] = [];
  const seenRows = new Set<string>();
  const seenKana = new Map<string, string>();

  for (const line of lines) {
    const parsed = parseCsvLine(line);
    if (parsed.reasons.length > 0) {
      failedRows.push(parsed);
      continue;
    }

    const row: WordRow = [parsed.surface, parsed.kana];
    const reasons = getRowReasons(row);
    const rowKey = `${parsed.surface}\u0000${parsed.kana}`;

    if (seenRows.has(rowKey)) {
      reasons.push("duplicate_row");
    }

    const previousSurface = seenKana.get(parsed.kana);
    if (previousSurface) {
      reasons.push(
        previousSurface === parsed.surface
          ? "duplicate_row"
          : `duplicate_kana:${previousSurface}`,
      );
    }

    if (reasons.length > 0) {
      failedRows.push({
        surface: parsed.surface,
        kana: parsed.kana,
        reasons,
      });
      continue;
    }

    seenRows.add(rowKey);
    seenKana.set(parsed.kana, parsed.surface);
    validRows.push(row);
  }

  return {
    validRows: sortWordRows(validRows),
    failedRows: [...failedRows].sort((a, b) =>
      compareWordRows([a.surface, a.kana], [b.surface, b.kana]),
    ),
  };
}
