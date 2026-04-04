import { mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

import { getProjectPath, projectRoot } from "./common";

type Manifest = {
  id: string;
  name: string;
  group: string;
  url: string;
  license: string;
  usage: string;
  notes?: string;
  fetch?: string;
  license_checked_at?: string;
  license_source?: string;
  download_urls?: string[];
};

type DownloadResult = {
  relativePath: string;
  sourceUrl: string;
};

type SourceHandler = (manifest: Manifest, sourceDir: string) => Promise<DownloadResult[]>;

function parseArgs() {
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
      continue;
    }
    if (entry.isFile() && entry.name === "manifest.toml") {
      results.push(fullPath);
    }
  }

  return results.sort();
}

async function loadManifest(manifestPath: string): Promise<Manifest> {
  const content = await Bun.file(manifestPath).text();
  return Bun.TOML.parse(content) as Manifest;
}

async function downloadToRaw(sourceDir: string, sourceUrl: string): Promise<DownloadResult> {
  const rawDir = join(sourceDir, "raw");
  await mkdir(rawDir, { recursive: true });

  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "japanese-passphrase-generator/wordlists-fetcher",
    },
  });
  if (!response.ok) {
    throw new Error(`download failed: ${sourceUrl} (${response.status} ${response.statusText})`);
  }

  const targetPath = join(rawDir, basename(new URL(sourceUrl).pathname));
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(targetPath, new Uint8Array(arrayBuffer));

  return {
    relativePath: targetPath.replace(`${projectRoot}/`, ""),
    sourceUrl,
  };
}

async function fetchStaticDownloads(
  manifest: Manifest,
  sourceDir: string,
): Promise<DownloadResult[]> {
  if (!Array.isArray(manifest.download_urls) || manifest.download_urls.length === 0) {
    throw new Error(`${manifest.id}: download_urls is empty`);
  }

  const results: DownloadResult[] = [];
  for (const sourceUrl of manifest.download_urls) {
    results.push(await downloadToRaw(sourceDir, sourceUrl));
  }
  return results;
}

async function fetchEstatRegionCodes(
  manifest: Manifest,
  sourceDir: string,
): Promise<DownloadResult[]> {
  const rawDir = join(sourceDir, "raw");
  await mkdir(rawDir, { recursive: true });

  const query = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX sacs: <http://data.e-stat.go.jp/lod/terms/sacs#>

SELECT ?code ?name ?kana
WHERE {
  ?s a sacs:StandardAreaCode ;
     dcterms:identifier ?code ;
     rdfs:label ?name ;
     rdfs:label ?kana .
  FILTER(LANG(?name) = "ja")
  FILTER(LANG(?kana) = "ja-hrkt")
}
ORDER BY ?code
`.trim();

  const endpoint = "https://data.e-stat.go.jp/lod/sparql/alldata/query";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "text/csv",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "japanese-passphrase-generator/wordlists-fetcher",
    },
    body: new URLSearchParams({ query }).toString(),
  });
  if (!response.ok) {
    throw new Error(
      `${manifest.id}: SPARQL query failed (${response.status} ${response.statusText})`,
    );
  }

  const csvPath = join(rawDir, "standard-area-codes.csv");
  await writeFile(csvPath, await response.text(), "utf8");

  return [
    {
      relativePath: csvPath.replace(`${projectRoot}/`, ""),
      sourceUrl: endpoint,
    },
  ];
}

const sourceHandlers: Record<string, SourceHandler> = {
  "ninjal-basic-vocab-2009": fetchStaticDownloads,
  "ninjal-educational-vocab-1984": fetchStaticDownloads,
  "estat-region-codes": fetchEstatRegionCodes,
};

async function main() {
  const { listOnly, sourceIds } = parseArgs();
  const manifestsRoot = getProjectPath("wordlists", "10_sources");
  const manifestPaths = await listManifestPaths(manifestsRoot);
  const manifests = await Promise.all(
    manifestPaths.map(async (manifestPath) => ({
      manifestPath,
      manifest: await loadManifest(manifestPath),
    })),
  );

  const selected = manifests.filter(({ manifest }) =>
    sourceIds.size === 0 ? true : sourceIds.has(manifest.id),
  );

  if (selected.length === 0) {
    throw new Error("no matching source manifests found");
  }

  if (listOnly) {
    for (const { manifest } of selected) {
      console.log(
        `${manifest.id}\t${manifest.fetch ?? "manual"}\t${manifest.license}\t${manifest.name}`,
      );
    }
    return;
  }

  for (const { manifestPath, manifest } of selected) {
    const sourceDir = dirname(manifestPath);
    const handler = sourceHandlers[manifest.id];

    if ((manifest.fetch ?? "manual") !== "auto") {
      console.log(`skip ${manifest.id}: fetch=${manifest.fetch ?? "manual"}`);
      continue;
    }
    if (!handler) {
      throw new Error(`${manifest.id}: no fetch handler is implemented`);
    }

    const results = await handler(manifest, sourceDir);
    console.log(`${manifest.id}: fetched ${results.length} file(s)`);
    for (const result of results) {
      console.log(`  ${result.relativePath} <- ${result.sourceUrl}`);
    }
  }
}

await main();
