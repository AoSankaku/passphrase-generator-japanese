import {
  getBaseWordlistSources,
  getProjectPath,
  getSetDirectories,
  listCsvFiles,
  loadConfig,
} from "./common";
import { validateRows } from "./validate_wordlist";

async function main() {
  const config = await loadConfig();
  const targets: string[] = [...(await getBaseWordlistSources(config))];

  for (const [, relativeDir] of getSetDirectories(config)) {
    const dirPath = getProjectPath(relativeDir);
    targets.push(...(await listCsvFiles(dirPath)));
  }

  const allErrors: string[] = [];
  for (const path of targets) {
    allErrors.push(...(await validateRows(path)));
  }

  if (allErrors.length > 0) {
    allErrors.forEach((error) => console.log(error));
    console.log(`validation failed: ${allErrors.length} issue(s)`);
    process.exit(1);
  }

  console.log(`validation passed: ${targets.length} file(s)`);
}

await main();
