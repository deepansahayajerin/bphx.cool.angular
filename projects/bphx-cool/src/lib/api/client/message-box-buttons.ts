export const enum MessageBoxButtons
{
  /**
   * Show OK button only.
   */
  OK = "OK",
  /**
   * OK and Cancel buttons.
   */
  OKCancel = "OKCancel",
  /**
   * Abort, Retry and Ignore buttons.
   */
  AbortRetryIgnore = "AbortRetryIgnore",
  /**
   * Yes and No buttons.
   */
  YesNo = "YesNo",
  /**
   * Yes, No and Cancel buttons.
   */
  YesNoCancel = "YesNoCancel",
  /**
   * Retry and Cancel buttons.
   */
  RetryCancel = "RetryCancel"
}

/**
 * Gets an array of button identifiers.
 * @param buttons a buttons enum value.
 * @returns an array of button identifiers.
 */
export function getMessageBoxButtons(buttons:  MessageBoxButtons): string[]
{
  switch(buttons)
  {
    default:
    case MessageBoxButtons.OK:
    {
      return ["OK"];
    }
    case MessageBoxButtons.OKCancel:
    {
      return ["OK", "Cancel"];
    }
    case MessageBoxButtons.AbortRetryIgnore:
    {
      return ["Abort", "Retry", "Ignore"];
    }
    case MessageBoxButtons.YesNo:
    {
      return ["Yes", "No"];
    }
    case MessageBoxButtons.YesNoCancel:
    {
      return ["Yes", "No", "Cancel"];
    }
    case MessageBoxButtons.RetryCancel:
    {
      return ["Retry", "Cancel"];
    }
  }
}
