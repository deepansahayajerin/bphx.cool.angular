import { Pipe, PipeTransform, Optional, Inject } from "@angular/core";
import { Locale, LOCALE_ACCESSOR } from "../api/locale";
import { formatDate } from "../api/formatters/format-date";

/**
 * A pipe to format date and time.
 */
@Pipe({ name: "coolDate" })
export class DatePipe implements PipeTransform
{
  /**
   * Creates a date pipe.
   * @param locale a locale instance.
   */
  constructor(@Optional() @Inject(LOCALE_ACCESSOR) private locale?: Locale)
  {
  }

  /**
   * Formats value as date or time string.
   * @param value a value to format.
   * @param pattern a custom formatting pattern which determines how
   *   the date should be formatted.
   *
   *    **Note:**  edit pattern may contain only 'H', 'm', 's', 'z', 'd', 'M'
   *           characters for date and time format. There are 'T' and 'Z'
   *           control characters.
   * @param blankWhenZero determines whether the zero date/time values will
   *   be suppressed.
   * @returns  the formatted date/time/timestamp value as a formatted string.
   */
  transform(
    value: string|Date,
    pattern: string,
    blankWhenZero?: boolean): string
  {
    return formatDate(
      value,
      pattern || "yyyy-MM-dd",
      blankWhenZero,
      this.locale);
  }
}
