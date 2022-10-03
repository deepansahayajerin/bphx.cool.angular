import { ViewElement } from "./view-element";
import { InjectionToken } from "@angular/core";
import { Video } from "../client/video";
import { Field } from "./field";
import { View } from "./view";

/**
 * Used to provide a `Prompt`.
 */
export const PROMPT_ACCESSOR = new InjectionToken<Prompt>("coolPrompt");

export interface Prompt extends ViewElement
{
  /**
   * A prompt type.
   */
  readonly type: "prompt";

  /**
   * A `View` reference.
   */
  readonly view: View;

  /**
   * Default video attributes.
   */
  readonly defaultVideo?: Video;

  /**
   * Optional field reference.
   */
  coolFor?: Field;
}
