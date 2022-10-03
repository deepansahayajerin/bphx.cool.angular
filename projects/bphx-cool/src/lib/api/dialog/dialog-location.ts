import { InjectionToken } from "@angular/core";
import { InitAction } from "./init-action";

/**
 * Used to provide a `DialogLocation`.
 */
export const DIALOG_LOCATION_ACCESSOR =
  new InjectionToken<DialogLocation>("coolDialogLocation");

/**
 * Abstract dialog location interface.
 */
export interface DialogLocation
{
  /**
   * Gets an initial action.
   * @returns an initial action.
   */
  initState(): InitAction;

  /**
   * Sets current opaque state index.
   * @param index a state index value.
   */
 setIndex(index: number);
}
