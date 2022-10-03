import { Attributes } from "../json";
import { MessageBoxButtons } from "./message-box-buttons";
import { MessageBoxStyle } from "./message-box-style";

/**
 * A message box.
 */
export interface MessageBox
{
  /**
   * A message box type.
   */
  type?: string;

  /**
   * A message box title.
   */
  title?: string;

  /**
   * A message box text.
   */
  text?: string;

  /**
   * A enumeration of buttons to show.
   */
  buttons?: MessageBoxButtons;

  /**
   * A message box style.
   */
  style?: MessageBoxStyle;

  /**
   * A number of default button to focus.
   */
  defaultButton?: number;

  /**
   * Optional list of attributes.
   */
  attribute?: Attributes;
}
