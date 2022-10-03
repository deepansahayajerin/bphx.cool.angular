import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

/**
 * A directive to encode checkbox checked to a model value.
 */
@Directive(
{
  selector: "input[type=checkbox][coolTrue],input[type=checkbox][coolFalse]",
  providers:
  [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TrueFalseValueDirective,
      multi: true,
    }
  ]
})
export class TrueFalseValueDirective implements ControlValueAccessor
{
  /**
   * A model value that corresponds to the checked state.
   */
  @Input()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coolTrue: any = true;

  /**
   * A model value that corresponds to unchecked state.
   */
  @Input()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coolFalse: any = false;

  /**
   * Creates a `TrueFalseValueDirective` instance.
   * @param elementRef a checkbox reference.
   */
  constructor(private elementRef: ElementRef<HTMLInputElement>)
  {
  }

  /**
   * Listens checkbox change event and calls a change callback.
   */
  @HostListener("change")
  change(): void
  {
    if (this.onChange)
    {
      this.onChange(this.elementRef.nativeElement.checked ?
        this.coolTrue : this.coolFalse);
    }
  }

  /**
   * Listens blur event and calls touched callback.
   */
  @HostListener("blur")
  blur(): void
  {
    if (this.onTouched)
    {
      this.onTouched();
    }
  }

  /**
   * Sets checkbox checked value.
   * @param value a model value.
   */
  writeValue(value: unknown): void
  {
    if (value != null)
    {
      switch(typeof value)
      {
        case "string":
        {
          if (this.coolTrue != null)
          {
            this.coolTrue = String(this.coolTrue);
          }

          if (this.coolFalse != null)
          {
            this.coolFalse = String(this.coolFalse);
          }

          break;
        }
        case "number":
        {
          if (this.coolTrue != null)
          {
            this.coolTrue = Number(this.coolTrue);
          }

          if (this.coolFalse != null)
          {
            this.coolFalse = Number(this.coolFalse);
          }

          break;
        }
        case "boolean":
        {
          if (this.coolTrue != null)
          {
            this.coolTrue = Boolean(this.coolTrue);
          }

          if (this.coolFalse != null)
          {
            this.coolFalse = Boolean(this.coolFalse);
          }

          break;
        }
      }
    }

    this.elementRef.nativeElement.checked = value == this.coolTrue;
  }

  /**
   * Registers change callback.
   * @param fn a change callback.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: (value: any) => void): void
  {
    this.onChange = fn;
  }

  /**
   * Registers a touched callback.
   * @param fn a touched callback.
   */
  registerOnTouched(fn: () => void): void
  {
    this.onTouched = fn;
  }

  /**
   * Sets a disabled state.
   * @param isDisabled a disabled state.
   */
  setDisabledState(isDisabled: boolean): void
  {
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  /**
   * A change callback.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onChange: (value: any) => void;

  /**
   * Touch callback.
   */
  private onTouched: () => void;
}
