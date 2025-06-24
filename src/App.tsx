import './App.css'
import styled from 'styled-components'
import { Button } from '@mui/material'
import { useState, useEffect } from 'react'
import Papa from 'papaparse';
import wordlist_csv from "./assets/wordlist.csv?raw";

type PassPhrase = {
  passPhrase: string;
  kanjiPassPhrase: string;
}

function App() {
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

  const generatePassPhrase = () => {

    /*ランダムパスワード生成*/
    const union_pass: [string[], string[]] = [[], []]
    for (let i = 0; i < 4; i++) {
      const rand_index = Math.floor(Math.random() * wordlist.data.length)
      const pass_parts = wordlist.data[rand_index]
      union_pass[0].push(pass_parts[0])
      union_pass[1].push(pass_parts[1])
    }
    setPassPhrase({
      passPhrase: [union_pass[1]].join(separator),
      kanjiPassPhrase: [union_pass[0]].join(separator)
    })
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
      <Button onClick={() => generatePassPhrase()}>生成</Button>
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
