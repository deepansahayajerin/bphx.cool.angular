import { Pipe, PipeTransform, Optional, Inject } from "@angular/core";
import { Locale, LOCALE_ACCESSOR } from "../api/locale";
import { formatNumber } from "../api/formatters/format-number";

/**
 * A pipe to format number.
 */
@Pipe({ name: "coolNumber" })
export class NumberPipe implements PipeTransform
{
  /**
   * Creates a date pipe.
   * @param locale a locale instance.
   */
  constructor(@Optional() @Inject(LOCALE_ACCESSOR) private locale?: Locale)
  {
  }

  /**
   * Formats the number value.
   * @param value a numeric string or a number value to format.
   * @param pattern a custom formatting pattern which determines how the
   *   number string should be formatted.
   *
   * **Note:** edit pattern may contain only '$', '#', '-', ',', 'Z', 'z', '0',
   * '9' and '.' characters. Where '#', 'Z' and 'z' are place holders for
   * leading decimal numbers that may be suppressed. '0' or '9' are place
   * holders for mandatory decimal numbers.
   * @param blankWhenZero determines whether the zero values will be suppressed.
   * @returns the formatted number as a string value.
   */
  transform(
    value: string|number,
    pattern: string,
    blankWhenZero?: boolean|number): string
  {
    return formatNumber(value, pattern, blankWhenZero, this.locale);
  }
}
