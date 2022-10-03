import { Field } from "../dialog/field";
import { JsonObject } from "../json";

/**
 * A control digest.
 */
export interface Control
{
  /**
   * Control name.
   */
  name: string;

  /**
   * Optional control value.
   */
  value?: string;

  /**
   * Visibility indicator.
   */
  visible?: boolean;

  /**
   * Disabled indicator.
   */
  disabled?: boolean;

  /**
   * Dynamic dysabled state value.
   */
  disabledState?: boolean;

  /**
   * Read only indicator.
   */
  readOnly?: boolean;

  /**
   * Control caption.
   */
  caption?: string;

  /**
   * Font size.
   */
  fontSize?: string;

  /**
   * Font style.
   */
  fontStyle?: string;

  /**
   * Font type.
   */
  fontType?: string;

  /**
   * Background color.
   */
  backgroundColor?: number;

  /**
   * Background bitmap.
   */
  bitmapBackground?: string;

  /**
   * Foreground color.
   */
  foregroundColor?: number;

  /**
   * A prompt foreground color.
   */
  promptForegroundColor?: number;

  /**
   * A prompt background foreground color.
   */
  promptBackgroundColor?: number;

  /**
   * Control left override.
   */
  left?: string|number;

  /**
   * Control top override.
   */
  top?: string|number;

  /**
   * Control width override.
   */
  width?: string|number;

  /**
   * Control height override.
   */
  height?: string|number;

  /**
   * Optional list of attributes.
   */
  attributes?: JsonObject;

  /**
   * A field reference.
   */
  field?: Field|null;

  /**
   * Other fields.
   */
  [key: string]: unknown;
}
