import { ModelAccessor } from "../api/model-accessor";
import { Directive, Self, ElementRef, Optional, OnInit } from "@angular/core";
import { NgModel, RequiredValidator } from "@angular/forms";
import { MODEL_ACCESSOR } from "../api/model-accessor";

@Directive(
{
  selector: "[coolType][ngModel]",
  providers:
  [
    {
      provide: MODEL_ACCESSOR,
      useExisting: DefaultModelAccessorDirective
    }
  ]
})
export class DefaultModelAccessorDirective
  implements ModelAccessor, OnInit
{
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
    const value = this.model?.value;

    return value?.$editable ? value.item : value;
  }

  constructor(
    @Self() public element: ElementRef<HTMLElement>,
    @Self() public model: NgModel,
    @Self() @Optional()
    public requiredValidator?: RequiredValidator|null)
  {
    this.tabIndex = element.nativeElement.tabIndex;
  }

  ngOnInit(): void
  {
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
