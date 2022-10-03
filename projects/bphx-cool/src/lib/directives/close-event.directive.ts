import { Directive, HostListener, Input, Inject, Self } from "@angular/core";
import { EventBase } from "../api/event-base";
import { Validation } from "../api/dialog/handle-params";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { RequestType } from "../../public-api";

/**
 * Open even handler.
 */
@Directive({ selector: "[coolClose]" })
export class CloseEventDirective extends EventBase
{
  /**
   * Target window.
   */
  @Input()
  coolClose?: string;

  /**
   * Creates a `OpenDirective` instance.
   * @param field a field reference.
   */
  constructor(@Self() @Inject(FIELD_ACCESSOR) public field: Field)
  {
    super(field);
  }

  @HostListener("click", ["$event"])
  onClick(event: Event): void
  {
    if (this.coolEventsCommand)
    {
      const params = this.createParams(null, event, null);

      params.action = RequestType.Command;
      params.command = this.coolEventsCommand;
      params.defer = false;

      this.trigger(params);
    }

    const params = this.createParams("Close", event, null);

    params.targetWindow = this.coolClose ||
      this.field.view.coolWindow?.name;
    params.defer = false;
    params.deduplicate = false;
    params.validate = Validation.MayBeInvalid;
    params.clearQueue = !this.coolEventsCommand;
    params.passData = !this.coolEventsCommand;
    params.command = null;

    this.trigger(params);
  }
}
