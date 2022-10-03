import { Directive, Optional, HostListener } from "@angular/core";
import { Injector, Inject, Input } from "@angular/core";
import { OnInit, OnChanges, SimpleChanges, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from "@angular/forms";
import { parseNumber } from "../api/parsers/parse-number";
import { formatNumber } from "../api/formatters/format-number";
import { LOCALE_ACCESSOR, Locale } from "../api/locale";
import { isReadonly, setErrors } from "../api/utils";

@Directive(
{
  selector: "input[coolNumber][ngModel]",
  providers:
  [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberDirective,
      multi: true
    }
  ]
})
export class NumberDirective implements OnInit, OnChanges, ControlValueAccessor
{
  @Input()
  coolNumber?: string;

  @Input()
  coolBlankWhenZero?: boolean;

  model: NgModel;

  @HostListener("paste")
  onPaste(): void
  {
    this.paste = true;
  }

  @HostListener("change")
  onChange(): void
  {
    this.change();
  }

  @HostListener("input")
  onInput(): void
  {
    this.change();
  }

  @HostListener("blur")
  onBlur(): void
  {
    if (this.touchedFn)
    {
      this.touchedFn();
    }
  }

  /**
   * Creates a {@link NumberDirective} instance.
   * @param injector an injector instance.
   * @param element an element reference.
   * @param locale a locale instance.
   */
  constructor(
    private injector: Injector,
    private element: ElementRef<HTMLInputElement>,
    @Optional() @Inject(LOCALE_ACCESSOR) private locale?: Locale)
  {
  }

  ngOnInit(): void
  {
    this.model = this.injector.get(NgModel);
    this.lastViewValue = this.element.nativeElement.value;
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if ("coolNumber" in changes)
    {
      const pattern = this.coolNumber;

      if (pattern && pattern.length)
      {
        const pos = pattern.indexOf(";");

        this.element.nativeElement.setAttribute(
          "maxlength",
          String(pos < 0 ? pattern.length :
            pattern.substring(pos + 1) === "#" ? pos : pos + 1));
      }
    }
  }

  change(): void
  {
    const locale = this.locale;
    const pattern = this.coolNumber;
    const blankWhenZero = this.isBlankWhenZero();
    const value = this.element.nativeElement.value;
    const pasted = this.paste;

    this.paste = false;

    const result =  parseNumber(
      /\s/g.test(pattern) ? value.trim() : value,
      pattern,
      blankWhenZero,
      locale,
      pasted);

    if ((result === undefined) && value && pattern)
    {
      if (!pasted)
      {
        let allowedChars = "0123456789" +
          ((locale && locale.decimalPoint) || ".");

        for(const c of pattern)
        {
          let chr = "0";

          switch(c)
          {
            case "z":
            case "Z":
            case "#":
            case "0":
            case "9":
            case ".":
            case ";":
            {
              // this is a number placeholder or pattern separator,
              break;
            }
            case "-":
            {
              chr = "+-";

              break;
            }
            case "$":
            {
              chr = (locale && locale.currencySign) || "$";

              break;
            }
            case ",":
            {
              chr = (locale && locale.groupSeparator) || ",";

              break;
            }
            default:
            {
              chr = c;

              break;
            }
          }

          if (allowedChars.indexOf(chr) < 0)
          {
            allowedChars += chr;
          }
        }

        for(const c of value)
        {
          if (allowedChars.indexOf(c) >= 0)
          {
            continue;
          }

          this.element.nativeElement.value = this.lastViewValue;

          return;
        }
      }
    }

    this.lastViewValue = value;
    this.changeFn?.(result);

    let errors = this.model.control.errors;

    if (result === undefined)
    {
      if (!errors)
      {
        errors = { coolNumber: { pattern: this.coolNumber } };
      }
      else
      {
        errors.coolNumber = { pattern: this.coolNumber };
      }
    }
    else
    {
      if (errors)
      {
        delete errors.coolNumber;
      }
    }

    if (errors)
    {
      delete errors.required;
      delete errors.maxlength;
    }

    setErrors(this.model.control, errors);
  }

  writeValue(value: unknown): void
  {
    const element = this.element.nativeElement;
    const locale = this.locale;
    const pattern = this.coolNumber;
    const blankWhenZero = this.isBlankWhenZero();
    const input = value == null ? null :
      typeof value === "number" ? value : String(value);
    const viewValue = formatNumber(input, pattern, blankWhenZero, locale);

    if ((input != null) && !isReadonly(element))
    {
      const parsed = parseNumber(viewValue, pattern, blankWhenZero, locale);

      if (parsed && (parsed !== input))
      {
        Promise.resolve().then(() => this.changeFn?.(parsed));
      }
    }

    this.lastViewValue = viewValue;
    element.value = viewValue == null ? "" : viewValue;
  }

  registerOnChange(fn: (value: unknown) => void): void
  {
    this.changeFn = fn;
  }

  registerOnTouched(fn: () => void): void
  {
    this.touchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void
  {
    this.element.nativeElement.disabled = isDisabled;
  }

  private isBlankWhenZero(): boolean
  {
    const value: unknown = this.coolBlankWhenZero;

    return (value === true) || (value === "");
  }

  private lastViewValue: string;
  private changeFn: (value: unknown) => void;
  private touchedFn: () => void;
  private paste = false;
}
