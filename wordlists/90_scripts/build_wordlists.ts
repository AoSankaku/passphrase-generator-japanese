import { join } from "node:path";

import {
  dedupeByKana,
  getBaseWordlistSources,
  getProjectPath,
  getSetDirectories,
  listCsvFiles,
  loadConfig,
  readWordRows,
  writeWordRows,
} from "./common";

async function buildSet(sourcePath: string, outputPath: string) {
  const rows = dedupeByKana(await readWordRows(sourcePath));
  await writeWordRows(outputPath, rows);
  console.log(outputPath.replace(`${getProjectPath("")}/`, ""));
}

async function buildCombinedSet(sourcePaths: string[], outputPath: string) {
  const rows = dedupeByKana(
    (await Promise.all(sourcePaths.map((sourcePath) => readWordRows(sourcePath))))
      .flat(),
  );
  await writeWordRows(outputPath, rows);
  console.log(outputPath.replace(`${getProjectPath("")}/`, ""));
}

async function main() {
  const config = await loadConfig();
  const buildRoot = getProjectPath(String(config.build_root));

  await buildCombinedSet(
    await getBaseWordlistSources(config),
    join(buildRoot, "active", "base.csv"),
  );

  for (const [category, relativeDir] of getSetDirectories(config)) {
    const dirPath = getProjectPath(relativeDir);
    const files = await listCsvFiles(dirPath);
    for (const filePath of files) {
      const outputPath = join(
        buildRoot,
        "active",
        `${category}-${filePath.split(/[/\\]/).pop() ?? "unknown.csv"}`,
      );
      await buildSet(filePath, outputPath);
    }
  }
}

await main();
