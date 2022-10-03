import { EventEmitter } from "@angular/core";
import { HandleParams } from "./dialog/handle-params";

/**
 * Event parameters.
 */
export interface EventParams extends HandleParams
{
  /**
   * Default event handler.
   */
  handler?: EventEmitter<EventParams>;

  /**
   * Optional delay in triggering event.
   */
  delay?: number;

  /**
   * Indicates whether to bubble event to ancestor with name.
   */
  bubble?: boolean;

  /**
   * Prevent default indicator.
   */
  preventDefault?: boolean;

  /**
   * Stop propagation indicator.
   */
  stopPropagation?: boolean;
}
