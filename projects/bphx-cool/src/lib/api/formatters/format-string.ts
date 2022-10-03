import { Locale } from "../locale";

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
 * @param locale opional locale.
 * @returns the formatted string.
 */
export function formatString(
  value: unknown,
  pattern: string,
  rightAlignment?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale?: Locale): string
{
  if (value == null)
  {
    return "";
  }

  const trimRegex = rightAlignment ? /^\s+/g : /\s+$/g;
  const stringValue = value.toString().replace(trimRegex, "");

  if (!pattern || (stringValue.length === 0))
  {
    return stringValue;
  }

  let patternLength = pattern.length;

  if ((pattern.startsWith("'") && pattern.endsWith("'")) ||
    (pattern.startsWith("\"") && pattern.endsWith("\"")))
  {
    pattern = pattern.substring(1, patternLength - 1);
    patternLength -= 2;
  }

  const bufferLength = stringValue.length;
  const patternArray = pattern.split("");
  const stringArray = stringValue.split("");

  if (rightAlignment)
  {
    for (let i = patternLength - 1, j = bufferLength - 1; i >= 0; i--)
    {
      const c = j < 0 ? " " : stringArray[j];
      const ptrn = patternArray[i];

      if ((ptrn === "X") || (ptrn === "x"))
      {
        patternArray[i] = c;
        j--;
      }
    }
  }
  else
  {
    for (let i = 0, j = 0; i < patternLength; i++)
    {
      const c = j < bufferLength ? stringArray[j] : " ";
      const ptrn = patternArray[i];

      if ((ptrn === "X") || (ptrn === "x"))
      {
        patternArray[i] = c;
        j++;
      }
    }
  }

  return patternArray.join("");
}
