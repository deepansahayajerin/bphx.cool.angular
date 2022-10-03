import { State } from "./state";
import { EventObject } from "./event-object";
import { RequestType } from "./request-type";
import { Global } from "./global";
import { Json } from "../json";
import { Dialog } from "../dialog/dialog";

export type RequestParams =
{
  [name: string]: string|number|boolean|(string|number|boolean)[];
};

/**
 * A service request object.
 */
export interface Request
{
  /**
   * A dialog reference.
   */
  dialog: Dialog;

  /**
   * Action name.
   */
  action: RequestType;

  /**
   * Opaque application index.
   */
  index?: number;

  /**
   * Current procedure id.
   */
  id?: number;

  /**
   * Current procedure name.
   */
  procedure?: string;

  /**
   * Restart indicator.
   */
  restart?: boolean;

  /**
   * Optional parameters.
   */
  params?: RequestParams;

  /**
   * Command line.
   */
  commandLine?: string;

  /**
   * Display first indicator.
   */
  displayFirst?: boolean;

  /**
   * An import structure.
   */
  in?: Json;

  /**
   * A global data structure.
   */
  global?: Global;

  /**
   * A name of focused control.
   */
  focused?: string;

  /**
   * Events sent with request.
   */
  events?: EventObject[];

  /**
   * Controls sent with request.
   */
  controls?: State[];
}
