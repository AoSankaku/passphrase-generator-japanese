export type RomajiStyle = "hepburn" | "nihon" | "kunrei";
export type NStyle = "apostrophe" | "double-n" | "force-nn";

// Nihon-shiki romanization (日本式) — strict phonetic mapping
export const NIHON_MAPPING: Record<string, string> = {
  し: "si",
  しゃ: "sya",
  しゅ: "syu",
  しょ: "syo",
  ち: "ti",
  ちゃ: "tya",
  ちゅ: "tyu",
  ちょ: "tyo",
  つ: "tu",
  ふ: "hu",
  じ: "zi",
  じゃ: "zya",
  じゅ: "zyu",
  じょ: "zyo",
  ぢ: "di",
  ぢゃ: "dya",
  ぢゅ: "dyu",
  ぢょ: "dyo",
  づ: "du",
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
};

// Kunrei-shiki romanization (訓令式) — based on Nihon-shiki with a few merges
export const KUNREI_MAPPING: Record<string, string> = {
  ...NIHON_MAPPING,
  // ふ stays fu (not hu)
  ふ: "fu",
  // ぢ/づ merge with じ/ず
  ぢ: "zi",
  ぢゃ: "zya",
  ぢゅ: "zyu",
  ぢょ: "zyo",
  づ: "zu",
};

export const getToRomajiOptions = (
  style: RomajiStyle,
  nStyle: NStyle,
): { customRomajiMapping?: Record<string, string> } => {
  const base =
    style === "nihon"
      ? NIHON_MAPPING
      : style === "kunrei"
        ? KUNREI_MAPPING
        : {};
  // force-nn: inject ん→nn into the mapping so consonant-context ん (e.g. ぼんご→bonngo)
  // is doubled. Vowel/y-context n' is caught by applyNStyle post-processing.
  const nOverride = nStyle === "force-nn" ? { ん: "nn" } : {};
  const combined = { ...base, ...nOverride };
  return Object.keys(combined).length > 0
    ? { customRomajiMapping: combined }
    : {};
};

export const applyNStyle = (romaji: string, nStyle: NStyle): string => {
  if (nStyle === "double-n" || nStyle === "force-nn")
    return romaji.replace(/n'/g, "nn");
  return romaji;
};
