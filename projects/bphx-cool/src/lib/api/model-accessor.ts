import { ElementRef } from "@angular/core";
import { NgModel, RequiredValidator } from "@angular/forms";
import { InjectionToken } from "@angular/core";

/**
 * Used to provide a `ModelAccessor`.
 */
export const MODEL_ACCESSOR = new InjectionToken<ModelAccessor>("coolModel");

/**
 * A model accessor
 */
export interface ModelAccessor
{
  /**
   * Gets a model.
   */
  model: NgModel|null;

  /**
   * Model element.
   */
  element: ElementRef<HTMLElement>;

  /**
   * Original tabindex.
   */
  tabIndex: number|null;

  /**
   * Optional required validator.
   */
  requiredValidator?: RequiredValidator|null;

  /**
   * Initial model value.
   */
  initialValue?: unknown;

  /**
   * Current model value.
   */
  readonly value?: unknown;

  /**
   * Register a handler called on model is ready.
   * @param fn a function to call on change.
   */
  onReady(fn: () => void): void;
}
