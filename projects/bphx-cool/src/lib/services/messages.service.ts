import { Injectable } from "@angular/core";

/**
 * Localizable resources of the library.
 */
@Injectable({ providedIn: "root" })
export class MessagesService
{
  resources:
    { [dialect: string]: { [key: string]: string|((...args) => string) } } =
  {
    DEFAULT:
    {
      noScroll: "MORE:",
      scrollNext: "MORE +",
      scrollBoth: "MORE -/+",
      scrollPrev: "MORE -",

      "validation.coolNumber": "Value doesn't fit into pattern '{0}'.",
      "validation.coolDate": "Value doesn't fit into pattern '{0}'.",
      "validation.coolTime": "Value doesn't fit into pattern '{0}'.",
      "validation.coolString": "Value doesn't fit into pattern '{0}'.",
      "validation.coolPermittedValues":
        "Value does not belong to a list of permitted values:\n {0}.",
      "validation.required": "Value is required.",
      "validation.error": "Invalid value.",

      OK: "OK",
      Abort: "Abort",
      Ignore: "Ignore",
      Yes: "Yes",
      No: "No",
      Retry: "Retry",
      Cancel: "Cancel",

      Information: "Information",
      Exclamation: "Exclamation",
      Critical: "Critical"
    }
  };

  /**
   * Transforms argument.
   * @param value - an argument to transform.
   * @return transformed argument.
   */
  argument(value: unknown): string
  {
    return value == null ? null : String(value);
  }

  /**
   * Formats string.
   * @param format - a format string with positional placeholders
   *   in the form `{n}`, where `n` is zero base argument number.
   * @param args - an array of arguments.
   * @returns formatted string.
   */
  format(format: string, ...args: unknown[]): string
  {
    return format.replace(/\{\d+\}/g, match =>
    {
      const index = +match.slice(1, -1);

      return index < args.length ? this.argument(args[index]) : match;
    });
  }

  /**
   * Gets message per id and dialect.
   * @param id - a message id.
   * @param dialect - optional dialect name.
   *   If value is not specified then "DEFAULT" value is assumed.
   * @return a message.
   */
  getMessage(id: string, dialect?: string): string|((...args) => string)
  {
    const resources =
      (dialect && this.resources[dialect]) ?? this.resources.DEFAULT;

    return resources?.[id];
  }
}
