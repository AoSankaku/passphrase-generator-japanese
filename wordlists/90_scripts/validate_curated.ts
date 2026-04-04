import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";

import {
  getBaseWordlistSources,
  getProjectPath,
  getSetDirectories,
  listCsvFiles,
  loadConfig,
  writeWordRows,
} from "./common";
import { validateRows, type FailedValidationRow } from "./validate_wordlist";

function toFailedValidationCsv(rows: FailedValidationRow[]): string {
  const header = "surface,kana,reasons";
  const body = rows.map((row) =>
    [row.surface, row.kana, row.reasons.join("|")]
      .map((value) => value.replaceAll('"', '""'))
      .map((value) => `"${value}"`)
      .join(","),
  );
  return `${[header, ...body].join("\n")}\n`;
}

async function main() {
  const config = await loadConfig();
  const targets: string[] = [...(await getBaseWordlistSources(config))];
  const curatedRoot = getProjectPath(String(config.curated_root));
  const failedValidationRoot = getProjectPath("wordlists", "30_curated", "_failed_validation");

  for (const [, relativeDir] of getSetDirectories(config)) {
    const dirPath = getProjectPath(relativeDir);
    targets.push(...(await listCsvFiles(dirPath)));
  }

  await rm(failedValidationRoot, { recursive: true, force: true });

  let filesWithFailures = 0;
  let failedRowCount = 0;
  for (const path of targets) {
    const { validRows, failedRows } = await validateRows(path);
    await writeWordRows(path, validRows);

    if (failedRows.length === 0) {
      continue;
    }

    filesWithFailures += 1;
    failedRowCount += failedRows.length;
    const relativePath = relative(curatedRoot, path);
    const failedPath = getProjectPath(
      "wordlists",
      "30_curated",
      "_failed_validation",
      relativePath,
    );
    await mkdir(dirname(failedPath), { recursive: true });
    await writeFile(failedPath, toFailedValidationCsv(failedRows), "utf8");
    console.log(`${relativePath}: moved ${failedRows.length} row(s) to _failed_validation`);
  }

  if (filesWithFailures > 0) {
    console.log(
      `validation completed with exclusions: ${failedRowCount} row(s) across ${filesWithFailures} file(s)`,
    );
    return;
  }

  console.log(`validation passed: ${targets.length} file(s)`);
}

await main();
