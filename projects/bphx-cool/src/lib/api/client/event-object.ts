import { KeyStatus } from "./key-status";
import { KeyPressAction } from "./key-press-action";
import { Attribute } from "../json";
import { State } from "./state";

/**
 * An event object.
 */
export interface EventObject
{
  /**
   * Event type.
   */
  type: string;

  /**
   * Window name.
   */
  window?: string;

  /**
   * Component name.
   */
  component?: string;

  /**
   * Command name.
   */
  command?: string;

  /**
   * Alt key status.
   */
  alt?: KeyStatus;

  /**
   * Ctrl key status.
   */
  ctrl?: KeyStatus;

  /**
   * Shift key status.
   */
  shift?: KeyStatus;

  /**
   * A character related to the event.
   */
  character?: string;

  /**
   * A current text related to the event.
   */
  currentText?: string;

  /**
   * X coordinate.
   */
  x?: number;

  /**
   * Y coordinate.
   */
  y?: number;

  /**
   * A keypress action.
   */
  keypress?: KeyPressAction;

  /**
   * Optional list of attributes.
   */
  attribute?: Attribute[];

  /**
   * Optional data.
   */
  data?: State[];
}
