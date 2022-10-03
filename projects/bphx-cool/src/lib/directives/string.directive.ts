import
{
  Directive,
  Optional,
  HostListener,
  ElementRef,
  Injector,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Inject
} from "@angular/core";

import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from "@angular/forms";
import { LOCALE_ACCESSOR, Locale } from "../api/locale";
import { parseString } from "../api/parsers/parse-string";
import { formatString } from "../api/formatters/format-string";
import { isReadonly, setErrors } from "../api/utils";

@Directive(
{
  selector:
    "input[coolString][ngModel],textarea[coolString][ngModel]," +
    "input[coolUpper][ngModel],textarea[coolUpper][ngModel]," +
    "input[coolLower][ngModel],textarea[coolLower][ngModel]",
  providers:
  [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StringDirective,
      multi: true
    }
  ]
})
export class StringDirective implements OnInit, OnChanges, ControlValueAccessor
{
  @Input()
  coolString?: string;

  @Input()
  coolUpper?: boolean;

  @Input()
  coolLower?: boolean;

  model: NgModel;

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
    this.touchedFn?.();
  }

  /**
   * Creates a {@link StringDirective} instance.
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
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if ("coolString" in changes)
    {
      const pattern = this.coolString;

      if (pattern && pattern.length)
      {
        this.element.nativeElement.
          setAttribute("maxlength", String(pattern.length));
      }
    }
  }

  change(): void
  {
    const locale = this.locale;
    const pattern = this.coolString;
    const value = this.element.nativeElement.value;

    let result =  parseString(
      /\s/g.test(pattern) ? value.trim() : value,
      pattern,
      false,
      locale);

    if (result)
    {
      if (this.isUpper())
      {
        result = result.toUpperCase();
      }
      else if (this.isLower())
      {
        result = result.toLowerCase();
      }
      // No more cases
    }

    this.changeFn?.(result);

    let errors = this.model.control.errors;

    if (result === undefined)
    {
      if (!errors)
      {
        errors = { coolString: { pattern: this.coolString } };
      }
      else
      {
        errors.coolString = { pattern: this.coolString };
      }
    }
    else
    {
      if (errors)
      {
        delete errors.coolString;
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
    const pattern = this.coolString;
    const input = value == null ? "" : value.toString();
    const trimmed = input.replace(/\s+$/g, "");
    const converted = this.isUpper() ? trimmed.toUpperCase() :
      this.isLower() ? trimmed.toLowerCase() : trimmed;
    const viewValue = formatString(converted, pattern, false, locale);

    if ((converted != null) && (input !== converted) && !isReadonly(element))
    {
      Promise.resolve().then(() => this.changeFn?.(converted));
    }

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

  private isUpper(): boolean
  {
    const value: unknown = this.coolUpper;

    return (value === true) || (value === "");
  }

  private isLower(): boolean
  {
    const value: unknown = this.coolLower;

    return (value === true) || (value === "");
  }

  private lastViewValue: string;
  private changeFn: (value: unknown) => void;
  private touchedFn: () => void;
}
