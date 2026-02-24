import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export type GeneratedConfig = {
  wordCount: number;
  numberEnabled: boolean;
  digitCount: number;
};

type EntropyDisplayProps = {
  passPhrase: string;
  wordlistSize: number;
  separator: string;
  generatedConfig: GeneratedConfig | null;
};

type SafetyLevel = {
  label: string;
  color: "error" | "warning" | "success";
};

const getSafetyLevel = (bits: number): SafetyLevel => {
  if (bits < 56) return { label: "危険", color: "error" };
  if (bits < 80) return { label: "普通", color: "warning" };
  return { label: "安全", color: "success" };
};

const getHint = (color: SafetyLevel["color"]): string => {
  if (color === "error")
    return "単語数を増やすか、数字スロットを追加してみてください。";
  if (color === "warning")
    return "単語数か数字スロットをもう少し増やすともっと安全です。";
  return "";
};

const EntropyDisplay: React.FC<EntropyDisplayProps> = ({
  passPhrase,
  wordlistSize,
  separator,
  generatedConfig,
}) => {
  const hasGenerated = generatedConfig !== null;
  const {
    wordCount = 0,
    numberEnabled = false,
    digitCount = 0,
  } = generatedConfig ?? {};

  const charsetSize =
    26 + (separator.length > 0 ? 1 : 0) + (numberEnabled ? 10 : 0);
  const rawEntropy = passPhrase.length * Math.log2(charsetSize);
  const wordEntropy =
    wordlistSize > 1 ? wordCount * Math.log2(wordlistSize) : 0;
  const digitEntropy = numberEnabled ? digitCount * Math.log2(10) : 0;
  const realEntropy = wordEntropy + digitEntropy;
  const safety = getSafetyLevel(realEntropy);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        my: 2,
      }}
    >
      <Chip
        label={safety.label}
        color={safety.color}
        size="small"
        sx={{ visibility: hasGenerated ? "visible" : "hidden" }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          visibility:
            hasGenerated && safety.color !== "success" ? "visible" : "hidden",
        }}
      >
        {getHint(safety.color)}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          文字エントロピー:{" "}
          {hasGenerated ? `${rawEntropy.toFixed(1)} bits` : "–"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          単語エントロピー:{" "}
          {hasGenerated ? `${realEntropy.toFixed(1)} bits` : "–"}
        </Typography>
      </Box>
    </Box>
  );
};

export default EntropyDisplay;
