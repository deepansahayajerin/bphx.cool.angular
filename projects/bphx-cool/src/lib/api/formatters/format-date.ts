import { Locale } from "../locale";

const defaultShortMonths =
[
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats the date value.
 * @param value  date-time string in ISO format to format.
 * @param pattern a custom formatting pattern which determines how
 *   the date should be formatted.
 *
 *    **Note:**  edit pattern may contain only 'H', 'm', 's', 'z', 'd', 'M'
 *           characters for date and time format. There are 'T' and 'Z'
 *           control characters.
 * @param blankWhenZero determines whether the zero date/time values will
 *   be suppressed.
 * @param locale opional locale.
 * @returns  the formatted date/time/timestamp value as a formatted string.
 */
export function formatDate(
  value: string|Date,
  pattern: string,
  blankWhenZero?: boolean,
  locale?: Locale): string
{
  if (!value)
  {
    return "";
  }

  if (value instanceof Date)
  {
    value = value.toISOString();
  }

  if (!pattern)
  {
    pattern = "yyyy-MM-dd";
  }

  let type = "date";

  if (/[dMy]+/g.test(pattern))
  {
    if (/[Hhmsz]+/g.test(pattern))
    {
      type = "timestamp";
    }
  }
  else if (/[Hhmsz]+/g.test(pattern))
  {
    type = "time";
  }
  else
  {
    return "";
  }

  if (blankWhenZero)
  {
    if ((type === "time") && /^00:00:00([.][0]+[Z]?)?$/g.test(value))
    {
      return "";
    }
    else if ((type === "date") &&
      /^0001-01-01((T|\s)00:00:00([.][0]+[Z]?)?)?$/g.test(value))
    {
      return "";
    }
    else if ((type === "timestamp") &&
      /^0001-01-01((T|\s)00:00:00([.][0]+[Z]?)?)$/g.test(value))
    {
      return "";
    }
  }

  let datetimeStr = (type === "time") && (value.indexOf("T") === -1) ?
    "0001-01-01T" + value : value;

  if (datetimeStr.indexOf("T") === -1)
  {
    datetimeStr += "T00:00:00.000Z";
  }

  const part = datetimeStr.split(/\D/);
  const date = new Date(
    part[0] + "-" + part[1] + "-" + part[2] + "T" +
    (part[3] || "00") + ":" + (part[4] || "00") + ":" + (part[5] || "00") +
    "." + (part[6] || "000") + "Z");

  return pattern.replace(
    /yyyy|yy|MMM|MM|dd|HH|hh|mm|ss|z{1,6}/g,
    item =>
    {
      switch(item)
      {
        case "yyyy":
        {
          return (10000 + date.getUTCFullYear() % 10000).toString().
            substring(1, 5);
        }
        case "yy":
        {
          return (100 + date.getUTCFullYear() % 100).toString().substring(1, 3);
        }
        case "MM":
        {
          return (101 + date.getUTCMonth()).toString().substring(1, 3);
        }
        case "MMM":
        {
          const shortMonths =
            (locale && locale.shortMonths) || defaultShortMonths;

          return shortMonths[date.getUTCMonth()];
        }
        case "dd":
        {
          return (100 + date.getUTCDate()).toString().substring(1, 3);
        }
        case "HH":
        {
          return (100 + date.getUTCHours()).toString().substring(1, 3);
        }
        case "hh":
        {
          return (100 + date.getUTCHours() % 12).toString().substring(1, 3);
        }
        case "mm":
        {
          return (100 + date.getUTCMinutes()).toString().substring(1, 3);
        }
        case "ss":
        {
          return (100 + date.getUTCSeconds()).toString().substring(1, 3);
        }
        case "z":
        case "zz":
        case "zzz":
        case "zzzz":
        case "zzzzz":
        case "zzzzzz":
        {
          const s = "000000" + part[6];

          return s.substring(s.length - item.length, s.length);
        }
      }
    });
}
