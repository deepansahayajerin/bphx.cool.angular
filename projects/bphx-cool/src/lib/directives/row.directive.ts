import { Directive, ElementRef, HostBinding, Input } from "@angular/core";

@Directive({ selector: "tr[coolRow]" })
export class RowDirective
{
  /**
   * A row number.
   */
  @Input()
  @HostBinding("attr.value")
  coolRow?: number;

  constructor(public element: ElementRef<HTMLElement>)
  {
  }
}
