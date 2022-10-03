import { Directive, Output, EventEmitter } from "@angular/core";
import { DoCheck, Inject, Self } from "@angular/core";
import { EventBase } from "../api/event-base";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { EventParams } from "../api/event-params";
import { Validation } from "../api/dialog/handle-params";

/**
 * Click event handler.
 */
@Directive({ selector: "[coolTabActivate],[coolTabPageActivate],[coolTabShown]" })
export class TabActivateEventDirective extends EventBase implements DoCheck
{
  /**
   * TabActivate event.
   */
  @Output()
  coolTabActivate = new EventEmitter<EventParams>();

  /**
   * TabPageActivate event.
   */
  @Output()
  coolTabPageActivate = new EventEmitter<EventParams>();

  /**
   * TabShown event.
   */
  @Output()
  coolTabShown = new EventEmitter<EventParams>();

  /**
   * Creates a `TabActivateDirective` instance.
   * @param field a field reference.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR)
    public field: Field)
  {
    super(field);
  }

  ngDoCheck(): void
  {
    const value = this.field.control?.value;

    if (value !== this.value)
    {
      this.value = value;

      const handle = (type: string, handler: EventEmitter<EventParams>) =>
      {
        if (!handler.observers.length)
        {
          return;
        }

        const params = this.createParams(type, null, handler);

        params.defer = false;
        params.validate = Validation.MayBeInvalid;
        params.deduplicate = true;

        params.attribute =
        [
          { name: "TabToActivate", value },
          { name: "PageToActivate", value },
        ];

        this.trigger(params);
      };

      handle("TabActivate", this.coolTabActivate);
      handle("TabPageActivate", this.coolTabPageActivate);
      handle("TabShown", this.coolTabShown);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private value: any;
}
