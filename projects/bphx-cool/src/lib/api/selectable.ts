/**
 * Selectable object.
 */
export interface Selectable
{
  /**
   * Top item.
   */
  top?: number;

  /**
   * First selected item.
   */
  selection: unknown;

  /**
   * An array of selected items.
   */
  selections: unknown[];

  /**
   * Gets a value indicating whether the item is selected.
   * @param item an item to check.
   * @returns `true` if item is selected; and  `false` otherwise.
   */
  isSelected(item: unknown): boolean;

  /**
   * Sets a value indicating whether the item is selected.
   * @param item an item to set selection for.
   * @param value a selection value.
   */
  setSelected(item: unknown, value: boolean|string): void;
}
