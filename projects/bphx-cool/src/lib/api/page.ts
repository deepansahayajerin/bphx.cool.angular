import { Selectable } from "./selectable";
import { ZipPipe } from "../pipes/zip.pipe";
import { Inject, Directive, AfterContentInit } from "@angular/core";
import { Global } from "./client/global";
import { Procedure } from "./client/procedure";
import { Window } from "./client/window";
import { Dialog } from "./dialog/dialog";
import { VIEW_ACCESSOR, View } from "./dialog/view";
import { Editable } from "./editable";
import { SelectedPipe } from "../pipes/selected.pipe";
import { EditablePipe } from "../pipes/editable.pipe";
import { SelectionPipe } from "../pipes/selection.pipe";
import { Accessor } from "./accessor";

/**
 * Page base.
 */
@Directive()
export abstract class Page implements AfterContentInit
{
  /**
   * Import structure.
   */
  get in(): unknown
  {
    return this.view.coolProcedure?.in;
  }

  /**
   * Export structure.
   */
  get out(): unknown
  {
    return this.view.coolProcedure?.out;
  }

  /**
   * Global structure.
   */
  get global(): Global
  {
    return this.view.dialog?.global;
  }

  /**
   * A procedure reference.
   */
  get procedure(): Procedure
  {
    return this.view.coolProcedure;
  }

  /**
   * A window reference.
   */
  get window(): Window
  {
    return this.view.coolWindow;
  }

  /**
   * A `Dialog` reference.
   */
  get dialog(): Dialog
  {
    return this.view.dialog;
  }

  /**
   * Gets page id.
   */
  get id(): string
  {
    return this.view.id;
  }

  /**
   * A page size.
   */
  get pageSize(): number
  {
    return this.procedure?.pageSize ?? 0;
  }

  set pageSize(value: number)
  {
    if (this.procedure)
    {
      this.procedure.pageSize = value;
    }
  }

  /**
   * A page offset.
   */
  get pageOffset(): number
  {
    return this.procedure?.pageOffset ?? 0;
  }

  set pageOffset(value: number)
  {
    if (this.procedure)
    {
      this.procedure.pageOffset = value;
    }
  }

  /**
   * A scroll size.
   */
  get scrollSize(): number
  {
    return this.procedure?.scrollSize ?? 0;
  }

  set scrollSize(value: number)
  {
    if (this.procedure)
    {
      this.procedure.scrollSize = value;
    }
  }

  /**
   * A scroll amount.
   */
  get scrollAmt(): number
  {
    return this.dialog?.getScrollAmt(this.procedure) ?? 0;
  }

  /**
   * Pagination message.
   */
  get pagination(): string
  {
    const scrollAmt = this.scrollAmt;
    const pageOffset = this.pageOffset;
    const scrollSize = this.scrollSize;

    const scrollInd = pageOffset === 0 ?
      scrollSize > scrollAmt ? "scrollNext" : "noScroll" :
      scrollSize > scrollAmt + pageOffset ? "scrollBoth" : "scrollPrev";

    return this.dialog?.message(scrollInd) ?? scrollInd;
  }

  /**
   * Math.max function.
   */
  readonly max = Math.max;

  /**
   * Math.max function.
   */
  readonly min = Math.min;

  /**
   * Creates `Page` instance.
   * @param view a `View` reference.
   */
  constructor(@Inject(VIEW_ACCESSOR) public view: View)
  {
  }

  ngAfterContentInit(): void
  {
    this.dialog?.updateView();
  }

  /**
   * Gets array's length.
   * @param items an array to get length for.
   * @returns array length or 0 in case of items is null.
   */
  length(items: unknown[]): number
  {
    return items?.length ?? 0;
  }

  /**
   * Creates a new array with corresponding items from outer and inner array.
   * @param outer an outer array.
   * @param inner an inner array.
   * @returns zipped array.
   */
  zip(outer: unknown[], inner: unknown[]): unknown[]
  {
    const pipe = new ZipPipe();

    return pipe.transform(outer, inner);
  }

  /**
   * Mixes `items` array with interface Selectable.
   *
   * **Note:** This pipe changes the state of input array, so it's better to
   *           apply it in context where there is no repeated evaluation.
   *
   * @param items an array to augment.
   * @param expression an expression addressing a propety
   *   within element of the array, used for value selection.
   *
   *   **NOTE**: selector value can be one of:
   *   - `"*"` - selected item;
   *   - `"+"` - clicked on highlighted item;
   *   - `"-"` - clicked on unhighlighted item;
   *   - `"H"` - hidden item;
   *   - `" "` or any other - not selected item.
   * @returns mixed array instance.
   */
  selection(items: unknown[], expression: string): unknown[] & Selectable
  {
    const pipe = new SelectionPipe();

    return pipe.transform(items, expression);
  }

  /**
   * Gets selected items for the array.
   * @param items a source array.
   * @param expression an expression addressing a propety
   *   within element of the array, used for value selection.
   *
   *   **NOTE**: selector value can be one of:
   *   - `"*"` - selected item;
   *   - `"+"` - clicked item;
   *   - `"-"` - un-clicked item;
   *   - `"H"` - hidden item;
   *   - `" "` or any other - not selected item.
   */
  selected(items: unknown[], expression: string): unknown[]
  {
    const pipe = new SelectedPipe();

    return pipe.transform(items, expression);
  }

  /**
   * Mixes `selectableItems` array with interface Editable.
   * @param selectableItems a selectable array to augment.
   * @param expression an expression addressing a property
   *   within element of the array, used for value binding.
   * @param capacity optional capacity of the source array.
   * @returns an array array instance.
   */
  editable(
    selectableItems: unknown[] & Selectable,
    expression: string,
    capacity?: number): unknown[] & Selectable & Editable
  {
    const pipe = new EditablePipe();

    return pipe.transform(selectableItems, expression, capacity);
  }

  /**
   * Returns a property reference for the instance and by expression parts.
   * @param instance an instance to get property reference for.
   * @param expression an expression as array of property parts.
   *   Each expression part is either array index, or
   *   property names connected with ".".
   * @returns a property reference.
   */
  ref(instance: unknown, ...expression: (string|number)[]): { value: unknown }
  {
    const accessor = new Accessor(...expression);

    const value =
    {
      get value() : unknown
      {
        return accessor.get(instance);
      },

      set value(value: unknown)
      {
        accessor.set(instance, value);
      }
    };

    return value;
  }
}
