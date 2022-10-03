import { parseString } from "./parse-string";

type Params = Parameters<typeof parseString>;
type Result = ReturnType<typeof parseString>;

const data: [Params, Result][] =
[
  [[ "ABC", null ], "ABC"],
  [[ "ABC  ", "XXXXX" ], "ABC"],
  [[ "  ABC", "XXXXX", true ], "ABC"],
  [[ "  ABC", "XXXXX" ], "  ABC"],
  [[ "12-345", "XX-XXX", true ], "12345"]
];

describe("parseString", () =>
{
  it("parses according to patterns", () =>
  {
    data.forEach(item =>
    {
      expect(parseString(...item[0])).toBe(item[1]);
    });
  });
});
