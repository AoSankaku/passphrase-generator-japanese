import twemoji from "@twemoji/api";

type TwemojiProps = {
  children: string;
};

export default function Twemoji({ children }: TwemojiProps) {
  const html = twemoji.parse(children, { folder: "svg", ext: ".svg" });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
