import { Pipe, PipeTransform, Optional, Inject } from "@angular/core";
import { Locale, LOCALE_ACCESSOR } from "../api/locale";
import { formatString } from "../api/formatters/format-string";

@Pipe({ name: "coolString" })
export class StringPipe implements PipeTransform
{
  /**
   * Creates a date pipe.
   * @param locale a locale instance.
   */
  constructor(@Optional() @Inject(LOCALE_ACCESSOR) private locale?: Locale)
  {
  }

  /**
   * Formats the string value.
   * @param value a value to format.
   * @param pattern a string pattern that determines an output format.
   *
   *    **Note:**  characters "X" and "x" are used as a placeholder and any
   *      alphanumeric characters will be accepted in a specified position.
   *      Using any other characters from a list will limit a character
   *      input at that position to allow only a character specified.
   * @param rightAlignment determines text alignment.
   * @returns the formatted string.
   */
  transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    pattern: string,
    rightAlignment?: boolean): string
  {
    return formatString(value, pattern, rightAlignment, this.locale);
  }
}
