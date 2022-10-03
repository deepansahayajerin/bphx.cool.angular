import { Directive, HostListener, Input, Inject } from "@angular/core";
import { Self } from "@angular/core";
import { EventBase } from "../api/event-base";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";

/**
 * Open even handler.
 */
@Directive({ selector: "[coolOpen]" })
export class OpenEventDirective extends EventBase
{
  /**
   * Target window.
   */
  @Input()
  coolOpen: string;

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
    const params = this.createParams("Open", event, null);

    params.targetWindow = this.coolOpen;
    params.defer = false;
    params.deduplicate = false;

    this.trigger(params);
  }
}
