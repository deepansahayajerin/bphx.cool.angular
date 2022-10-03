import { Directive, ElementRef, ContentChild, AfterContentInit } from "@angular/core";
import { NgModel, RequiredValidator } from "@angular/forms";
import { ModelAccessor, MODEL_ACCESSOR } from "../api/model-accessor";

@Directive(
{
  selector: "[coolType=CHKBOX]:not([ngModel]),[coolType=RDBTNOC]:not([ngModel])]",
  providers:
  [
    {
      provide: MODEL_ACCESSOR,
      useExisting: NestedModelAccessorDirective
    }
  ]
})
export class NestedModelAccessorDirective implements ModelAccessor, AfterContentInit
{
  @ContentChild(NgModel, { static: true })
  model: NgModel|null;

  @ContentChild(NgModel, { static: true, read: ElementRef })
  element: ElementRef<HTMLElement>|null;

  @ContentChild(NgModel, { static: true, read: RequiredValidator })
  requiredValidator?: RequiredValidator|null;

  /**
   * Original tabindex.
   */
  tabIndex: number|null;

  /**
   * Initial model value.
   */
  initialValue?: unknown;

  /**
   * Current model value.
   */
  get value(): unknown
  {
    const element = this.element.nativeElement;

    if (element instanceof HTMLInputElement)
    {
      switch(element.type)
      {
        case "checkbox":
        case "radio":
        {
          return element.checked ? "on" : "off";
        }
      }
    }

    const value = this.model?.value;

    return value?.$editable ? value.item : value;
  }

  ngAfterContentInit(): void
  {
    this.tabIndex = this.element?.nativeElement.tabIndex;
    this.ready?.();
  }

  /**
   * Register a handler called on model change.
   * @param fn a function to call on change.
   */
  onReady(fn: () => void): void
  {
    this.ready = fn;
  }

  /**
   * Ready function, if any.
   */
  private ready: () => void;
}
