import { formatString } from "./format-string";

type Params = Parameters<typeof formatString>;
type Result = ReturnType<typeof formatString>;

const data: [Params, Result][] =
[
  [[ "ABC", null ], "ABC"],
  [[ "ABC", "XXXXX" ], "ABC  "],
  [[ "ABC", "XXXXX", true ], "  ABC"],
  [[ "12345", "XX-XXX", true ], "12-345"]
];

describe("formatString", () =>
{
  it("formats according to patterns", () =>
  {
    data.forEach(item =>
    {
      const result = formatString(...item[0]);

      expect(result).toBe(item[1]);
    });
  });
});
