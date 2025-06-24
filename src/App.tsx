import './App.css'
import styled from 'styled-components'
import { Button } from '@mui/material'


function App() {

  return (
    <>
      <Title>日本語パスフレーズジェネレーター</Title>
      <div>
        <p>日本語でパスフレーズ（パスワードの代わりになるもの）を作れます。</p>
      </div>
      <PassPhrase>
        nihon.gengo.pasuwa-do.kawarini.naruyo
      </PassPhrase>
      <Button>生成</Button>
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
