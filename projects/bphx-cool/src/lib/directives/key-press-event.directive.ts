import { EventParams } from "./../api/event-params";
import { Directive, Output, EventEmitter, Input, Inject } from "@angular/core";
import { Self, HostListener } from "@angular/core";
import { EventBase } from "../api/event-base";
import { OptionsService } from "../services/options.service";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { isReadonly } from "../api/utils";
import { Validation } from "../api/dialog/handle-params";

/**
 * A KeyPress event handler.
 */
@Directive({ selector: "[coolKeypress]" })
export class KeyPressDirective extends EventBase
{
  /**
   * KeyPress event.
   */
  @Output()
  coolKeyPress = new EventEmitter<EventParams>();

  @Input()
  coolUpper?: boolean;

  @Input()
  coolLower?: boolean;

  /**
   * Creates a `KeyPressDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void
  {
    // Note that we use keydown as keypress is deprecated.

    if (event.altKey || event.ctrlKey || event.metaKey)
    {
      return;
    }

    if (isReadonly(this.field.element.nativeElement))
    {
      return;
    }

    const params =
      this.createParams("KeyPress", event, this.coolKeyPress);

    params.validate = Validation.CancelInvalid;
    params.preventDefault = false;
    params.delay = this.options.keypressDelay;
    params.defer ??= this.options.keyPressDebounceTime;
    params.deduplicate = true;

    const key = event.key;

    // Per https://techdocs.broadcom.com/us/en/ca-mainframe-software/devops/ca-gen/8-6/developing/designing/using-the-toolset/perform-file-transfers-error/export-push-button/keypress-events.html
    // Only printable characters trigger the keypress event
    switch(key)
    {
      case "Delete":
      case "Del":
      {
        params.key = "\\d";

        break;
      }
      case "Backspace":
      {
        params.key = "\\b";

        break;
      }
      default:
      {
        if (key?.length !== 1)
        {
          return;
        }   

        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (event.target as any).value;

    if (value)
    {
      params.value = this.coolUpper != null ?
        String(value).toUpperCase() :
        this.coolLower != null ? String(value).toLowerCase() : null;
    }

    this.trigger(params);
  }
}
