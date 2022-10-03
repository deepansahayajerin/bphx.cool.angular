import { Directive, Output, EventEmitter } from "@angular/core";
import { Self, HostListener, Inject } from "@angular/core";
import { EventBase } from "../api/event-base";
import { OptionsService } from "../services/options.service";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { EventParams } from "../api/event-params";
import { Validation } from "../api/dialog/handle-params";

@Directive({ selector: "[coolGainFocus]" })
export class GainFocusEventDirective extends EventBase
{
  /**
   * GainFocus event.
   */
  @Output()
  coolGainFocus = new EventEmitter<EventParams>();

  /**
   * Creates a `GainFocusDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  @HostListener("focusin", ["$event"])
  onFocusin(event: Event): void
  {
    const focused = this.field.view?.coolWindow.focused;

    if (focused && (focused === this.field.coolName))
    {
      return;
    }

    const classList = (event.target as HTMLElement).classList;

    if (classList.contains("coolUpdatingFocus") ||
      classList.contains("coolFocused"))
    {
      return;
    }

    const params =
      this.createParams("GainFocus", event, this.coolGainFocus);

    params.validate = Validation.MayBeInvalid;
    params.defer = this.options.focusDelay;
    params.delay = this.options.gainFocusOffset;
    params.deduplicate = true;

    this.trigger(params);
  }
}

