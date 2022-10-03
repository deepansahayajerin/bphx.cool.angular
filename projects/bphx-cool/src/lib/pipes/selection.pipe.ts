import { Pipe, PipeTransform } from "@angular/core";
import { Selectable } from "../api/selectable";
import { Accessor } from "../api/accessor";

@Pipe({ name: "selection" })
export class SelectionPipe implements PipeTransform
{
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
   *   - `">"` - highlighted top row;
   *   - `"<"` - unhighlighted top row;
   *   - `"H"` - hidden item;
   *   - `" "` or any other - not selected item.
   * @returns mixed array instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(items: any[], expression: string): any[] & Selectable
  {
    if (!items)
    {
      items = [];
    }

    const selector = new Accessor(expression);
    let selection = [];
    let top = null;
    let rowIndex = -1;

    items.forEach((item, index, array) =>
    {
      ++rowIndex;

      switch(item && selector.get(item))
      {
        case null:
        case "H":
        {
          --rowIndex;

          if (items === array)
          {
            items = items.slice(0, index);
          }

          break;
        }
        case ">":
        {
          top = rowIndex;
        }
        // eslint-disable-next-line no-fallthrough
        case "+":
        {
          // Replace "+" with "*" to indicate that the item is selected
          // in contrast of clicked for "+".
          setSelected(item, "*");
        }
        // eslint-disable-next-line no-fallthrough
        case "*":
        {
          if (items !== array)
          {
            selection.push(items.length);
            items.push(item);
          }
          else
          {
            selection.push(rowIndex);
          }

          break;
        }
        case "<":
        {
          top = rowIndex;
        }
        // eslint-disable-next-line no-fallthrough
        default:
        {
          // Force " " to indicate no selection.
          setSelected(item, " ");

          if (items !== array)
          {
            items.push(item);
          }

          break;
        }
      }
    });

    Object.defineProperties(items,
    {
      isSelected:
      {
        enumerable: false,
        configurable: true,
        value(item)
        {
          const value = item && selector.get(item);

          return (value === "*") || (value === "+") || (value === ">");
        }
      },
      setSelected:
      {
        enumerable: false,
        configurable: true,
        value: setSelected
      },
      selection:
      {
        enumerable: false,
        configurable: true,
        get() { return getSelection(false)[0]; },
        set(value) { setSelection(value, false); }
      },
      selections:
      {
        enumerable: false,
        configurable: true,
        get() { return getSelection(true); },
        set(value) { setSelection(value, true); }
      },
      top:
      {
        enumerable: false,
        configurable: true,
        writable: true,
        value: top
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items as any[] & Selectable;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getSelection(multiple: boolean): any[]
    {
      if (!multiple && (selection.length > 1))
      {
        setSelection(selection[0], false);
      }

      return selection;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setSelection(value: any|any[], multiple: boolean)
    {
      const valueItems = Array.isArray(value) ? value :
        value == null ? [] : [value];
      const selectedMap = {};
      const selectedItems = [];

      (!multiple && valueItems.length > 1 ? [valueItems[0]] : valueItems).
        forEach(item =>
        {
          if (typeof item === "object")
          {
            if (item)
            {
              selectedMap[item.index] = item.value;

              if ((item.value === "*") ||
                (item.value === "+") ||
                (item.value === ">"))
              {
                selectedItems.push(item.index);
              }
            }
          }
          else
          {
            selectedMap[item] = true;
            selectedItems.push(item);
          }
        });

      items.forEach((item, index) => setSelected(item, selectedMap[index]));

      selection = selectedItems;
    }

    function setSelected(item, value)
    {
      if (item)
      {
        selector.set(
          item,
          typeof value === "string" ? value : value ? "*" : "");
      }
    }
  }
}
