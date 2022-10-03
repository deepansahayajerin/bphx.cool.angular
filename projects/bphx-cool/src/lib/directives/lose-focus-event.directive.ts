import { Directive, Output, EventEmitter } from "@angular/core";
import { Self, HostListener, Inject } from "@angular/core";
import { EventBase } from "../api/event-base";
import { OptionsService } from "../services/options.service";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { EventParams } from "../api/event-params";
import { Validation } from "../api/dialog/handle-params";

@Directive({ selector: "[coolLoseFocus]" })
export class LoseFocusEventDirective extends EventBase
{
  /**
   * LoseFocus event.
   */
  @Output()
  coolLoseFocus = new EventEmitter<EventParams>();

  /**
   * Creates a `LoseFocusDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  @HostListener("focusout", ["$event"])
  onFocusout(event: FocusEvent): void
  {
    const focused = this.field.view?.coolWindow.focused;

    if (focused && (focused !== this.field.coolName))
    {
      return;
    }

    if (event.relatedTarget &&
      this.field.element.nativeElement.
        contains(event.relatedTarget as Node))
    {
      return;
    }

    const classList = (event.target as HTMLElement).classList;

    if (classList.contains("coolUpdatingFocus"))
    {
      return;
    }

    const params =
      this.createParams("LoseFocus", event, this.coolLoseFocus);

    params.validate = Validation.MayBeInvalid;
    params.defer = this.options.focusDelay;
    params.delay = this.options.loseFocusOffset;
    params.deduplicate = true;

    if (!classList.contains("coolTabbing"))
    {
      params.canceled = () => params.window?.name === params.field?.coolName;
    }

    this.trigger(params);
  }
}

