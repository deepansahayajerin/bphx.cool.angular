import { Optional, ElementRef, Injector, Inject, SimpleChange, Self, SimpleChanges, OnChanges } from "@angular/core";
import { Directive, OnInit } from "@angular/core";
import { Input, HostListener } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel, MaxLengthValidator } from "@angular/forms";
import { Locale, LOCALE_ACCESSOR } from "../api/locale";
import { parseDate } from "../api/parsers/parse-date";
import { formatDate } from "../api/formatters/format-date";
import { isReadonly, setErrors, toDateString } from "../api/utils";

@Directive(
{
  selector: "input[coolDate][ngModel],input[coolTime][ngModel]",
  providers:
  [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DateDirective,
      multi: true
    }
  ]
})
export class DateDirective implements OnInit, OnChanges, ControlValueAccessor
{
  /**
   * Gets a date, or date and time format.
   */
  @Input()
  get coolDate(): string
  {
    return this.isTime ? null : this.format;
  }

  /**
   * Sets a date format.
   */
  set coolDate(value: string)
  {
    this.isTime = false;
    this.format = value;
  }

  /**
   * Gets a time format.
   */
  @Input()
  get coolTime(): string
  {
    return this.isTime ? this.format : null;
  }

  /**
   * Sets a time format.
   */
  set coolTime(value: string)
  {
    this.isTime = true;
    this.format = value;
  }

  /**
   * Get formatting pattern.
   */
  get pattern(): string
  {
    return this.format || (this.isTime ? "HH:mm:ss" : "yyyy-MM-dd");
  }

  @Input()
  coolBlankWhenZero?: boolean;

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
    if (this.touchedFn)
    {
      this.touchedFn();
    }

    if (!this.model.control.errors)
    {
      this.writeValue(this.model.model);
    }
  }

  /**
   * Creates a {@link DateDirective} instance.
   * @param injector an injector instance.
   * @param element an element reference.
   * @param maxlengthValidator optional maxlength validator.
   * @param locale a locale instance.
   */
  constructor(
    private injector: Injector,
    private element: ElementRef<HTMLInputElement>,
    @Optional() @Self()
    private maxlengthValidator: MaxLengthValidator,
    @Optional() @Inject(LOCALE_ACCESSOR) private locale?: Locale)
  {
  }

  ngOnInit(): void
  {
    this.model = this.injector.get(NgModel);
    this.lastViewValue = this.element.nativeElement.value;

    // Neutralize maxlength, if any.
    if (this.maxlengthValidator)
    {
      this.maxlengthValidator.maxlength = null;
      this.maxlengthValidator.
        ngOnChanges({ maxlength: new SimpleChange(null, null, false) });
    }
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if (("coolDate" in changes) || ("coolTime" in changes))
    {
      const element = this.element.nativeElement;
      const pattern = this.pattern;

      if (pattern?.indexOf("MMM") < 0)
      {
        element.setAttribute("maxlength", String(pattern.length));
      }
      else
      {
        element.removeAttribute("maxlength");
      }
    }
  }

  change(): void
  {
    const locale = this.locale;
    const pattern = this.pattern;
    const blankWhenZero = this.isBlankWhenZero();
    const value = this.element.nativeElement.value;
    const trimmed = value.trim();

    const result = !this.isTime && (trimmed === "=") ?
      // Special case of today date.
      toDateString(new Date()) :
      parseDate(
        /\s/g.test(pattern) ? trimmed : value,
        pattern,
        blankWhenZero,
        locale);

    if ((result === undefined) &&
      value &&
      pattern &&
      (pattern.indexOf("MMM") < 0))
    {
      for(const c of value)
      {
        if (((c >= "0") && (c <= "9")) ||
          ((pattern.indexOf(c) >= 0) &&
          (("yMdmHhsz").indexOf(c) < 0)))
        {
          continue;
        }

        this.element.nativeElement.value = this.lastViewValue;

        return;
      }

      if (value.length > pattern.length)
      {
        this.element.nativeElement.value = this.lastViewValue;

        return;
      }
    }

    this.lastViewValue = value;
    this.changeFn?.(result);

    let errors = this.model.control.errors;

    if (result === undefined)
    {
      if (!errors)
      {
        errors = {};
      }

      if (this.isTime)
      {
        delete errors.coolDate;
        errors.coolTime = { pattern };
      }
      else
      {
        errors.coolDate = { pattern };
        delete errors.coolTime;
      }
      // No more cases
    }
    else
    {
      if (errors)
      {
        delete errors.coolDate;
        delete errors.coolTime;
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
    const pattern = this.pattern;
    const blankWhenZero = this.isBlankWhenZero();
    const input = value instanceof Date ? value : value && String(value);
    const viewValue = formatDate(input, pattern, blankWhenZero, locale);

    if (!isReadonly(element) && input)
    {
      const parsed = parseDate(viewValue, pattern, blankWhenZero, locale);

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

  private format?: string;
  private isTime?: boolean;
  private lastViewValue: string;
  private changeFn: (value: unknown) => void;
  private touchedFn: () => void;
}
