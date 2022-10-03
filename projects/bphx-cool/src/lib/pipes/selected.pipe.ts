import { Pipe, PipeTransform } from "@angular/core";
import { Accessor } from "../api/accessor";

/**
 * Gets selected items from input array.
 */
@Pipe({ name: "selected" })
export class SelectedPipe implements PipeTransform
{
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
   *   - `">"` - highlighted top row;
   *   - `"<"` - unhighlighted top row;
   *   - `"H"` - hidden item;
   *   - `" "` or any other - not selected item.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(items: any[], expression: string): any[]
  {
    if (!items)
    {
      items = [];
    }

    const selector = new Accessor(expression);

    return items.filter(item =>
    {
      const value = selector.get(item);

      return (value === "*") || (value === "+") || (value === ">");
    });
  }
}
