import { Control } from "./control";
import { MessageType } from "./message-type";
import { WindowPosition } from "./window-position";
import { Procedure } from "./procedure";
import { JsonObject } from "../json";
import { PageComponent } from "../page-component";

export const enum WindowState
{
  /**
   * Window is closed.
   */
  Closed = "Closed",

  /**
   * Window is being opened.
   */
  Opening = "Opening",

  /**
   * Window is opened.
   */
  Opened = "Opened"
}

/**
 * A window digest.
 */
export interface Window extends Control
{
  /**
   * A reference to the procedure.
   */
  procedure?: Procedure;

  /**
   * Window unique id.
   */
  id?: number;

  /**
   * A window modal indicator.
   */
  modal?: boolean;

  /**
   * A window locked indicator.
   */
  locked?: boolean;

  /**
   * A window digest indicator.
   */
  digest?: boolean;

  /**
   * A window state.
   */
  windowState?: WindowState;

  /**
   * Indicates whether to display exit state message, if any,
   * in a message box.
   */
  displayExitStateMessage?: boolean;

  /**
   * Optional initial position of a window or an dialog.
   */
  position?: WindowPosition;

  /**
   * Resizable indicator.
   */
  resizable?: boolean;

  /**
   * Active indicator.
   */
  active?: boolean;

  /**
   * Print indicator.
   */
  print?: boolean;

  /**
   * Window order.
   */
  order?: number;

  /**
   * A name of focused control, if any.
   */
  focused?: string;

  /**
   * A window error message.
   */
  errmsg?: string;

  /**
   * A window error message type.
   */
  messageType?: MessageType;

  /**
   * A list of controls. If value is null then no controls were changed.
   */
  controls?: { [name: string]: Control };

  /**
   * Optional state.
   */
  readonly state?: JsonObject;

  /**
   * Page component related to the window.
   */
  page?: PageComponent;
}

