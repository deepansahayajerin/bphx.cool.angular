import { FormControl } from "@angular/forms";

/**
 * Gets a node name.
 * @paramelement a DOM element.
 * @returns an element name converted to lower case.
 */
export function nodeName(element: Element): string
{
  return element?.nodeName.toLowerCase();
}

/**
 * Tests whether a DOM element represents text input.
 * @param element a DOM element to check.
 * @param inputOnly to consider input elements only.
 * @returns `true` if element represents text input, and
 *   `false` otherwise.
 */
export function isInputText(element: Element, inputOnly?: boolean): boolean
{
  switch(nodeName(element))
  {
    case "input":
    {
      const input = element as HTMLInputElement;

      switch(input.type.toLowerCase())
      {
        case "hidden":
        case "range":
        case "color":
        case "checkbox":
        case "radio":
        case "file":
        {
          return false;
        }
        default:
        {
          return true;
        }
      }
    }
    case "textarea":
    {
      return !inputOnly;
    }
    default:
    {
      return false;
    }
  }
}

/**
 * Tests whether a DOM element is a button.
 * @param element a DOM element to check.
 * @returns `true` if element is a button, and
 *   `false` otherwise.
 */
export function isButton(element: Element): boolean
{
  return element?.matches(
    "button,input[type=button],input[type=submit],input[type=reset]") === true;
}

/**
 * Tests whether a DOM element supports readonly property.
 * @param element a DOM element to check.
 * @returns `true` if element supports readonly property, and
 *   `false` otherwise.
 */
export const supportsReadonly = isInputText;

/**
 * Tests whether the DOM element is readonly.
 * @param element `true` if element is readonly, and
 *   `false` otherwise.
 */
export function isReadonly(element: HTMLElement): boolean
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((element as any)?.readOnly == true) ||
    toBoolean(element?.getAttribute("coolReadonly"));
}

/**
 * Tests whether a DOM element represents radio button.
 * @param element a DOM element to check.
 * @returns `true` if element represents radio button, and
 *   `false` otherwise.
 */
export function isRadio(element: Element): boolean
{
  return (nodeName(element) === "input") &&
    ((element as HTMLInputElement).type.toLowerCase() === "radio");
}

/**
 * Tests whether a DOM element represents html select.
 * @param element a DOM element to check.
 * @returns `true` if element represens html select, and
 *   `false` otherwise.
 */
export function isSelect(element: Element): boolean
{
  return nodeName(element) === "select";
}

/**
 * Tests whether a DOM element is focusable by default.
 * @param element a DOM element to check.
 * @returns `true` if element is focusable, and
 *   `false` otherwise.
 */
export function focusable(element: Element): boolean
{
  switch(nodeName(element))
  {
    case "input":
    case "select":
    case "textarea":
    case "a":
    case "button":
    {
      return true;
    }
    default:
    {
      return false;
    }
  }
}

/**
 * Tests whether the element is visible.
 * @param element - an element to test.
 * @returns `true` if element is visible, and false otherwise.
 */
export function isVisible(element: HTMLElement): boolean
{
  return element &&
    !!(element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length);
}

/**
 * Tests whether the element is disabled.
 * @param element - a DOM element to check.
 * @returns `true` if element is disabled, and
 *   `false` otherwise.
 */
export function isDisabled(element: Element): boolean
{
  return !element || element.matches("[disabled] *,[disabled]");
}

/**
 * Gets an array of elements in tab order under the scope element.
 * @param element - a scope DOM element.
 * @param filter - optional filter function receiving element
 *   and returning boolean: true to accept value, and false to reject.
 * @returns an array of DOM elements in tab oder.
 */
