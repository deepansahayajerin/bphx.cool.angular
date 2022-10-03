import { Directive, EventEmitter, HostListener } from "@angular/core";
import { Self, Output, Inject } from "@angular/core";
import { OptionsService } from "../services/options.service";
import { EventBase } from "../api/event-base";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { EventParams } from "../api/event-params";

/**
 * Click event handler.
 */
@Directive(
{
  selector:
    "[coolLeftMouseBtnDown],[coolLeftMouseBtnUp]," +
    "[coolRightMouseBtnDown],[coolRightMouseBtnUp]"
})
export class MouseEventDirective extends EventBase
{
  /**
   * Creates a `MouseEventDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
   constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  /**
   * Left mouse button down.
   */
  @Output()
  coolLeftMouseBtnDown = new EventEmitter<EventParams>();

  /**
   * Left mouse button up.
   */
  @Output()
  coolLeftMouseBtnUp = new EventEmitter<EventParams>();

  /**
   * Right mouse button down.
   */
  @Output()
  coolRightMouseBtnDown = new EventEmitter<EventParams>();

  /**
   * Right mouse button up.
   */
  @Output()
  coolRightMouseBtnUp = new EventEmitter<EventParams>();

  @HostListener("mousedown", ["$event"])
  onMousedown(event: MouseEvent): void
  {
    const button = event.button;
    const [eventName, eventEmitter] =
      button === 0 ? ["LeftMouseBtnDown", this.coolLeftMouseBtnDown] :
      button === 2 ? ["RightMouseBtnDown", this.coolRightMouseBtnDown] :
      null;

    if (!eventEmitter?.observers.length)
    {
      return;
    }

    const params = this.createParams(eventName, event, eventEmitter);

    params.deduplicate = true;
    params.bubble = true;

    this.trigger(params);
  }

  @HostListener("mouseup", ["$event"])
  onMouseup(event: MouseEvent): void
  {
    const button = event.button;
    const [eventName, eventEmitter] =
      button === 0 ? ["LeftMouseBtnUp", this.coolLeftMouseBtnUp] :
      button === 2 ? ["RightMouseBtnUp", this.coolRightMouseBtnUp] :
      null;

    if (!eventEmitter?.observers.length)
    {
      return;
    }

    const params = this.createParams(eventName, event, eventEmitter);
    const type = this.field.coolType;

    if ((type === "RDBTNOC") || (type === "CHKBOX"))
    {
      params.defer = this.options.radioOrCheckboxDelay;
    }

    params.deduplicate = true;
    params.bubble = true;

    this.trigger(params);
  }

  @HostListener("contextmenu", ["$event"])
  onContextmenu(event: MouseEvent): void
  {
    if (this.coolRightMouseBtnUp?.observers.length)
    {
      event.preventDefault();
    }
  }
}
