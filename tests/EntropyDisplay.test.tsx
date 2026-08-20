import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import EntropyDisplay, {
  InlineEntropyValue,
} from "../src/components/EntropyDisplay";

describe("InlineEntropyValue", () => {
  it("renders the entropy value as bold inline text", () => {
    const markup = renderToStaticMarkup(
      <InlineEntropyValue>26.5 bits</InlineEntropyValue>,
    );

    expect(markup).toContain("<span");
    expect(markup).not.toContain("<p");
    expect(markup).toContain("font-weight:700");
  });
});

describe("EntropyDisplay", () => {
  it("renders the generated entropy summary", () => {
    const markup = renderToStaticMarkup(
      <EntropyDisplay
        passPhrase="taro19900412"
        separator="."
        generatedConfig={{
          wordCount: 4,
          numberEnabled: true,
          digitCount: 4,
          numberPosition: "end",
          wordlistSize: 5_675,
          wordsetKey: "general",
        }}
        maleNameBirthdayExample={{ password: "taro19900412", entropy: 26.5 }}
      />,
    );

    expect(markup).toContain("文字エントロピー:");
    expect(markup).toContain("単語エントロピー:");
  });
});
