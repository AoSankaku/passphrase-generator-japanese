import "./App.css";
import styled from "styled-components";
import {
  Button,
  IconButton,
  Paper,
  Divider,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Papa from "papaparse";
import wordlist_csv from "./assets/wordlist.csv?raw";
import * as wanakana from "wanakana";
import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import WordCountSlider from "./components/WordCountSlider";
import Twemoji from "./components/Twemoji";
import EntropyDisplay, { GeneratedConfig } from "./components/EntropyDisplay";
import NumberSlotControl from "./components/NumberSlotControl";
import SeparatorControl from "./components/SeparatorControl";
import RomajiStyleControl from "./components/RomajiStyleControl";
import NStyleControl from "./components/NStyleControl";
import QandA from "./components/QandA";
import Footer from "./components/Footer";
import {
  getToRomajiOptions,
  applyNStyle,
  type RomajiStyle,
  type NStyle,
} from "./lib/romajiMappings";
import { useLocalStorage } from "./hooks/useLocalStorage";

function CopyButton({
  passPhrase,
  disabled,
}: {
  passPhrase: string;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(passPhrase);
      setOpen(true);
    } catch (err) {
      console.error("コピーエラー:", err);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="contained"
        startIcon={<ContentCopyIcon />}
        size="large"
        disabled={disabled}
      >
        コピー
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpen(false)}>
          コピーしました！
        </Alert>
      </Snackbar>
    </>
  );
}

