import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  getProjectPath,
  isGeneralCategory,
  isGeographyCategory,
  isHiragana,
  kanaUnits,
  listCsvFiles,
  readWordRows,
  type WordRow,
  writeWordRows,
} from "./common";

type Manifest = {
  id: string;
  group: string;
};

type SeenKanaEntry = {
  sourceId: string;
  group: string;
};

type GeneratedReviewRow = {
  surface: string;
  kana: string;
  sourceId: string;
  reason: string;
  notes: string;
};

type GeneratedRejectRow = GeneratedReviewRow;

type TriageConfig = {
  review_all_sources?: string[];
  review_surface_contains?: string[];
  review_kana_contains?: string[];
};

type TriageArgs = {
  listOnly: boolean;
  sourceIds: Set<string>;
};

const asciiPattern = /[A-Za-z0-9]/;
const symbolPattern = /[!-/:-@[-`{-~]/;

function parseArgs(): TriageArgs {
  const args = Bun.argv.slice(2);
  const sourceIds = new Set<string>();
  let listOnly = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--list") {
      listOnly = true;
      continue;
    }
    if (arg === "--source") {
      const next = args[index + 1];
      if (!next) {
        throw new Error("--source requires a source id");
      }
      sourceIds.add(next);
      index += 1;
      continue;
    }
    if (arg.startsWith("--source=")) {
      sourceIds.add(arg.slice("--source=".length));
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }

  return { listOnly, sourceIds };
}

async function listManifestPaths(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listManifestPaths(fullPath)));
    } else if (entry.isFile() && entry.name === "manifest.toml") {
      results.push(fullPath);
    }
  }

  return results.sort();
}

async function loadManifestMap(): Promise<Map<string, Manifest>> {
  const manifestPaths = await listManifestPaths(getProjectPath("wordlists", "10_sources"));
  const manifests = await Promise.all(
    manifestPaths.map(async (manifestPath) => {
      const content = await Bun.file(manifestPath).text();
      const manifest = Bun.TOML.parse(content) as Manifest;
      return [manifest.id, manifest] as const;
    }),
  );
  return new Map(manifests);
}

async function loadTriageConfig(): Promise<TriageConfig> {
  const content = await readFile(getProjectPath("wordlists", "triage.toml"), "utf8");
  return Bun.TOML.parse(content) as TriageConfig;
}

function toGeneratedCsv(
  rows: GeneratedReviewRow[] | GeneratedRejectRow[],
): string {
  const header = "surface,kana,source_id,reason,notes";
  const body = rows.map((row) =>
    [row.surface, row.kana, row.sourceId, row.reason, row.notes]
      .map((value) => value.replaceAll('"', '""'))
      .map((value) => `"${value}"`)
      .join(","),
  );
  return `${[header, ...body].join("\n")}\n`;
}

function reviewReasonFromContent(
  row: WordRow,
  config: TriageConfig,
): string | null {
  const [surface, kana] = row;
  const surfaceHit = config.review_surface_contains?.find((pattern) =>
    surface.includes(pattern),
  );
  if (surfaceHit) {
    return `sensitive_surface:${surfaceHit}`;
  }

  const kanaHit = config.review_kana_contains?.find((pattern) => kana.includes(pattern));
  if (kanaHit) {
    return `sensitive_kana:${kanaHit}`;
  }

  return null;
}

function isNotableGeography(surface: string): boolean {
  if (surface === "全国市部" || surface === "全国郡部") {
    return true;
  }
  if (surface.endsWith("大都市圏") || surface.endsWith("都市圏")) {
    return true;
  }
  return false;
}

function rejectReason(row: WordRow): string | null {
  const [surface, kana] = row;
  const units = kanaUnits(kana);
  if (units < 2 || units > 7) {
    return "kana_length_out_of_range";
  }
  if (!isHiragana(kana)) {
    return "kana_not_hiragana";
  }
  if (asciiPattern.test(surface) || asciiPattern.test(kana)) {
    return "ascii_detected";
  }
  if (symbolPattern.test(surface)) {
    return "symbol_detected";
  }
  return null;
}

async function clearPromoteReadyDirectory(directory: string) {
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".csv"))
      .map((entry) => rm(join(directory, entry.name))),
  );
}

async function main() {
  const { listOnly, sourceIds } = parseArgs();
  const config = await loadTriageConfig();
  const manifestMap = await loadManifestMap();
  const candidatesDir = getProjectPath("wordlists", "20_working", "candidates");
  const promoteReadyDir = getProjectPath("wordlists", "20_working", "promote_ready");
  const candidatePaths = await listCsvFiles(candidatesDir);
  const selectedPaths = candidatePaths.filter((candidatePath) => {
    const sourceId = candidatePath.split(/[/\\]/).pop()?.replace(/\.csv$/, "") ?? "";
    return sourceIds.size === 0 ? true : sourceIds.has(sourceId);
  });

  if (listOnly) {
    selectedPaths.forEach((candidatePath) => {
      const sourceId = candidatePath.split(/[/\\]/).pop()?.replace(/\.csv$/, "") ?? "";
      const group = manifestMap.get(sourceId)?.group ?? "unknown";
      console.log(`${sourceId}\t${group}`);
    });
    return;
  }

  await clearPromoteReadyDirectory(promoteReadyDir);

  const generatedReviewRows: GeneratedReviewRow[] = [];
  const generatedRejectRows: GeneratedRejectRow[] = [];
  const seenKana = new Map<string, SeenKanaEntry>();

  for (const candidatePath of selectedPaths) {
    const sourceId = candidatePath.split(/[/\\]/).pop()?.replace(/\.csv$/, "") ?? "";
    const manifest = manifestMap.get(sourceId);
    const rows = await readWordRows(candidatePath);
    const promoteReadyRows: WordRow[] = [];

    for (const row of rows) {
      const [surface, kana] = row;
      const rejection = rejectReason(row);
      if (rejection) {
        generatedRejectRows.push({
          surface,
          kana,
          sourceId,
          reason: rejection,
          notes: "",
        });
        continue;
      }

      const previousSource = seenKana.get(kana);
      if (
        previousSource &&
        previousSource.sourceId !== sourceId &&
        !isGeographyCategory(previousSource.group) &&
        !isGeographyCategory(manifest?.group)
      ) {
        generatedReviewRows.push({
          surface,
          kana,
          sourceId,
          reason: "duplicate_kana_cross_source",
          notes: `same kana already accepted from ${previousSource.sourceId}`,
        });
        continue;
      }

      if (config.review_all_sources?.includes(sourceId)) {
        generatedReviewRows.push({
          surface,
          kana,
          sourceId,
          reason: "review_all_source",
          notes: "source is configured for manual review",
        });
        continue;
      }

      if (isNotableGeography(surface)) {
        generatedReviewRows.push({
          surface,
          kana,
          sourceId,
          reason: "notable_geography",
          notes: "broad or highly recognizable geography label",
        });
        continue;
      }

      if (
        manifest &&
        !isGeneralCategory(manifest.group) &&
        !isGeographyCategory(manifest.group)
      ) {
        generatedReviewRows.push({
          surface,
          kana,
          sourceId,
          reason: "non_general_source",
          notes: `source group is ${manifest.group}`,
        });
        continue;
      }

      const reviewReason = reviewReasonFromContent(row, config);
      if (reviewReason) {
        generatedReviewRows.push({
          surface,
          kana,
          sourceId,
          reason: reviewReason,
          notes: "",
        });
        continue;
      }

      seenKana.set(kana, {
        sourceId,
        group: manifest?.group ?? "unknown",
      });
      promoteReadyRows.push(row);
    }

    const outputPath = join(promoteReadyDir, `${sourceId}.csv`);
    if (promoteReadyRows.length > 0) {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeWordRows(outputPath, promoteReadyRows);
    }
    console.log(
      `${sourceId}: promote_ready=${promoteReadyRows.length}`,
    );
  }

  const needsReviewPath = getProjectPath(
    "wordlists",
    "20_working",
    "needs_review.generated.csv",
  );
  const rejectsPath = getProjectPath(
    "wordlists",
    "20_working",
    "rejects.generated.csv",
  );

  await Bun.write(needsReviewPath, toGeneratedCsv(generatedReviewRows));
  await Bun.write(rejectsPath, toGeneratedCsv(generatedRejectRows));

  console.log(`needs_review.generated.csv: ${generatedReviewRows.length}`);
  console.log(`rejects.generated.csv: ${generatedRejectRows.length}`);
}

await main();
