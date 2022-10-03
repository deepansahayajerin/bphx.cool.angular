import { Locale } from "../locale";

const defaultShortMonths =
[
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
];

const defaultCenturyOffset = 1950;

/**
 * Parses a string value as date.
 * @param value a formatted date string.
 * @param pattern a custom formatting pattern which determines how
 *   the date should be formatted.
 *
 *    **Note:**  edit pattern may contain only 'H', 'm', 's', 'z', 'd', 'M'
 *           characters for date and time format. There are 'T' and 'Z'
 *           control characters.
 * @param blankWhenZero determines whether the zero date/time
 *   values will be suppressed.
 * @param locale - optional locale.
 * @returns a date-time string in ISO format.
 */
export function parseDate(
  value: string,
  pattern: string,
  blankWhenZero?: boolean,
  locale?: Locale): string
{
  if (!value)
  {
    return null;
  }

  if (!pattern)
  {
    pattern = "yyyy-MM-dd";
  }

  const containsSpace = new RegExp("\\s", "g");

  if (containsSpace.test(value))
  {
    if (!containsSpace.test(pattern))
    {
      return undefined;
    }
  }

  const test =
    pattern.replace(/MMM/g, "\\S+").replace(/y|M|m|d|H|h|s|z/g, "\\d");
  const re = new RegExp(test, "g");

  if (!re.test(value))
  {
    return undefined;
  }

  let year = 1;
  let month = 0;
  let day = 1;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let microseconds = "";
  let isDate = false;
  let isTime = false;
  let hasYear = false;
  const mask: boolean[] = [];

  pattern.replace(
    /yyyy|yy|MMM|MM|dd|HH|hh|mm|ss|z{1,6}|\/|\\|:|./g,
    (item, pos) =>
    {
      const len = item.length;
      const str = value.substring(pos, pos + len);

      for(let i = 0; i < len; ++i)
      {
        mask[pos + i] = true;
      }

      switch (item)
      {
        case "yyyy":
        {
          year = parseInt(str, 10);
          isDate = true;
          hasYear = true;

          break;
        }
        case "yy":
        {
          const centuryOffset =
            locale?.centuryOffset || defaultCenturyOffset;

          year = centuryOffset - (centuryOffset % 100) + parseInt(str, 10);

          if ((centuryOffset != null) && (year < centuryOffset))
          {
            year += 100;
          }

          isDate = true;
          hasYear = true;

          break;
        }
        case "MM":
        {
          month = parseInt(str, 10) - 1;
          isDate = true;

          break;
        }
        case "MMM":
        {
          const name = str.toLowerCase();

          const shortMonths =
            ((locale && locale.shortMonths as string[]) || defaultShortMonths).
            map(m => m.toLowerCase());

          month = shortMonths.indexOf(name);
          isDate = true;

          break;
        }
        case "dd":
        {
          day = parseInt(str, 10);
          isDate = true;

          break;
        }
        case "HH":
        {
          hours = str.length === 0 ? 0 : parseInt(str, 10);
          isTime = true;

          break;
        }
        case "mm":
        {
          minutes = str.length === 0 ? 0 : parseInt(str, 10);
          isTime = true;

          break;
        }
        case "ss":
        {
          seconds = str.length === 0 ? 0 : parseInt(str, 10);
          isTime = true;

          break;
        }
        case "z":
        case "zz":
        case "zzz":
        case "zzzz":
        case "zzzzz":
        case "zzzzzz":
        {
          if (str.length !== 0)
          {
            const s = "000000" + parseInt(str, 10);

            microseconds = s.substring(s.length - len, s.length);
          }

          isTime = true;

          break;
        }
      }

      return "";
    });

  for(let i = 0; i < value.length; ++i)
  {
    if (!mask[i] && (value[i] > " "))
    {
      // Not all characters are consumed.
      return undefined;
    }
  }

  if (!hasYear)
  {
    year = new Date().getUTCFullYear();
  }

  const date = new Date(
    Date.UTC(year, month, day, hours, minutes, seconds));

  if ((year >= 0) && (year < 100))
  {
    date.setUTCFullYear(year);
  }

  if ((date.getUTCFullYear() !== year) ||
    (date.getUTCMonth() !== month) ||
    (date.getUTCDate() !== day) ||
    (date.getUTCHours() !== hours) ||
    (date.getUTCMinutes() !== minutes) ||
    (date.getUTCSeconds() !== seconds))
  {
    return undefined;
  }

  let result = date.toJSON();

  if (result.endsWith("Z"))
  {
    result = result.substring(0,  result.length - 1);
  }

  if (result.endsWith(".000"))
  {
    result = result.substring(0,  result.length - 4);
  }

  if (microseconds)
  {
    result += "." + microseconds;
  }

  return isDate === isTime ? result :
    isDate ? result.split("T")[0] : result.split("T")[1];
}
