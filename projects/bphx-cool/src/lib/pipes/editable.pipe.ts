import { Pipe, PipeTransform } from "@angular/core";
import { Editable } from "../api/editable";
import { Selectable } from "../api/selectable";
import { Accessor } from "../api/accessor";

/**
 * Creates a mixin of array with Selectable and Editable.
 */
@Pipe({ name: "editable" })
export class EditablePipe implements PipeTransform
{
  /**
   * Mixes `selectableItems` array with interface Editable.
   * @param selectableItems a selectable array to augment.
   * @param expression an expression addressing a property
   *   within element of the array, used for value binding.
   * @param capacity optional capacity of the source array.
   * @returns an array array instance.
   */
  transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectableItems: any[] & Selectable,
    expression: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    capacity?: number): any[] & Selectable & Editable
  {
    let items = !selectableItems ? [] : selectableItems;

    if (!items)
    {
      items = [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((items as any).$editable)
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items as any[] & Selectable & Editable;
    }

    const selector = new Accessor(expression);

    const makeValue = item =>
    {
      const selectionValue =
      {
        item,
        $editable: true,
        toString()
        {
          const value = selector.get(this.item);

          return value ? value + "" : "";
        }
      };

      return selectionValue;
    };

    let newValue: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selection = makeValue(selectableItems[selectableItems.selection as any]);

    Object.defineProperties(selectableItems,
    {
      value:
      {
        get() { return selection; },
        set(value)
        {
          if (selection?.item)
          {
            if (value &&
              (typeof value === "object" ?
                selection.item === value :
                selection.toString() === value.toString()))
            {
              return;
            }

            if (newValue)
            {
              newValue = false;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (Array.isArray((selectableItems as any).$outer))
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (selectableItems as any).$outer.pop();
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (Array.isArray((selectableItems as any).$inner))
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (selectableItems as any).$inner.pop();
              }
            }
            else
            {
              selectableItems.setSelected(selection.item, false);
            }
          }

          if (!value)
          {
            return;
          }

          selection = typeof value === "object" ? makeValue(value) : null;

          if (!selection)
          {
            for(const item of selectableItems)
            {
              const itemValue = selector.get(item);
              const stringValue = itemValue ? itemValue + "" : "";

              if (value === stringValue)
              {
                selection = makeValue(item);

                break;
              }
            }
          }

          if (selection)
          {
            selectableItems.setSelected(selection.item, true);
          }
          else
          {
            selection = makeValue({});
            selector.set(selection.item, value);
            selectableItems.setSelected(selection.item, true);

            if ((value != null) &&
              (value !== "") &&
              (selectableItems.length < capacity))
            {
              newValue = true;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (Array.isArray((selectableItems as any).$outer))
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (selectableItems as any).$outer.push(selection.item.outer);
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (Array.isArray((selectableItems as any).$inner))
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (selectableItems as any).$inner.push(selection.item.inner);
              }
            }
          }
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selectableItems as any).$editable = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return selectableItems as any[] & Selectable & Editable;
  }
}
