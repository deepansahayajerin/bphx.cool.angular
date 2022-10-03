import { InjectionToken } from "@angular/core";
import { Field } from "./dialog/field";
import { Prompt } from "./dialog/prompt";
import { Video } from "./client/video";

/**
 * Used to provide a `Renderer`.
 */
export const RENDERER_ACCESSOR = new InjectionToken<Renderer>("coolRenderer");

/**
 * An interface for renderer service.
 */
export interface Renderer
{
  /**
   * Renders field or prompt.
   * @param instance a field or prompt to render.
   * @return `true` when render is handled.
   */
  render(instance: Field | Prompt): void;

  /**
   * Collects video attributes.
   * @param instance a field or prompt instance.
   * @returns a video attributes, if any.
   */
  getVideo(instance: Field | Prompt): Video | null;

  /**
   * Sets video attribute.
   * @param instance a field or prompt instance to set video attribute.
   * @param video a video attributes, if any.
   * @param defaultVideo optional default video attributes.
   */
  setVideo(
    instance: Field | Prompt,
    video: Video | null,
    defaultVideo?: Video | null);

  /**
   * Focuses a field.
   * @param field a field to focus.
   * @return `true` when focus is handled. 
   */
  focus(field: Field): boolean;
}
