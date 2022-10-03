import { Directive, EventEmitter, HostListener } from "@angular/core";
import { Self, Output, Inject } from "@angular/core";
import { OptionsService } from "../services/options.service";
import { EventBase } from "../api/event-base";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { EventParams } from "../api/event-params";

/**
 * Click event handler.
 */
@Directive({ selector: "[coolClick],[coolDoubleClick]" })
export class ClickEventDirective extends EventBase
{
  /**
   * Click event.
   */
  @Output()
  coolClick = new EventEmitter<EventParams>();

  /**
   * DoubleClick event.
   */
  @Output()
  coolDoubleClick = new EventEmitter<EventParams>();

  /**
   * Creates a `ClickEventDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  @HostListener("click", ["$event"])
  onClick(event: MouseEvent): void
  {
    if (!this.coolClick.observers.length)
    {
      return;
    }

    const target = event.target as Element;

    if (target.hasAttribute("coolBody"))
    {
      return;
    }

    const params = this.createParams("Click", event, this.coolClick);
    const type = this.field.coolType;

    if ((type === "STNDLST") || this.coolDoubleClick.observers.length)
    {
      params.defer = this.options.doubleClickDelay;
      params.preventDefault = false;
    }
    else if ((type === "RDBTNOC") || (type === "CHKBOX"))
    {
      params.defer = this.options.radioOrCheckboxDelay;
    }
    // No more cases

    params.deduplicate = true;
    params.bubble = true;
    this.trigger(params);
  }

  @HostListener("dblclick", ["$event"])
  onDblclick(event: MouseEvent): void
  {
    if (!this.coolDoubleClick.observers.length)
    {
      return;
    }

    const target = event.target as Element;

    if (target.hasAttribute("coolBody"))
    {
      return;
    }

    const params =
      this.createParams("DoubleClick", event, this.coolDoubleClick);

    const type = this.field.coolType;

    if ((type === "STNDLST") || this.coolDoubleClick.observers.length)
    {
      params.delay = 0;
    }

    params.deduplicate = true;
    params.bubble = true;

    this.trigger(params);
  }
}
