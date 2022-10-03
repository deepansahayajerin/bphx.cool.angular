import { RowDirective } from "./row.directive";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { ContentChildren, Directive, ElementRef, QueryList } from "@angular/core";

/**
 * Model accessor for a standard list.
 */
@Directive(
{
  selector: "[coolBody][ngModel]",
  providers:
  [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ListAccessorDirective,
      multi: true
    }
  ]
})
export class ListAccessorDirective implements ControlValueAccessor
{
  /**
   * A list of rows.
   */
  @ContentChildren(RowDirective, {descendants: true})
  rows: QueryList<RowDirective>;


  /**
   * Creates a model accessor.
   * @param element an element instance.
   */
  constructor(private element: ElementRef<HTMLElement>)
  {
  }

  writeValue(value: unknown): void
  {
    const items = value == null ? [] : Array.isArray(value) ? value : [value];
    const map: { [key: number]: boolean } = {};

    items.forEach(item =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map[typeof item === "number" ?  item : (item as any).index] = true);

    this.rows?.forEach(row =>
      row.element.nativeElement.classList.
        toggle("selected", map[row.coolRow] ?? false));
  }

  setDisabledState?(isDisabled: boolean): void
  {
    if (isDisabled)
    {
      this.element.nativeElement.setAttribute("disabled", "disabled");
    }
    else
    {
      this.element.nativeElement.removeAttribute("disabled");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerOnChange(): void { }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerOnTouched(): void { }
}
