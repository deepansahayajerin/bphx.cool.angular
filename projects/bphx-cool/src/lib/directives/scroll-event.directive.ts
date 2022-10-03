import { Directive, Output, EventEmitter } from "@angular/core";
import { HostListener, Inject, Self } from "@angular/core";
import { EventBase } from "../api/event-base";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { EventParams } from "../api/event-params";
import { Validation } from "../api/dialog/handle-params";

/**
 * Click event handler.
 */
@Directive({ selector: "[coolScrollTop],[coolScrollBottom]" })
export class ScrollEventDirective extends EventBase
{
  /**
   * ScrollTop event.
   */
  @Output()
  coolScrollTop = new EventEmitter<EventParams>();

  /**
   * ScrollBottom event.
   */
  @Output()
  coolScrollBottom = new EventEmitter<EventParams>();

  /**
   * Creates a `ScrollDirective` instance.
   * @param field a field reference.
   */
  constructor(@Self() @Inject(FIELD_ACCESSOR) public field: Field)
  {
    super(field);
  }

  @HostListener("scroll", ["$event"])
  onScroll(event: Event): void
  {
    const element = this.field.element.nativeElement;
    const isSmallList = element.scrollHeight <= element.clientHeight;

    if (this.coolScrollTop.observers.length && !isSmallList)
    {
      const params =
        this.createParams("ScrollTop", event, this.coolScrollTop);

      params.validate = Validation.MayBeInvalid;

      const wasTop = !!this.top;

      this.top = element.scrollTop < 1.0;

      if (this.top && !wasTop)
      {
        this.trigger(params);
      }
    }

    if (this.coolScrollBottom.observers.length && !isSmallList)
    {
      const params =
        this.createParams("ScrollBottom", event, this.coolScrollBottom);

      params.validate = Validation.MayBeInvalid;

      const wasBottom = !!this.bottom;

      this.bottom =
        element.clientHeight + element.scrollTop > element.scrollHeight - 1;

      if (this.bottom && !wasBottom)
      {
        this.trigger(params);
      }
    }
  }

  private top = true;
  private bottom: boolean;
}
