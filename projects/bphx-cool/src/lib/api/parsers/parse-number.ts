import { Locale } from "../locale";

/**
 * Parses a string value as number.
 * @param value a formatted numeric as a string value.
 * @param pattern a custom formatting pattern which determines how the
 *   number string should be formatted.
 *
 * **Note:** edit pattern may contain only '#', '-', ',', 'Z', 'z', '0', '9'
 * and '.' characters. Where '#', 'Z' and 'z' are place holders for leading
 * decimal numbers that may be suppressed. '0' or '9' are placeholder for
 * mandatory decimal numbers.
 * @param blankWhenZero determines whether the zero values will be suppressed.
 * @param locale optional locale.
 * @returns the number value.
 */
export function parseNumber(
  value: string|number,
  pattern: string,
  blankWhenZero?: boolean,
  locale?: Locale,
  sanitize?: boolean): number|undefined
{
  if (!pattern)
  {
    return Number(value);
  }

  let negativeValue = false;
  let result = "";
  let currencyValue = "";
  const decimalPoint = (locale && locale.decimalPoint) || ".";
  const groupSeparator = (locale && locale.groupSeparator) || ",";
  const currencySign = (locale && locale.currencySign) || "$";

  if (typeof(value) === "number")
  {
    value = String(value);
  }
  else if ((groupSeparator !== ",") ||
    (decimalPoint !== ".") ||
    (currencySign !== "$"))
  {
    let newValue = "";

    for (let i = 0, c = value.length; i < c; i++)
    {
      const chr = value.charAt(i);

      if (chr === decimalPoint)
      {
        newValue += ".";
      }
      else if (chr === groupSeparator)
      {
        newValue += ",";
      }
      else if (chr === currencySign)
      {
        newValue += "$";
      }
      else if (chr === " ")
      {
        continue;
      }
      else
      {
        newValue += chr;
      }
    }

    value = newValue;
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

  if (positivePattern.charAt(0) === "$")
  {
    currencyValue = "$";
    positivePattern = positivePattern.substring(1);
  }

  if (sanitize)
  {
    let newValue = "";
    let first = true;

    for (let i = 0, c = value.length; i < c; i++)
    {
      const chr = value.charAt(i);

      if ((chr == "-") || (chr == "+"))
      {
        if (first)
        {
          newValue += chr;
        }
      }
      else if (chr == decimalPoint)
      {
        newValue += ".";
      }
      else if (chr == groupSeparator)
      {
        newValue += ",";
      }
      else if (chr == currencySign)
      {
        newValue += "$";
      }
      else
      {
        newValue += chr;
      }

      first = false;
    }

    value = newValue;
  }

  if (!value)
  {
    if (blankWhenZero)
    {
      result = "0";
    }
    else
    {
      const p = positivePattern[positivePattern.length - 1];

      if ((p === "0") || (p === "9"))
      {
        result = "0";
      }
      else
      {
        return undefined;
      }
    }
  }
  else
  {
    let sign = value.charAt(0);

    if (sign === "+")
    {
      result = value.substring(1);
    }
    else if (sign === "-")
    {
      negativeValue = true;
      result = value.substring(1);
    }
    else
    {
      result = value;
      sign = "";
    }

    if (!!sign && (!negativePattern || (positivePattern === negativePattern)))
    {
      return undefined;
    }
  }

  if (result.charAt(0) === currencyValue)
  {
    result = result.substring(1);
  }

  let decPointInPattern = positivePattern.lastIndexOf(".");
  let decPointInValue = result.lastIndexOf(".");
  const patternLen = positivePattern.length;
  let valueLen = result.length;

  if (decPointInPattern !== -1)
  {
    decPointInPattern = patternLen - decPointInPattern - 1;

    if (decPointInValue === -1)
    {
      decPointInValue = 0;

      result += ".";

      valueLen++;
    }
    else
    {
      const decimalDigits = result.substring(decPointInValue + 1);
      
      if (decimalDigits && !/^\d+$/ig.test(decimalDigits))
      {
        return undefined;
      }

      decPointInValue = valueLen - decPointInValue - 1;
    }

    if (decPointInPattern !== decPointInValue)
    {
      let nextPos = patternLen - decPointInPattern + decPointInValue;

      // add insignificant 0 after decimal point
      while (decPointInPattern > decPointInValue)
      {
        const c = positivePattern.charAt(nextPos);

        if ((c === "Z") ||
          (c === "z") ||
          (c === "#") ||
          (c === "9") ||
          (c === "0"))
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
    return undefined;
  }

  if (valueLen > patternLen)
  {
    return undefined;
  }

  // reset string buffer
  value = result;
  result = "";

  // format result
  let hasDecimalPoint = false;

  for (let i = patternLen - 1, j = valueLen - 1; i >= 0; i--)
  {
    const valueChar = (j >= 0) ? value.charAt(j) : "0";
    const c = positivePattern.charAt(i);

    if ((c === "Z") || (c === "z") || (c === "#") || (c === "9") || (c === "0"))
    {
      if ((valueChar < "0") || (valueChar > "9"))
      {
        return undefined;
      }

      if ((j >= 0) || !((c === "#") || (c === "z") || (c === "Z")))
      {
        result = valueChar + result;
      }

      j--;
    }
    else if (c === valueChar)
    {
      if (!hasDecimalPoint && (c === "."))
      {
        result = "." + result;
        hasDecimalPoint = true;
      }

      j--;
    }
  }

  const number = Number(result);

  return negativeValue ? -number : number;
}
