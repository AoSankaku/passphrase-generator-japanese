import './App.css'
import styled from 'styled-components'
import { Button } from '@mui/material'
import { useState, useEffect } from 'react'
import Papa from 'papaparse';
import wordlist_csv from "./assets/wordlist.csv?raw";
import * as wanakana from 'wanakana';

type PassPhrase = {
  passPhrase: string;
  kanjiPassPhrase: string;
}

const App = () => {
  const [wordlist, setWordlist] = useState<any>()
  const [passPhrase, setPassPhrase] = useState<PassPhrase>({
    passPhrase: "nihon.gengo.pasuwa-do.kawarini.naruyo",
    kanjiPassPhrase: "日本語パスワード代わりになるよ"
  })
  const [separator, setSeparator] = useState(".")

  useEffect(() => {
    setWordlist(Papa.parse(wordlist_csv))
  }, [])

  useEffect(() => {
    console.dir(wordlist)
  }, [wordlist])

  /*ランダムパスワード生成----------------------------------------------------------------------------------*/
  const generatePassPhrase = () => {

    const union_pass: [string[], string[]] = [[], []]
    for (let i = 0; i < 4; i++) {
      const rand_index = Math.floor(Math.random() * wordlist.data.length)
      const pass_parts = wordlist.data[rand_index]
      union_pass[0].push(pass_parts[0])
      union_pass[1].push(wanakana.toRomaji(pass_parts[1]))
    }
    setPassPhrase({
      passPhrase: [union_pass[1]].join(separator),
      kanjiPassPhrase: [union_pass[0]].join(separator)
    })
  }

  /*コピーボタン----------------------------------------------------------------------------------------------*/
  const CopyButton = () => {
    const [copyStatus, setCopyStatus] = useState('');
    const textToCopy = passPhrase.passPhrase;
    const handleCopyClick = async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (err) {
        setTimeout(() => setCopyStatus(''), 2000); // 2秒後にメッセージを消す
        setCopyStatus('コピーに失敗しました。');
        console.error('コピーエラー:', err);
      }
    };

    return (
      <span>
        <Button onClick={handleCopyClick}>
          {copyStatus || 'コピー'}
        </Button>
        {copyStatus && <p style={{ color: copyStatus.includes('失敗') ? 'red' : 'green' }}>{copyStatus}</p>}
      </span>
    );
  }



  return (
    <>
      <Title>日本語パスフレーズジェネレーター</Title>
      <div>
        <p>日本語でパスフレーズ（パスワードの代わりになるもの）を作れます。</p>
      </div>
      <PassPhrase>
        {passPhrase.passPhrase}
      </PassPhrase>
      <KanjiPassPhrase>
        {passPhrase.kanjiPassPhrase}
      </KanjiPassPhrase>
      <Button onClick={() => generatePassPhrase()}>生成</Button>{CopyButton()}
    </>
  )
}

const Title = styled.h1`
`

const PassPhrase = styled.div`
  font-size: 3rem;
  font-weight: bold;
  padding: 1rem 0;
`

const KanjiPassPhrase = styled.div`
  font-size: 2rem;
  font-weight: bold;
  padding:  0 0 1rem 0;
  color: #888;
`

export default App
