import { SelectionPipe } from "./selection.pipe";

describe("SelectionPipe", () =>
{
  it("applies to input", () =>
  {
    const pipe = new SelectionPipe();

    const items =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "" },
      { value: 3, selected: "" },
    ];

    const selectableItems = pipe.transform(items, "selected");

    expect(selectableItems).toBeTruthy();
    expect("selection" in selectableItems).toBeTruthy();
  });

  it("reads selection", () =>
  {
    const pipe = new SelectionPipe();

    const items =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "*" },
      { value: 3, selected: "" },
    ];

    const selectableItems = pipe.transform(items, "selected");
    const selected = selectableItems.selection;

    expect(selected).toBe(1);
  });

  it("write selection", () =>
  {
    const pipe = new SelectionPipe();

    const items =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "*" },
      { value: 3, selected: "" },
    ];

    const selectableItems = pipe.transform(items, "selected");

    selectableItems.selection = [0];

    expect(selectableItems[0].selected).toBe("*");
    expect(selectableItems[1].selected).toBe("");
  });
});
