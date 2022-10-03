import { Directive, HostListener, Input, Optional, Self, Inject } from "@angular/core";
import { RequestType } from "../api/client/request-type";
import { EventBase } from "../api/event-base";
import { Validation } from "../api/dialog/handle-params";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";

/**
 * A command directive.
 */
@Directive(
{
  selector: "[coolCommand]"
})
export class CommandEventDirective extends EventBase
{
  /**
   * A command name.
   */
  @Input()
  coolCommand: string;

  @HostListener("click", ["$event"])
  onClick(event: Event): void
  {
    const params = this.createParams(null, event, null);

    params.action = RequestType.Command;
    params.command = this.coolCommand;
    params.defer = false;

    this.trigger(params);

    if (this.field && this.view.coolWindow && (this.coolCommand === "OK"))
    {
      const closeParams = this.createParams("Close", event, null);

      closeParams.defer = false;
      closeParams.passData = false;
      closeParams.preventDefault = false;
      closeParams.validate = Validation.MayBeInvalid;
      closeParams.targetWindow = this.view.coolWindow.name;

      this.trigger(closeParams);
    }
  }

  /**
   * Creates a `CommandDirective` instance.
   * @param view a `View` reference.
   * @param field a field reference.
   */
  constructor(
    @Inject(VIEW_ACCESSOR) public view: View,
    @Self() @Optional() @Inject(FIELD_ACCESSOR) public field: Field)
  {
    super(field);
  }
}
