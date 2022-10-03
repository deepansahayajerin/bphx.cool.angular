import { Locale } from "../locale";

/**
 * Parses a string value according to the pattern.
 * @param value a formatted string.
 * @param pattern a string pattern that determines an output format.
 *    **Note:**  characters "X" and "x" are used as a placeholder and any
 *           alphanumeric characters will be accepted in a specified position.
 *           Using any other characters from a list will limit a character
 *           input at that position to allow only a character specified.
 * @param rightAlignment determines text alignment.
 * @param locale - opional locale.
 * @returns the parsed string.
 */
export function parseString(
  value: string,
  pattern: string,
  rightAlignment?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale?: Locale): string
{
  if (!pattern)
  {
    return value;
  }

  let result = "";
  let i = 0;
  let j = 0;
  const patternLen = pattern.length;

  const valueLen = !value ? 0 :
    (value = rightAlignment ?
      value.replace(/^\s+/g, "") : value.replace(/\s+$/g, "")).length;

  while(i < valueLen)
  {
    if (j >= patternLen)
    {
      break;
    }

    const c = value.charAt(i);
    const patternChr = pattern.charAt(j);

    switch(patternChr)
    {
      case "X":
      case "x":
      {
        result += c;

        i++;
        j++;

        break;
      }
      case "B":
      {
        if (c === " ")
        {
          i++;
        }

        j++;

        break;
      }
      default:
      {
        if (c === patternChr)
        {
          i++;
        }

        j++;

        break;
      }
    }
  }

  return result;
}
