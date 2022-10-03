import { InjectionToken, ElementRef } from "@angular/core";
import { ViewElement } from "./view-element";
import { Video } from "../client/video";
import { Control } from "../client/control";
import { ModelAccessor } from "../model-accessor";
import { View } from "./view";
import { Prompt } from "./prompt";

/**
 * Used to provide a `Field`.
 */
export const FIELD_ACCESSOR = new InjectionToken<Field>("coolField");

/**
 * A window or screen field.
 */
export interface Field extends ViewElement
{
  /**
   * A field type.
   */
  readonly type: "field";

  /**
   * Default video attributes.
   */
  readonly defaultVideo?: Video;

  /**
   * A `View` reference.
   */
  readonly view: View;

  /**
   * A field type.
   */
  readonly coolType: string;

  /**
   * A control name.
   */
  readonly coolName?: string|null;

  /**
   * Optional video attributes.
   */
  readonly coolVideo?: Video|null;

  /**
   * Disabled indicator.
   */
  readonly disabled?: boolean|null;

  /**
   * Readonly indicator.
   */
  readonly readonly?: boolean|null;

  /**
   * Original tabindex.
   */
  readonly tabindex?: number|null;

  /**
   * Optional prompt element.
   */
  coolPrompt?: Prompt|null;

  /**
   * Gets control digest.
   */
  readonly control?: Control|null;

  /**
   * An element reference.
   */
  readonly element: ElementRef<HTMLElement>;

  /**
   * A line height.
   */
  readonly lineHeight: number;

  /**
   * A model accessor, if any.
   */
  readonly modelAccessor?: ModelAccessor|null;

  /**
   * Optional field items.
   */
  items?: unknown;

  /**
   * Returns a value inicating whether control's model has any data items:
   * `true` if model has data items, and `false` otherwise.
   */
  readonly hasData: boolean;

  /**
   * Indicates whether control's model has exactly one item selected:
   *   `true` if model has exactly one item selected, and `false` otherwise.
   */
  readonly hasOneSelected: boolean;

  /**
   * Inicates whether control's model has many items selected:
   *   `true` if model has many items selected, and `false` otherwise.
   */
  readonly hasManySelected: boolean;

  /**
   * Inicates whether control's model has no items selected:
   *   `true` if model has no items selected, and `false` otherwise.
   */
  readonly hasNoneSelected: boolean;

  /**
   * Inicates whether control's value is selected into the model:
   *   `true` if value is selected into the model, and `false` otherwise.
   */
  readonly isOn: boolean;

  /**
   * Optional focus function.
   * @returns `true` to call default implementation.
   */
  focus?: () => boolean;

  /**
   * Optional updates field function.
   * @param init true to initial, and false to next update.
   */
  update?: (init: boolean) => void;

  /**
   * Optional refresh function.
   * @param init true to initial, and false to next update.
   * @returns `true` to call default implementation.
   */
  refresh?: (init: boolean) => boolean;
}
