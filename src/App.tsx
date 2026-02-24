import "./App.css";
import styled from "styled-components";
import { Button, Input } from "@mui/material";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import wordlist_csv from "./assets/wordlist.csv?raw";
import * as wanakana from "wanakana";
import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TestSlider from "./components/TestSlider.tsx";
import EntropyDisplay, {
  GeneratedConfig,
} from "./components/EntropyDisplay.tsx";
import NumberSlotControl from "./components/NumberSlotControl.tsx";
import SeparatorControl from "./components/SeparatorControl.tsx";

const App = () => {
  const [wordlist, setWordlist] = useState<any>();
  const [words, setWords] = useState<{ romaji: string[]; kanji: string[] }>({
    romaji: ["nihongo", "pasuwa-do", "kawarini", "naruyo"],
    kanji: ["日本語", "パスワード", "代わりに", "なるよ"],
  });
  const [separator, setSeparator] = useState(".");
  const [isFirstGenerate, setIsFirstGenerate] = useState(true);
  const [wordCount, setWordCount] = useState(4);
  const [numberEnabled, setNumberEnabled] = useState(false);
  const [numberPosition, setNumberPosition] = useState<"start" | "end">("end");
  const [digitCount, setDigitCount] = useState(4);
  const [generatedConfig, setGeneratedConfig] =
    useState<GeneratedConfig | null>(null);

  // Derived — updates instantly when separator changes, no regeneration needed
  const passPhrase = words.romaji.join(separator);
  const kanjiPassPhrase = words.kanji.join(separator);

  useEffect(() => {
    setWordlist(Papa.parse(wordlist_csv));
  }, []);

  useEffect(() => {
    console.dir(wordlist);
  }, [wordlist]);

  /*ランダムパスワード生成----------------------------------------------------------------------------------*/
  const generatePassPhrase = () => {
    setIsFirstGenerate(false);
    setGeneratedConfig({ wordCount, numberEnabled, digitCount });

    const union_pass: [string[], string[]] = [[], []];
    for (let i = 0; i < wordCount; i++) {
      const rand_index = Math.floor(Math.random() * wordlist.data.length);
      const pass_parts = wordlist.data[rand_index];
      union_pass[0].push(pass_parts[0]);
      union_pass[1].push(wanakana.toRomaji(pass_parts[1]));
    }
    if (numberEnabled) {
      const num = Math.floor(Math.random() * Math.pow(10, digitCount))
        .toString()
        .padStart(digitCount, "0");
      if (numberPosition === "start") {
        union_pass[0].unshift(num);
        union_pass[1].unshift(num);
      } else {
        union_pass[0].push(num);
        union_pass[1].push(num);
      }
    }
    setWords({ romaji: union_pass[1], kanji: union_pass[0] });
  };

  /*コピーボタン----------------------------------------------------------------------------------------------*/
  const CopyButton = () => {
    const [copyStatus, setCopyStatus] = useState("");
    const handleCopyClick = async () => {
      try {
        await navigator.clipboard.writeText(passPhrase);
      } catch (err) {
        setTimeout(() => setCopyStatus(""), 2000); // 2秒後にメッセージを消す
        setCopyStatus("コピーに失敗しました。");
        console.error("コピーエラー:", err);
      }
    };

    return (
      <Button
        onClick={handleCopyClick}
        variant="contained"
        startIcon={<ContentCopyIcon />}
        size="large"
        disabled={isFirstGenerate}
      >
        コピー
      </Button>
    );
  };

  return (
    <>
      <Title>日本語パスフレーズジェネレーター</Title>
      <div>
        <p>日本語でパスフレーズ（パスワードの代わりになるもの）を作れます。</p>
      </div>
      <PassphraseContainer>
        <PassPhrase>{passPhrase}</PassPhrase>
        <KanjiPassPhrase>{kanjiPassPhrase}</KanjiPassPhrase>
      </PassphraseContainer>
      <EntropyDisplay
        passPhrase={passPhrase}
        wordlistSize={wordlist?.data?.length ?? 0}
        separator={separator}
        generatedConfig={generatedConfig}
      />
      <SliderContainer>
        <TestSlider title="単語数" value={wordCount} onChange={setWordCount} />
      </SliderContainer>
      <SliderContainer>
        <SeparatorControl value={separator} onChange={setSeparator} />
      </SliderContainer>
      <SliderContainer>
        <NumberSlotControl
          enabled={numberEnabled}
          onToggle={setNumberEnabled}
          position={numberPosition}
          onPositionChange={setNumberPosition}
          digitCount={digitCount}
          onDigitCountChange={setDigitCount}
        />
      </SliderContainer>
      <GenerateButton
        onClick={() => generatePassPhrase()}
        variant="outlined"
        startIcon={<ReplayIcon />}
        size="large"
        $flashing={isFirstGenerate}
      >
        生成
      </GenerateButton>
      <CopyButton />
    </>
  );
};

const Title = styled.h1``;

const GenerateButton = styled(Button)<{ $flashing: boolean }>`
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

const SliderContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const PassphraseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 5lh;
  width: 100%;
  font-size: 3rem;
  margin: 2rem 0;
`;

const PassPhrase = styled.div`
  font-size: 3rem;
  font-weight: bold;
  padding: 1rem 0;
  word-break: break-all;
`;

const KanjiPassPhrase = styled.div`
  font-size: 2rem;
  font-weight: bold;
  padding: 0 0 1rem 0;
  color: #888;
  word-break: break-all;
`;

export default App;
