import { SelectedPipe } from "./selected.pipe";

describe("SelectedPipe", () =>
{
  it("filters items", () =>
  {
    const pipe = new SelectedPipe();

    const items =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "*" },
      { value: 3, selected: "*" },
    ];

    const selected = pipe.transform(items, "selected");

    expect(selected).toBeTruthy();
    expect(selected.length).toBe(2);
    expect(selected[0].value).toBe(2);
    expect(selected[1].value).toBe(3);
  });
});