const App = () => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") ?? "light",
  );
  const theme = useMemo(
    () => createTheme({ palette: { mode: themeMode } }),
    [themeMode],
  );

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const [wordlist, setWordlist] = useState<string[][]>([]);
  const [words, setWords] = useState<{ kana: string[]; kanji: string[] }>({
    kana: ["にほんご", "ぱすわーど", "かわりに", "なるよ"],
    kanji: ["日本語", "パスワード", "代わりに", "なるよ"],
  });
  const [romajiStyle, setRomajiStyle] = useLocalStorage<RomajiStyle>(
    "romajiStyle",
    "hepburn",
  );
  const [nStyle, setNStyle] = useLocalStorage<NStyle>("nStyle", "apostrophe");
  const [separator, setSeparator] = useLocalStorage("separator", ".");
  const [wordCount, setWordCount] = useLocalStorage("wordCount", 4);
  const [numberEnabled, setNumberEnabled] = useLocalStorage(
    "numberEnabled",
    true,
  );
  const [numberPosition, setNumberPosition] = useLocalStorage<"start" | "end">(
    "numberPosition",
    "end",
  );
  const [digitCount, setDigitCount] = useLocalStorage("digitCount", 4);
  const [generatedConfig, setGeneratedConfig] =
    useState<GeneratedConfig | null>(null);

  const needsRegeneration =
    generatedConfig === null ||
    generatedConfig.wordCount !== wordCount ||
    generatedConfig.numberEnabled !== numberEnabled ||
    generatedConfig.digitCount !== digitCount ||
    generatedConfig.numberPosition !== numberPosition;

  // Derived — updates instantly when separator, romajiStyle, or nStyle changes
  const romajiWords = words.kana.map((w) =>
    applyNStyle(
      wanakana.toRomaji(w, getToRomajiOptions(romajiStyle, nStyle)),
      nStyle,
    ),
  );
  const passPhrase = romajiWords.join(separator);
  const kanjiPassPhrase = words.kanji.join(separator);

  useEffect(() => {
    setWordlist(Papa.parse<string[]>(wordlist_csv).data);
  }, []);

  const generatePassPhrase = () => {
    setGeneratedConfig({
      wordCount,
      numberEnabled,
      digitCount,
      numberPosition,
    });

    const kanji: string[] = [];
    const kana: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const entry = wordlist[Math.floor(Math.random() * wordlist.length)];
      kanji.push(entry[0]);
      kana.push(entry[1]);
    }
    if (numberEnabled) {
      const num = String(Math.floor(Math.random() * 10 ** digitCount)).padStart(
        digitCount,
        "0",
      );
      if (numberPosition === "start") {
        kanji.unshift(num);
        kana.unshift(num);
      } else {
        kanji.push(num);
        kana.push(num);
      }
    }
    setWords({ kana, kanji });
  };

  const handleThemeToggle = () => {
    document.documentElement.classList.add("theme-transitioning");
    setThemeMode((m) => (m === "light" ? "dark" : "light"));
    setTimeout(
      () => document.documentElement.classList.remove("theme-transitioning"),
      400,
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeToggle>
        <IconButton
          href="https://aosankaku.net"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ホームページ"
          component="a"
          sx={{
            transition: "background-color 0.3s ease, color 0.3s ease",
            color: "inherit",
          }}
        >
          <HomeIcon />
        </IconButton>
        <IconButton
          href="https://github.com/AoSankaku/passphrase-generator-japanese"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHubリポジトリ"
          component="a"
          sx={{
            transition: "background-color 0.3s ease, color 0.3s ease",
            color: "inherit",
          }}
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          onClick={handleThemeToggle}
          aria-label="テーマ切り替え"
          sx={{
            transition: "background-color 0.3s ease, color 0.3s ease",
            color: "inherit",
          }}
        >
          <FadeIcon key={themeMode}>
            {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </FadeIcon>
        </IconButton>
      </ThemeToggle>
      <Title>
        <Twemoji>🇯🇵</Twemoji> 日本語パスフレーズジェネレーター
      </Title>
      <div>
        <p>日本語でパスフレーズ（パスワードの代わりになるもの）を作れます。</p>
      </div>
      <PassphraseContainer>
        <PassPhrase>
          {romajiWords.map((word, i) => (
            <span key={i}>
              {word}
              {i < romajiWords.length - 1 && <Separator>{separator}</Separator>}
            </span>
          ))}
        </PassPhrase>
        <KanjiPassPhrase>
          {words.kanji.map((word, i) => (
            <span key={i}>
              {word}
              {i < words.kanji.length - 1 && <Separator>{separator}</Separator>}
            </span>
          ))}
        </KanjiPassPhrase>
      </PassphraseContainer>
      <EntropyDisplay
        passPhrase={passPhrase}
        wordlistSize={wordlist.length}
        separator={separator}
        generatedConfig={generatedConfig}
      />
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <GenerateButton
          onClick={generatePassPhrase}
          variant="outlined"
          startIcon={<ReplayIcon />}
          size="large"
          $flashing={needsRegeneration}
        >
          生成
        </GenerateButton>
        <CopyButton
          passPhrase={passPhrase}
          disabled={generatedConfig === null}
        />
      </Box>
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 560,
          mx: "auto",
          my: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "center" }}>
          <WordCountSlider
            title="単語数"
            value={wordCount}
            onChange={setWordCount}
          />
        </Box>
        <Divider />
        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "center" }}>
          <NumberSlotControl
            enabled={numberEnabled}
            onToggle={setNumberEnabled}
            position={numberPosition}
            onPositionChange={setNumberPosition}
            digitCount={digitCount}
            onDigitCountChange={setDigitCount}
          />
        </Box>
        <Divider />
        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "center" }}>
          <SeparatorControl value={separator} onChange={setSeparator} />
        </Box>
        <Divider />
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            gap: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <RomajiStyleControl value={romajiStyle} onChange={setRomajiStyle} />
          <NStyleControl value={nStyle} onChange={setNStyle} />
        </Box>
      </Paper>
      <QandA />
      <Footer />
    </ThemeProvider>
  );
};

const Separator = styled.span`
  opacity: 0.55;
`;

const ThemeToggle = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
`;

const FadeIcon = styled.span`
  display: flex;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: rotate(-45deg) scale(0.7);
    }
    to {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  }
  animation: fadeIn 0.2s ease;
`;

const Title = styled.h1`
  margin-top: 10vh;
`;

const GenerateButton = styled(Button) <{ $flashing: boolean }>`
  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.5);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(25, 118, 210, 0);
    }
  }
  ${({ $flashing }) =>
    $flashing && `animation: pulse 1.2s ease-in-out infinite;`}
`;

const PassphraseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 5lh;
  width: 100%;
  font-size: clamp(1.5rem, 5vw, 3rem);
  margin: 2rem 0;
`;

const PassPhrase = styled.div`
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: bold;
  padding: 1rem 0;
  word-break: break-all;
`;

const KanjiPassPhrase = styled.div`
  font-size: clamp(1rem, 3.5vw, 2rem);
  font-weight: bold;
  padding: 0 0 1rem 0;
  color: #888;
  word-break: break-all;
`;

export default App;
