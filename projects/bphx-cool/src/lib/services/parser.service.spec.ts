import { Accessor } from "../api/accessor";

describe("ParserService", () =>
{
  it("creates accessor instance", () =>
  {
    const accessor = new Accessor("a.b.c");

    expect(accessor).toBeTruthy();
  });

  it("accessor can be used to get the data", () =>
  {
    const accessor = new Accessor("in.value");
    const data = { in: { value: 7 } };

    expect(accessor.get(data)).toBe(7);
  });

  it("accessor can be access non-existing data", () =>
  {
    const accessor = new Accessor("in.x.y");
    const data = { in: { value: 7 } };

    expect(accessor.get(data) == null).toBe(true);
  });

  it("accessor can be write the data", () =>
  {
    const accessor = new Accessor("in.value");
    const data = { in: { value: 7 } };

    accessor.set(data, 8);
    expect(data.in.value).toBe(8);
  });

  it("accessor can be write to a new field", () =>
  {
    const accessor = new Accessor("in.x.y");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { in: { value: 7 } };

    accessor.set(data, 8);

    expect(data.in.x && data.in.x.y).toBe(8);
  });
});
