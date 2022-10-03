import { EventEmitter, InjectionToken } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Field } from "./field";
import { Dialog } from "./dialog";
import { ViewElement } from "./view-element";
import { Procedure } from "../client/procedure";
import { Window } from "../client/window";

/**
 * Used to provide a `View`.
 */
export const VIEW_ACCESSOR =
  new InjectionToken<View>("coolWindow");

/**
 * A dialog window or screen.
 */
export interface View extends ViewElement
{
  /**
   * A procedure instance.
   */
  readonly coolProcedure?: Procedure;

  /**
   * A window instance.
   */
  readonly coolWindow?: Window;

  /**
   * Active indicator.
   */
  readonly active: boolean;

  /**
   * A view id.
   */
  readonly id: string;

  /**
   * A default field.
   */
  defaultField: Field;

  /**
   * A `Dialog` reference.
   */
  readonly dialog: Dialog;

  /**
   * Optional form reference.
   */
  readonly form: NgForm|null;

  /**
   * A set of view fields.
   */
  readonly fields?: Map<Element, Field>;

  /**
   * An update event.
   */
  readonly update: EventEmitter<View>;

  /**
   * Triggers update.
   */
  doUpdate(): void;
}
