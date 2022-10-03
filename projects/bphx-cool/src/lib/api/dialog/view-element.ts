import { ElementRef } from "@angular/core";

export interface ViewElement
{
  /**
   * An element reference.
   */
  readonly element: ElementRef<HTMLElement>;
}
