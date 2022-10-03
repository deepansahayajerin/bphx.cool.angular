import { parseNumber } from "./parse-number";
import { Locale } from "../locale";

type Params = Parameters<typeof parseNumber>;
type Result = ReturnType<typeof parseNumber>;

const locale: Locale =
{
  decimalPoint: ",",
  groupSeparator: "."
};

const locale2: Locale =
{
  decimalPoint: ".",
  groupSeparator: ","
};

const data: [Params, Result][] =
[
  [[ "12345", null ], 12345],
  [[ "012.345", "000.999;-#" ], 12.345],
  [[ "45.612,345", "999,999.999;-#", false, locale], 45612.345],
  [[ "-12,345", "9,999.999;-#", false, locale], -12.345],
  [[ "5000.", "999,900.00;#", false, locale2], 5000],
];

describe("parseNumber", () =>
{
  it("parses according to patterns", () =>
  {
    data.forEach(item =>
    {
      expect(parseNumber(...item[0])).toBe(item[1]);
    });
  });
});
