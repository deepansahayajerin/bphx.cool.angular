import { TimePipe } from "./time.pipe";

describe("TimePipe", () =>
{
  it("formats time", () =>
  {
    const pipe = new TimePipe();

    expect(pipe.transform("10:37:34", "hh:mm")).toBe("10:37");
    expect(pipe.transform("00:00:00", "hh:mm", true)).toBe("");
  });
});
