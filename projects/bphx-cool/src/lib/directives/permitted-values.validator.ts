import { Directive, Input, ElementRef } from "@angular/core";
import { OnChanges, SimpleChanges } from "@angular/core";
import { Validator, NG_VALIDATORS } from "@angular/forms";
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { isReadonly, isVisible } from "../api/utils";

@Directive(
{
  selector: "input[type=text][coolPermittedValues]",
  providers:
  [
    {
      provide: NG_VALIDATORS,
      useExisting: PermittedValuesValidator,
      multi: true
    }
  ]
})
export class PermittedValuesValidator implements Validator, OnChanges
{
  /**
   * A list of permitted values.
   */
  @Input()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coolPermittedValues: any[];

  /**
   * Creates a {@link PermittedValuesValidator} instance.
   * @param element an element reference.
   */
  constructor(private element: ElementRef<HTMLInputElement>)
  {
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if ("coolPermittedValues" in changes)
    {
      if (this.onChange)
      {
        this.onChange();
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors
  {
    if (!control.dirty)
    {
      return null;
    }

    const value = control.value;

    if ((value == null) || (value === ""))
    {
      return null;
    }

    if (control.disabled ||
      isReadonly(this.element.nativeElement) ||
      !isVisible(this.element.nativeElement))
    {
      return null;
    }

    const values = this.coolPermittedValues;

    if (!Array.isArray(values))
    {
      return null;
    }

    for(const item of values)
    {
      if (Array.isArray(item) ?
        (value >= item[0]) && (value <= item[1]) :
        value === item)
      {
        return null;
      }
    }

    return { coolPermittedValues: { pattern: `"${values.join("\", \"")}"` } };
  }

  registerOnValidatorChange?(value: () => void): void
  {
    onchange = value;
  }

  private onChange: () => void;
}
