import { ViewElement } from "../api/dialog/view-element";
import { Directive, ElementRef } from "@angular/core";
/**
 * A container of the table haeader.
 */
@Directive(
{
  selector: "[coolHeader]",
  exportAs: "header"
})
export class HeaderDirective implements ViewElement
{
  /**
   * Creates a `HeaderDirective` instance.
   * @param element an element reference.
   */
  constructor(public element: ElementRef<HTMLElement>)
  {
  }
}
