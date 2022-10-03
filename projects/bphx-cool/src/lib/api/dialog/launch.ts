import { InjectionToken } from "@angular/core";
import { Dialog } from "./dialog";

/**
 * Used to provide a `Launch` instance.
 */
export const LAUNCH_ACCESSOR =
  new InjectionToken<Launch>("coolLaunch");

/**
 * A launch service.
 */
export interface Launch
{
  /**
   * Executes launch command.
   * @param dialog a `Dialog` instance.
   * @param command a launch command.
   */
  launch(dialog: Dialog, command: { [name: string]: unknown }): void;
}
