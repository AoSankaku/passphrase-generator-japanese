import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";

const items = [
  {
    q: "パスフレーズって何？",
    a: "単語を組み合わせてパスワードのようにしたものです。",
  },
  {
    q: "なぜ日本語？",
    a: "英語でパスフレーズを作るツールはもうありますが、日本語で同じことができるツールがなかったため作りました。ちなみに、英語のパスフレーズは[このサイトとか](https://bitwarden.com/passphrase-generator/)から作ることもできます。",
  },
  {
    q: "そもそもこのサイトは安全ですか？",
    a: "このサイトは生成したパスワードをお使いのブラウザにもウチのサーバーにも保管しないため、安全です。どうしても不安でしょうがない人は[ソースコードも見ることができます](https://github.com/AoSankaku/passphrase-generator-japanese)。",
  },
  {
    q: "パスワードじゃだめなの？",
    a: "パスワードには、**全然覚えられない**という先天的な欠陥があります。パスフレーズを活用することで、覚えやすいのに圧倒的に強固なパスワードができます。",
  },
  {
    q: "パスワードとパスフレーズはどっちが強いですか？",
    a: "パスワードは、長ければ長いほど、誰も使っていないほど攻撃に強いです。ちなみに、日本語単語4つの組み合わせだけでも、8桁の半角英数字のパスワードの約50倍の強度があります。",
  },
  {
    q: "でも大量のパスワードを覚えるのは無理じゃないですか？",
    a: "**全くもっておっしゃるとおりです**。なので、パスワードマネージャーの利用を推奨しています。パスワードマネージャーを使えば、覚える必要があるのはパスワードを見るためのマスターパスワードだけになります。[Bitwarden](https://bitwarden.com/ja-jp/)や[Proton Pass](https://proton.me/ja/pass)がおすすめです。",
  },
  {
    q: "パスフレーズにしても覚えられません。",
    a: "毎日確認するのではなく、パスフレーズを作った日に20回ぐらい繰り返して打ち込んだり、声に出したりしてみてください。その後1週間ぐらい1日6回を目安に確認していれば頭に入ります。人間の脳はそういうふうにできています。",
  },
];

export default function QandA() {
  return (
    <Box sx={{ width: "100%", maxWidth: 920, mx: "auto", my: 10 }}>
      {items.map((item) => (
        <Accordion key={item.q} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <Typography color="text.secondary" sx={{ textAlign: "left" }}>
                    {children}
                  </Typography>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {item.a}
            </ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
