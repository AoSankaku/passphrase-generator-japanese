import { mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import * as wanakana from "wanakana";

import {
  dedupeByKana,
  getProjectPath,
  projectRoot,
  type WordRow,
  writeWordRows,
} from "./common";

type Manifest = {
  id: string;
  fetch?: string;
};

type SourceHandler = (sourceDir: string) => Promise<WordRow[]>;
const annotationPattern = /[()（）〔〕［］〈〉《》「」『』【】]/;

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
    } else if (entry.isFile() && entry.name === "manifest.toml") {
      results.push(fullPath);
    }
  }

  return results.sort();
}

async function loadManifest(manifestPath: string): Promise<Manifest> {
  const content = await Bun.file(manifestPath).text();
  return Bun.TOML.parse(content) as Manifest;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toHiraganaPreservingLongMark(text: string): string {
  return Array.from(text)
    .map((char) => {
      if (char === "ー") {
        return char;
      }
      const code = char.charCodeAt(0);
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCharCode(code - 0x60);
      }
      return char;
    })
    .join("");
}

function normalizeHeadword(text: string): string {
  return text
    .replace(/〔[^〕]*〕/g, "")
    .replace(/［[^］]*］/g, "")
    .replace(/\[[^\]]*]/g, "")
    .replace(/[→←].*$/g, "")
    .replace(/[☆★※＊*]/g, "")
    .trim();
}

function baseReadingFromHeadword(text: string): string {
  const normalized = normalizeHeadword(text)
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[A-Z]+$/g, "")
    .replace(/\s+/g, "");
  return toHiraganaPreservingLongMark(normalized);
}

