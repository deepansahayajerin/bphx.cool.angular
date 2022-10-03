import { Subscriber } from "rxjs";
import { NgForm } from "@angular/forms";
import { Field } from "./field";
import { RequestType } from "../client/request-type";
import { EventObject } from "../client/event-object";
import { Procedure } from "../client/procedure";
import { Window } from "../client/window";
import { Attribute, Json } from "../json";

/**
 * Validation option.
 */
export enum Validation
{
  /**
   * Value must be valid, otherwise show validation alert.
   */
  MustBeValid,

  /**
   * Value may be invalid.
   */
  MayBeInvalid,

  /**
   * Cancel request if value is invalid.
   */
  CancelInvalid
}

/**
 * Dialog handle parameters.
 */
export interface HandleParams
{
  /**
   * A dialog action.
   */
  action: RequestType;

  /**
   * An event type.
   */
  type?: string;

  /**
   * Optional command.
   */
  command?: string;

  /**
   * A procedure name.
   */
  procedureName?: string;

  /**
   * A procedure reference.
   */
  procedure?: Procedure;

  /**
   * A window reference.
   */
  window?: Window;

  /**
   * A form reference.
   */
  form?: NgForm;

  /**
   * A field reference.
   */
  field?: Field;

  /**
   * A component name for the event.
   */
  component?: string;

  /**
   * A target window in case it's different from window.
   */
  targetWindow?: string;

  /**
   * Indicates whether to validate form before postback.
   * unknown value is the same as `Validation.MustBeValid`.
   */
  validate?: Validation;

  /**
   * Restart indicator.
   */
  restart?: boolean;

  /**
   * Optional parameters.
   */
  params?: { [name: string]: string | string[] };

  /**
   * Command line.
   */
  commandLine?: string;

  /**
   * Display first indicator.
   */
  displayFirst?: boolean;

  /**
   * Optional function to specify postback cancellation.
   * stage might be: "prepare", "process".
   */
  canceled?: (stage: string) => boolean;

  /**
   * `true` to clear queue of pending events, if any.
   */
  clearQueue?: boolean;

  /**
   * An event object.
   */
  event?: Event;

  /**
   * A defer value:
   * - `null`, `undefined`, `false` - mean no defer;
   * - `true` - defer postback to next timer tick;
   * - positive number - defer postback to a specified number of milliseconds;
   * - negative number - put event into queue but does not send postback
   *   (wait for next event);
   */
  defer?: number|boolean;

  /**
   * `true` to deduplicate event in the event queue.
   */
  deduplicate?: boolean;

  /**
   * `false` to not pass the data.
   */
  passData?: boolean;

  /**
   * Optional value.
   */
  value?: Json;

  /**
   * Event key override.
   */
  key?: string;

  /**
   * Optional list of attributes.
   */
  attribute?: Attribute[];

  /**
   * Optional data.
   */
  data?: Json[];

  /**
   * Event sent with request.
   */
  eventObject?: EventObject;

  /**
   * Optional subscriber.
   */
  subscriber?: Subscriber<boolean>;

  /**
   * Generic parameters.
   */
  [key: string]: unknown;
}
