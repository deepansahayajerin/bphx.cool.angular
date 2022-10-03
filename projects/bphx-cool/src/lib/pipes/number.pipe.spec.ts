import { NumberPipe } from "./number.pipe";
import { Locale } from "../api/locale";

const locale: Locale =
{
  decimalPoint: ",",
  groupSeparator: "."
};

describe("NumberPipe", () =>
{
  it("formats date with default locale", () =>
  {
    const pipe = new NumberPipe();

    expect(pipe.transform(12.345, "###.999;-#")).toBe("12.345");
  });

  it("formats date with custom locale", () =>
  {
    const pipe = new NumberPipe(locale);

    expect(pipe.transform(12345.678, "##,###.999;-#")).toBe("12.345,678");
  });
});
