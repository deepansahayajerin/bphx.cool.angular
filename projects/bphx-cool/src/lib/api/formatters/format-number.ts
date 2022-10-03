import { Locale } from "../locale";

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
 * @param locale optional locale.
 * @returns the formatted number as a string value.
 */
export function formatNumber(
  value: string|number,
  pattern: string,
  blankWhenZero?: boolean|number,
  locale?: Locale): string
{
  if (!pattern)
  {
    return value == null ? null : String(value);
  }

  let negativeValue = false;
  let currencyValue = "";
  let result = "";
  let decimalPoint = ".";
  let groupSeparator = ",";
  let currencySign = "$";

  if (!value)
  {
    result = "0";
  }
  else
  {
    value = String(value).trim();

    if (value.length === 0)
    {
      result = value;
    }
    else
    {
      const sign = value.charAt(0);

      if (sign === "-")
      {
        negativeValue = true;
        result = value.substring(1);
      }
      else if (sign === "+")
      {
        result = value.substring(1);
      }
      else
      {
        result = value;
      }
    }
  }

  let positivePattern = pattern;
  let negativePattern = "";
  const pos = pattern.indexOf(";");

  if (pos > 0)
  {
    positivePattern = pattern.substring(0, pos);
    negativePattern = pattern.substring(pos + 1);

    if (negativePattern === "#")
    {
      negativePattern = positivePattern;
    }
    else if (negativePattern === "-#")
    {
      negativePattern = "-" + positivePattern;
    }
  }
  else
  {
    negativePattern = "-" + positivePattern;
  }

  if (negativeValue)
  {
    positivePattern = negativePattern;

    if (positivePattern.charAt(0) === "-")
    {
      positivePattern = positivePattern.substring(1);
    }
    else if (positivePattern.startsWith(currencySign + "-"))
    {
      positivePattern = positivePattern.substring(2);
    }
  }

  if (positivePattern.charAt(0) === currencySign)
  {
    currencyValue = currencySign;

    positivePattern = positivePattern.substring(1);
  }

  if (result.charAt(0) === currencyValue)
  {
    result = result.substring(1);
  }

  // if (!value && (blankWhenZero || positivePattern.match(/^[#][#.,]*$/ig)))
  // {
  //   return "";
  // }
  // else 
  if (result.match(/^[0][0.,]*$/g) &&
    ((blankWhenZero && 
      (!positivePattern.match(/[09]/) || positivePattern.match(/^[0][0.,]*$/g))) ||
      positivePattern.match(/^[#][#.,]*$/g)))
  {
    return "";
  }

  let decPointInPattern = positivePattern.lastIndexOf(decimalPoint);
  let decPointInValue = result.lastIndexOf(decimalPoint);
  const patternLen = positivePattern.length;
  let valueLen = result.length;

  if (decPointInPattern !== -1)
  {
    // calculate decimal point position from the end of pattern
    decPointInPattern = patternLen - decPointInPattern - 1;

    // calculate decimal point position from the end of value
    if (decPointInValue === -1)
    {
      decPointInValue = 0;
      result += decimalPoint;
      valueLen++;
    }
    else
    {
      decPointInValue = valueLen - decPointInValue - 1;
    }

    if (decPointInPattern !== decPointInValue)
    {
      let nextPos = patternLen - decPointInPattern + decPointInValue;

      // add insignificant 0 after decimal point
      while (decPointInPattern > decPointInValue)
      {
        const c = positivePattern.charAt(nextPos);

        if ((c === "Z") || (c === "z") || (c === "#") || (c === currencySign) ||
          (c === "9") || (c === "0"))
        {
          result += "0";
        }
        else
        {
          result += c;
        }

        nextPos++;
        decPointInValue++;
        valueLen++;
      }

      // truncate to the specified decimal position
      const disp = decPointInValue - decPointInPattern;

      if (disp > 0)
      {
        result = result.substring(0, valueLen - disp);
        valueLen -= disp;
      }
    }
  }
  else if (decPointInValue !== -1)
  {
    result = result.substring(0, decPointInValue);
    valueLen = decPointInValue;
  }

  if (valueLen > patternLen)
  {
    // return undefined;
  }

  value = result;
  result = "";

  // prepare formated output
  let i = patternLen - 1;
  let j = valueLen - 1;

  for(; i >= 0; i--)
  {
    let c = positivePattern.charAt(i);
    const valChar = (j >= 0) ? value.charAt(j) : "0";

    if ((c === "Z") || (c === "z") || (c === "9") || (c === "0") || (c === "#") ||
      (c === currencySign))
    {
      if ((valChar < "0") || (valChar > "9"))
      {
        return undefined;
      }

      c = valChar;
      j--;
    }
    else if (c === valChar)
    {
      // move position in value
      j--;
    }

    result = c + result;
  }

  if (j >= 0)
  {
    // return undefined;
  }

  // insert insignificant mask's symbols
  // from beginning, if any
  for (; i >= 0; i--)
  {
    result = positivePattern.charAt(i) + result;
  }

  const re = /^\s*(\+|-)/g;
  let skip = 0;

  j = re.test(result) ? 1 : 0;

  // suppress insignificant zeroes from beginning
  for (i = 0; i < patternLen; i++, j++)
  {
    const c = positivePattern.charAt(i);
    const valChar = result.charAt(j);

    if ((c === "0") || (c === "9"))
    {
      break;
    }
    else if ((c === "Z") || (c === "z") || (c === "#") || (c === "-") ||
      (c === currencySign))
    {
      if (valChar === "0")
      {
        skip = j + 1;
      }
      else
      {
        break;
      }
    }
    else if ((c === decimalPoint) && (c === valChar))
    {
      break;
    }
    else if (c !== valChar)
    {
      return undefined;
    }
    else if (skip > 0)
    {
      skip++;
    }
  }

  result = result.substring(skip);

  if (result)
  {
    result = currencyValue + result;
  }

  // restore negative sign, if need
  if (negativeValue &&
    (negativePattern.startsWith("-") || negativePattern.startsWith("$-")))
  {
    result = "-" + result;
  }

  // correct the result according with locale settings, if any
  if (locale &&
      ((locale.decimalPoint && (locale.decimalPoint !== decimalPoint)) ||
        (locale.groupSeparator && (locale.groupSeparator !== groupSeparator)) ||
        (locale.currencySign && (locale.currencySign !== currencySign))))
  {
    decimalPoint = locale.decimalPoint || decimalPoint;
    groupSeparator = locale.groupSeparator || groupSeparator;
    currencySign = locale.currencySign || currencySign;

    let newResult = "";
    const c = result.length;

    for(i = 0; i < c; i++)
    {
      const chr = result.charAt(i);

      switch (chr)
      {
        case ".":
        {
          newResult += decimalPoint;

          break;
        }
        case ",":
        {
          newResult += groupSeparator;

          break;
        }
        case "$":
        {
          newResult += currencySign;

          break;
        }
        default:
        {
          // break
          newResult += chr;
        }
      }
    }

    result = newResult;
  }

  return result ? result.trim() : result;
}