export function elementsInTabOrder(
  element: HTMLElement,
  filter?: (item: Element) => boolean): HTMLElement[]
{
  const list = element.querySelectorAll(
    "input:not([readonly]),button,select,textarea," +
    "[tabindex]:not([tabindex='-1']):not(input)," +
    "a[href]:not([tabindex='-1'])," +
    "area[href]:not([tabindex='-1'])," +
    "iframe,object,embed,*[contenteditable=true]");

  const elements: HTMLElement[] = [];
  const radios = {};

  Array.prototype.forEach.call(list, (item: HTMLElement) =>
  {
    if (filter ? !filter(item) :
      !isVisible(item) ||
      isDisabled(item) ||
      (item.tabIndex < 0))
    {
      return;
    }

    if (isRadio(item))
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const name = (item as any).name;
      const index = radios[name];

      if (index === undefined)
      {
        radios[name] = elements.length;
        elements.push(item);
      }
      else
      {
        const radio = elements[index];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(radio as any).checked && (item as any).checked)
        {
          elements[index] = item;
        }
      }
    }
    else
    {
      elements.push(item);
    }
  });

  return elements.sort((e1, e2) =>
  {
    const e1Toolbar = e1.matches("[coolType=TOOLBAR] *");
    const e2Toolbar = e2.matches("[coolType=TOOLBAR] *");

    if (e1Toolbar !== e2Toolbar)
    {
      return e1Toolbar ? 1 : -1;
    }

    if (e1.tabIndex !== e2.tabIndex)
    {
      return e1.tabIndex ? e1.tabIndex - e2.tabIndex : e2.tabIndex;
    }

    return e1.compareDocumentPosition(e2) & 2 ? 1 : -1;
  });
}

/**
 * Tests whether a DOM element represents a MENUITEM.
 * @param element - a DOM element to check.
 * @param elementOnly truthy value to match element as
 *   a menu item; otherwise descendants are also considered as menu items.
 * @returns `true` if element represens a MENUITEM, and
 *   `false` otherwise.
 */
export function isMenuItem(element: Element, elementOnly?: boolean): boolean
{
  return element &&
    (elementOnly ? element.matches("[coolType=MENUITEM]") :
      element.matches("[coolType=MENUITEM],[coolType=MENUITEM] *"));
}

/**
 * Converts value to css color.
 * @param value - a value to convert.
 * @returns css color value.
 */
export function toColor(value: string|number): string
{
  if (value == null)
  {
    return null;
  }

  if (typeof value === "string")
  {
    if (!value || value.match(/[^0-9A-Fa-f]/))
    {
      return null;
    }
  }
  else
  {
    if (value < 0)
    {
      return;
    }

    value = (value & 0xffffff).toString(16);
  }

  const strValue = "000000" + value;

  return "#" + strValue.substring(strValue.length - 6);
}

/**
 * Converts BRG color value into RGB.
 * @param value - a value to convert.
 * @return a RGB value.
 */
export function bgr(value: number): number
{
  return !value || (value < 0) ? value :
    ((value & 0xff) << 16) | (value & 0xff00) | ((value & 0xff0000) >> 16);
}

/**
 * Converts value to boolean.
 * @param value a value to convert.
 * @returns  a boolean value.
 */
export function toBoolean(value: unknown): boolean
{
  switch(typeof(value))
  {
    case "boolean":
    {
      return value;      
    }
    case "number":
    {
      return !!value;      
    }
    default:
    {
      return (value != null) && (value !== "0") && (value !== "false");
    }
  }
}

/**
 * Returns the first index at which a given element can be found in the
 * array, or -1 if it is not present.
 *
 * Operator ```==``` is used for the comparison.
 * @param items an array to search.
 * @param item an element to search.
 * @return index in the array, or -1 if no item is present
 *   in the array.
 */
export function indexOf(items: unknown[], item: unknown): number
{
  if (items)
  {
    for(let i = 0; i < items.length; ++i)
    {
      if (items[i] == item)
      {
        return i;
      }
    }
  }

  return -1;
}

/**
 * Sets errors for the control.
 * @param control a form control.
 * @param errors errors object.
 */
export function setErrors(control: FormControl, errors: unknown): void
{
  control?.setErrors(errors && Object.keys(errors).length ? errors : null);
}

export type DateView = string|Date|{ year: number, month: number, day: number }|null;

export function toDateString(value: DateView): string 
{
  if (value == null) 
  {
    return null;
  }

  if (typeof value === "string")
  {
    return value;
  }

  const isDate = value instanceof Date;

  if (isDate && isNaN(value.getTime()))
  {
    return null;
  }

  const { year, month, day } = isDate ?
    { 
      year: value.getUTCFullYear(), 
      month: value.getUTCMonth() + 1, 
      day: value.getUTCDate() 
    } :
    value;

  return year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
}
