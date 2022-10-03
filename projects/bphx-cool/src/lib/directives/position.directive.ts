import { Directive, Input, HostBinding } from "@angular/core";

@Directive({ selector: "[coolLeft],[coolTop],[coolWidth],[coolHeight]" })
export class PositionDirective
{
  /**
   * Optional field left position in CSS units.
   */
  @Input()
  coolLeft?: string;

  /**
   * Optional field top position in CSS units.
   */
  @Input()
  coolTop?: string;

  /**
   * Optional field width in CSS units.
   */
  @Input()
  @HostBinding("style.width")
  coolWidth?: string;

  /**
   * Optional field height in CSS units.
   */
  @Input()
  @HostBinding("style.height")
  coolHeight?: string;
}
