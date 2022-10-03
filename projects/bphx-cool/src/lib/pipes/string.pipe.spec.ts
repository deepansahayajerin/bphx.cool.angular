import { StringPipe } from "./string.pipe";

describe("StringPipe", () =>
{
  it("Format strig", () =>
  {
    const pipe = new StringPipe();

    expect(pipe.transform("12345", "XX-XXX")).toBe("12-345");
  });
});
