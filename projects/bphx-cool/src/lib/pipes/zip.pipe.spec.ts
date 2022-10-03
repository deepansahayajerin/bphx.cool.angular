import { ZipPipe } from "./zip.pipe";

describe("ZipPipe", () =>
{
  it("zips two arrays", () =>
  {
    const pipe = new ZipPipe();

    const outer = [1, 2, 3];
    const inner = ["1", "2", "3"];
    const zip = pipe.transform(outer, inner);

    const expected =
    [
      { outer: 1, inner: "1" },
      { outer: 2, inner: "2" },
      { outer: 3, inner: "3" }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expected as any).$inner = inner;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expected as any).$outer = outer;

    expect(zip).toEqual(expected);
  });
});
