import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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

const LEVELS: {
  color: SafetyLevel["color"];
  label: string;
  range: string;
  description: string;
}[] = [
    {
      color: "error",
      label: "危険",
      range: "56 bits未満",
      description:
        "オフライン攻撃（流出したデータベースへの総当たり攻撃）に対して脆弱です。現代のGPUを使えば数時間〜数日で解読される可能性があります。オンラインサービスでは即座にアカウントがロックされるため実質的には安全ですが、パスワードが漏洩した場合に備えて単語数や数字スロットを増やすことを強くお勧めします。",
    },
    {
      color: "warning",
      label: "普通",
      range: "56〜80 bits",
      description:
        "ログイン試行が制限されるオンラインサービスには十分な強度です。ただし、オフライン攻撃に対しては将来的なハードウェアの進化によって危険になる可能性があります。重要なアカウントには単語数を増やすことをお勧めします。",
    },
    {
      color: "success",
      label: "安全",
      range: "80 bits以上",
      description:
        "オンライン・オフライン両方の攻撃に対して十分な強度です。現在および近い将来の技術では、総当たり攻撃による解読は現実的に不可能です。重要なアカウントにも安心して使用できます。",
    },
  ];

const EntropyDisplay: React.FC<EntropyDisplayProps> = ({
  passPhrase,
  wordlistSize,
  separator,
  generatedConfig,
}) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  const hasGenerated = generatedConfig !== null;
  const {
    wordCount = 0,
    numberEnabled = false,
    digitCount = 0,
  } = generatedConfig ?? {};

  const charset = new Set([
    ..."abcdefghijklmnopqrstuvwxyz",
    ...(numberEnabled ? "0123456789" : ""),
    ...separator,
  ]);
  const rawEntropy = passPhrase.length * Math.log2(charset.size);
  const wordEntropy =
    wordlistSize > 1 ? wordCount * Math.log2(wordlistSize) : 0;
  const digitEntropy = numberEnabled ? digitCount * Math.log2(10) : 0;
  const realEntropy = wordEntropy + digitEntropy;
  const safety = getSafetyLevel(realEntropy);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          my: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            visibility: hasGenerated ? "visible" : "hidden",
          }}
        >
          <Chip label={safety.label} color={safety.color} size="small" />
          <IconButton
            size="small"
            onClick={() => setModalOpen(true)}
            aria-label="安全性の説明"
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
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
            alignItems: "center",
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

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>安全性レベルについて</DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: "flex", gap: 4, marginBottom: 2, alignItems: "flex-start" }}
          >
            「文字エントロピー」はパスワードがランダムな文字であると仮定した場合の強固さ、「単語エントロピー」はパスワードが単語の組み合わせであり、攻撃者がこのサイトを知っていると仮定した場合の強固さです。
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {LEVELS.map(({ color, label, range, description }) => (
              <Box
                key={color}
                sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
              >
                <Chip
                  label={label}
                  color={color}
                  size="small"
                  sx={{ mt: 0.5, flexShrink: 0 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {range}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EntropyDisplay;
