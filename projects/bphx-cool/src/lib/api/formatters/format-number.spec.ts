import { Locale } from "../locale";
import { formatNumber } from "./format-number";

type Params = Parameters<typeof formatNumber>;
type Result = ReturnType<typeof formatNumber>;

const locale: Locale =
{
  decimalPoint: ",",
  groupSeparator: "."
};

const data: [Params, Result][] =
[
  [[ "12345", null ], "12345"],
  [[ 12.345, "000.999;-#" ], "012.345"],
  [[ 0, "000.999;-#", true ], "000.000"],
  [[ 45612.345, "###,###.999;-#", false, locale], "45.612,345"],
  [[ -12.345, "#,###.999;-#", false, locale], "-12,345"],
  [[ 0, "####0", true, locale], "0"],
  [[ 0, "0000;#", true, locale], ""]
];

describe("formatNumber", () =>
{
  it("formats according to patterns", () =>
  {
    data.forEach(item =>
    {
      expect(formatNumber(...item[0])).toBe(item[1], item[0]);
    });
  });
});
