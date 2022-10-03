import { SelectionPipe } from "./selection.pipe";
import { EditablePipe } from "./editable.pipe";
import { ZipPipe } from "./zip.pipe";

describe("EditablePipe", () =>
{
  it("applies to input", () =>
  {
    const zipPipe = new ZipPipe();
    const selectionPipe = new SelectionPipe();
    const editablePipe = new EditablePipe();

    const outer =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "" },
      { value: 3, selected: "" }
    ];

    const inner =
    [
      { item: "1" },
      { item: "2" },
      { item: "3" }
    ];

    const editableItems = editablePipe.transform(
      selectionPipe.transform(
        zipPipe.transform(outer, inner),
        "outer.selected"),
      "outer.value");

    expect(editableItems).toBeTruthy();
    expect("value" in editableItems).toBeTruthy();
  });

  it("reads value", () =>
  {
    const zipPipe = new ZipPipe();
    const selectionPipe = new SelectionPipe();
    const editablePipe = new EditablePipe();

    const outer =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "*" },
      { value: 3, selected: "" }
    ];

    const inner =
    [
      { item: "1" },
      { item: "2" },
      { item: "3" }
    ];

    const editableItems = editablePipe.transform(
      selectionPipe.transform(
        zipPipe.transform(outer, inner),
        "outer.selected"),
      "outer.value");

    expect(editableItems.value.toString()).toEqual("2");
  });

  it("write value", () =>
  {
    const zipPipe = new ZipPipe();
    const selectionPipe = new SelectionPipe();
    const editablePipe = new EditablePipe();

    const outer =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "" },
      { value: 3, selected: "" }
    ];

    const inner =
    [
      { item: "1" },
      { item: "2" },
      { item: "3" }
    ];

    const editableItems = editablePipe.transform(
      selectionPipe.transform(
        zipPipe.transform(outer, inner),
        "outer.selected"),
      "outer.value");

    editableItems.value = editableItems[2];

    expect(editableItems[2].outer.selected).toBe("*");
  });

  it("write new value", () =>
  {
    const zipPipe = new ZipPipe();
    const selectionPipe = new SelectionPipe();
    const editablePipe = new EditablePipe();

    const outer =
    [
      { value: 1, selected: "" },
      { value: 2, selected: "" },
      { value: 3, selected: "" }
    ];

    const inner =
    [
      { item: "1" },
      { item: "2" },
      { item: "3" }
    ];

    const editableItems = editablePipe.transform(
      selectionPipe.transform(
        zipPipe.transform(outer, inner),
        "outer.selected"),
      "outer.value",
      10);

    editableItems.value = 4;

    expect((editableItems as any).$outer.length).toBe(4);
    expect((editableItems as any).$outer[3].value).toBe(4);
    expect((editableItems as any).$outer[3].selected).toBe("*");
  });
});
