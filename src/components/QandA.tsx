import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";

const items = [
  {
    q: "パスフレーズって何？",
    a: "単語を組み合わせてパスワードのようにしたものです。",
  },
  {
    q: "なぜ日本語？",
    a: "英語圏には英語でパスフレーズを作る文化がありますが、日本語で同じことができるツールがなかったため作りました。",
  },
  {
    q: "そもそもこのサイトは安全ですか？",
    a: "このサイトは生成したパスワードをお使いのブラウザにもウチのサーバーにも保管しないため、安全です。どうしても不安でしょうがない人はソースコードも見ることができます。",
  },
  {
    q: "パスワードじゃだめなの？",
    a: "パスワードには、全然覚えられないという先天的な欠陥があります。パスフレーズを活用することで、覚えやすいのに圧倒的に強固なパスワードができます。",
  },
  {
    q: "パスワードとパスフレーズはどっちが強いですか？",
    a: "パスワードは、長ければ長いほど、誰も使っていないほど攻撃に強いです。ちなみに、日本語単語4つの組み合わせだけでも、8桁の半角英数字のパスワードの約50倍の強度があります。",
  },
  {
    q: "でも大量のパスワードを覚えるのは無理じゃないですか？",
    a: "全くもっておっしゃるとおりです。なので、パスワードマネージャーの利用を推奨しています。パスワードマネージャーを使えば、覚える必要があるのはパスワードを見るためのマスターパスワードだけになります。",
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
            <Typography color="text.secondary" sx={{ textAlign: "left" }}>
              {item.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