function hasUnsafeSurfaceSyntax(text: string): boolean {
  return /[A-Za-z0-9!-/:-@[-`{-~]|[△×]|[・･／/,]|→|←/.test(text) || annotationPattern.test(text);
}

function cleanSurface(text: string): string {
  return text.replace(/[△×]/g, "").replace(/\s+/g, "").trim();
}

function deriveSurface(headword: string, orthography?: string): string | null {
  if (orthography) {
    const candidate = cleanSurface(orthography);
    if (candidate && !hasUnsafeSurfaceSyntax(candidate)) {
      return candidate;
    }
  }

  const normalized = normalizeHeadword(headword);
  const parenMatch = normalized.match(/^[^()（）]+[（(]([^()（）]+)[）)]$/);
  if (parenMatch) {
    const candidate = cleanSurface(parenMatch[1]);
    if (candidate && !hasUnsafeSurfaceSyntax(candidate)) {
      return candidate;
    }
  }

  const base = normalized
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[A-Z]+$/g, "")
    .trim();
  if (!base || hasUnsafeSurfaceSyntax(base)) {
    return null;
  }
  return base;
}

function toCandidateRow(headword: string, orthography?: string): WordRow | null {
  const kana = baseReadingFromHeadword(headword);
  if (!kana || !/^[ぁ-ゖー]+$/.test(kana) || !/[ぁ-ゖ]/.test(kana)) {
    return null;
  }

  const derivedSurface = deriveSurface(headword, orthography);
  if (!derivedSurface && (annotationPattern.test(headword) || annotationPattern.test(orthography ?? ""))) {
    return null;
  }

  const surface = derivedSurface ?? wanakana.toKatakana(kana);
  if (!surface) {
    return null;
  }

  return [surface, kana];
}

function isNounLikePartOfSpeech(pos: string): boolean {
  return pos.startsWith("名");
}

function hasDiscardAnnotation(orthography: string): boolean {
  return /人名|固/.test(orthography) || annotationPattern.test(orthography);
}

async function loadShiftJisCsv(path: string): Promise<string[][]> {
  const bytes = await Bun.file(path).bytes();
  const text = new TextDecoder("shift_jis").decode(bytes);
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(","));
}

async function loadUtf8Csv(path: string): Promise<string[][]> {
  const text = await Bun.file(path).text();
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(","));
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipText(zipPath: string, entryPath: string): Promise<string> {
  const bytes = await Bun.file(zipPath).bytes();
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;

  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (readUint32LE(bytes, offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error(`zip end-of-central-directory not found: ${zipPath}`);
  }

  const centralDirectoryOffset = readUint32LE(bytes, eocdOffset + 16);
  const totalEntries = readUint16LE(bytes, eocdOffset + 10);
  let offset = centralDirectoryOffset;
  const decoder = new TextDecoder();

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUint32LE(bytes, offset) !== 0x02014b50) {
      throw new Error(`invalid central directory header in ${zipPath}`);
    }

    const compressionMethod = readUint16LE(bytes, offset + 10);
    const compressedSize = readUint32LE(bytes, offset + 20);
    const fileNameLength = readUint16LE(bytes, offset + 28);
    const extraFieldLength = readUint16LE(bytes, offset + 30);
    const fileCommentLength = readUint16LE(bytes, offset + 32);
    const localHeaderOffset = readUint32LE(bytes, offset + 42);
    const fileName = decoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));

    if (fileName === entryPath) {
      if (readUint32LE(bytes, localHeaderOffset) !== 0x04034b50) {
        throw new Error(`invalid local header for ${entryPath} in ${zipPath}`);
      }

      const localFileNameLength = readUint16LE(bytes, localHeaderOffset + 26);
      const localExtraFieldLength = readUint16LE(bytes, localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
      const compressedData = bytes.slice(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) {
        return decoder.decode(compressedData);
      }
      if (compressionMethod === 8) {
        return decoder.decode(await inflateRaw(compressedData));
      }

      throw new Error(
        `unsupported zip compression method ${compressionMethod} for ${entryPath} in ${zipPath}`,
      );
    }

    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  throw new Error(`zip entry not found: ${entryPath} in ${zipPath}`);
}

function parseSharedStrings(xml: string): string[] {
  return [...xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1].replace(/<rPh[\s\S]*?<\/rPh>/g, "").matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
      .map((part) => decodeXml(part[1]))
      .join(""),
  );
}

function parseSheetRows(xml: string, sharedStrings: string[]): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = rowMatch[1];
    const row: Record<string, string> = {};

    for (const cellMatch of cells.matchAll(/<c\b[^>]*r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const column = cellMatch[1];
      const attrs = cellMatch[2];
      const inner = cellMatch[3];
      const rawValue = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
      if (!rawValue) {
        continue;
      }
      row[column] = attrs.includes('t="s"')
        ? sharedStrings[Number(rawValue)] ?? ""
        : decodeXml(rawValue);
    }

    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }

  return rows;
}

async function normalizeNinjalBasic2009(sourceDir: string): Promise<WordRow[]> {
  const rawPath = join(sourceDir, "raw", "rokusyutaisyo.csv");
  const rows = await loadShiftJisCsv(rawPath);
  const header = rows.shift();
  if (!header || header[1] !== "見出し" || header[2] !== "表記") {
    throw new Error("unexpected columns in rokusyutaisyo.csv");
  }

  return dedupeByKana(
    rows
      .filter((row) => isNounLikePartOfSpeech(row[3] ?? ""))
      .filter((row) => !hasDiscardAnnotation(row[2] ?? ""))
      .map((row) => toCandidateRow(row[1] ?? "", row[2] ?? ""))
      .filter((row): row is WordRow => row !== null),
  );
}

async function normalizeEstatRegionCodes(sourceDir: string): Promise<WordRow[]> {
  const rawPath = join(sourceDir, "raw", "standard-area-codes.csv");
  const rows = await loadUtf8Csv(rawPath);
  const header = rows.shift();
  if (!header || header[1] !== "NAME" || header[2] !== "KANA") {
    throw new Error("unexpected columns in standard-area-codes.csv");
  }

  return dedupeByKana(
    rows
      .map((row) => {
        const surface = (row[1] ?? "").trim();
        const kana = toHiraganaPreservingLongMark((row[2] ?? "").trim());
        if (!surface || !/^[ぁ-ゖー]+$/.test(kana)) {
          return null;
        }
        return [surface, kana] as WordRow;
      })
      .filter((row): row is WordRow => row !== null),
  );
}

async function normalizeEducationalWorkbook(zipPath: string, headwordColumn: string) {
  const sharedStrings = parseSharedStrings(await unzipText(zipPath, "xl/sharedStrings.xml"));
  const sheetRows = parseSheetRows(
    await unzipText(zipPath, "xl/worksheets/sheet1.xml"),
    sharedStrings,
  );

  return sheetRows
    .slice(1)
    .map((row) => toCandidateRow(row[headwordColumn] ?? ""))
    .filter((row): row is WordRow => row !== null);
}

async function normalizeNinjalEducational1984(sourceDir: string): Promise<WordRow[]> {
  const rawDir = join(sourceDir, "raw");
  const rows = [
    ...(await normalizeEducationalWorkbook(join(rawDir, "2_nihongokyoiku01.xlsx"), "C")),
    ...(await normalizeEducationalWorkbook(join(rawDir, "2_nihongokyoiku02.xlsx"), "F")),
  ];
  return dedupeByKana(rows);
}

const sourceHandlers: Record<string, SourceHandler> = {
  "ninjal-basic-vocab-2009": normalizeNinjalBasic2009,
  "ninjal-educational-vocab-1984": normalizeNinjalEducational1984,
  "estat-region-codes": normalizeEstatRegionCodes,
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
      console.log(`${manifest.id}\t${sourceHandlers[manifest.id] ? "auto" : "manual"}`);
    }
    return;
  }

  for (const { manifestPath, manifest } of selected) {
    const handler = sourceHandlers[manifest.id];
    if (!handler) {
      console.log(`skip ${manifest.id}: normalization is not implemented`);
      continue;
    }

    const sourceDir = dirname(manifestPath);
    const rows = await handler(sourceDir);
    const outputPath = join(
      projectRoot,
      "wordlists",
      "20_working",
      "candidates",
      `${manifest.id}.csv`,
    );
    await mkdir(dirname(outputPath), { recursive: true });
    await writeWordRows(outputPath, rows);
    console.log(
      `${manifest.id}: wrote ${rows.length} row(s) to ${outputPath.replace(`${projectRoot}/`, "")}`,
    );
  }
}

await main();
