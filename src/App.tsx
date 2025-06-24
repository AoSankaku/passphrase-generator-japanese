import './App.css'
import styled from 'styled-components'
import { Button } from '@mui/material'
import { useState, useEffect } from 'react'
import Papa from 'papaparse';
import wordlist_csv from "./assets/wordlist.csv?raw";


function App() {
  const [wordlist, setWordlist] = useState<any>()
  const [passPhrase, setPassPhrase] = useState("nihon.gengo.pasuwa-do.kawarini.naruyo")
  const [separator, setSeparator] = useState(".")

  useEffect(() => {
    setWordlist(Papa.parse(wordlist_csv))
  }, [])

  useEffect(() => {
    console.dir(wordlist)
  }, [wordlist])

  const generatePassPhrase = () => {
    
   /*ランダムパスワード生成*/ 
    const union_pass = []
    for(let i = 0; i < 4; i++){
      const rand_index = Math.floor(Math.random() * wordlist.data.length)
      const pass_parts = wordlist.data[rand_index][1]
      union_pass.push(pass_parts)
    }
    setPassPhrase([union_pass].join(separator))
  }

  return (
    <>
      <Title>日本語パスフレーズジェネレーター</Title>
      <div>
        <p>日本語でパスフレーズ（パスワードの代わりになるもの）を作れます。</p>
      </div>
      <PassPhrase>
        {passPhrase}
      </PassPhrase>
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

export default App
