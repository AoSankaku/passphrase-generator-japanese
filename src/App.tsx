import './App.css'
import styled from 'styled-components'
import { Button } from '@mui/material'
import { useState } from 'react'

function App() {
  const [passPhrase, setPassPhrase] = useState("nihon.gengo.pasuwa-do.kawarini.naruyo")

  const generatePassPhrase = () => {
    setPassPhrase("test-test-test-test-" + Math.floor(Math.random() * 100))
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
