import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export type WordRow = [string, string];
export type CanonicalCategory =
  | "base"
  | "general"
  | "geography"
  | "domain"
  | "morphology";

export const projectRoot = resolve(import.meta.dir, "..", "..");
const smallKana = new Set("ゃゅょぁぃぅぇぉャュョァィゥェォ");
const hiraganaPattern = /^[ぁ-ゖー]+$/;
const categoryAliases = new Map<string, CanonicalCategory>([
  ["base", "base"],
  ["basic", "base"],
  ["基本", "base"],
  ["一般", "general"],
  ["general", "general"],
  ["地名", "geography"],
  ["地域", "geography"],
  ["geography", "geography"],
  ["専門", "domain"],
  ["専門語", "domain"],
  ["分野", "domain"],
  ["domain", "domain"],
  ["形態素", "morphology"],
  ["morphology", "morphology"],
]);

export function getProjectPath(...parts: string[]): string {
  return resolve(projectRoot, ...parts);
}

export async function loadConfig(): Promise<Record<string, unknown>> {
  const configPath = getProjectPath("wordlists", "config.toml");
  const content = await readFile(configPath, "utf8");
  return Bun.TOML.parse(content) as Record<string, unknown>;
}

export async function readWordRows(csvPath: string): Promise<WordRow[]> {
  const content = await readFile(csvPath, "utf8");
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows.map((row, index) => {
    const parts = row.split(",");
    if (parts.length !== 2) {
      throw new Error(`${csvPath}:${index + 1}: expected 2 columns, got ${parts.length}`);
    }
    const surface = parts[0].trim();
    const kana = parts[1].trim();
    if (!surface || !kana) {
      throw new Error(`${csvPath}:${index + 1}: blank value is not allowed`);
    }
    return [surface, kana];
  });
}

export async function writeWordRows(csvPath: string, rows: WordRow[]): Promise<void> {
  await mkdir(dirname(csvPath), { recursive: true });
  const content = rows.map(([surface, kana]) => `${surface},${kana}`).join("\n");
  await writeFile(csvPath, `${content}\n`, "utf8");
}

export function dedupeByKana(rows: WordRow[]): WordRow[] {
  const seenRows = new Set<string>();
  const seenKana = new Set<string>();
  const deduped: WordRow[] = [];

  for (const [surface, kana] of rows) {
    const rowKey = `${surface}\u0000${kana}`;
    if (seenRows.has(rowKey) || seenKana.has(kana)) {
      continue;
    }
    seenRows.add(rowKey);
    seenKana.add(kana);
    deduped.push([surface, kana]);
  }

  return deduped;
}

export function kanaUnits(text: string): number {
  let units = 0;
  for (const char of text) {
    units += smallKana.has(char) ? 0.5 : 1;
  }
  return units;
}

export function isHiragana(text: string): boolean {
  return hiraganaPattern.test(text);
}

export function normalizeCategory(
  value: string | null | undefined,
): CanonicalCategory | undefined {
  if (!value) {
    return undefined;
  }
  return categoryAliases.get(value.trim().toLowerCase());
}

export function isGeographyCategory(value: string | null | undefined): boolean {
  return normalizeCategory(value) === "geography";
}

export function isGeneralCategory(value: string | null | undefined): boolean {
  return normalizeCategory(value) === "general";
}

export function getSetDirectories(config: Record<string, unknown>): Array<[string, string]> {
  const sets = (config.sets ?? {}) as Record<string, string>;
  return Object.entries(sets).map(([category, relativeDir]) => [
    normalizeCategory(category) ?? category,
    relativeDir,
  ]);
}

export async function listCsvFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
    .map((entry) => join(directory, entry.name))
    .sort();
}

export async function getBaseWordlistSources(
  config: Record<string, unknown>,
): Promise<string[]> {
  const sources: string[] = [];
  const seen = new Set<string>();

  const addSource = (path: string) => {
    if (seen.has(path)) {
      return;
    }
    seen.add(path);
    sources.push(path);
  };

  if (typeof config.base_wordlist === "string") {
    addSource(getProjectPath(config.base_wordlist));
  }
  const baseSubsetsDir = config.base_subsets_dir;
  if (typeof baseSubsetsDir === "string") {
    for (const path of await listCsvFiles(getProjectPath(baseSubsetsDir))) {
      addSource(path);
    }
  }
  return sources;
}
