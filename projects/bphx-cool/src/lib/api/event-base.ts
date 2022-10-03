import { Input, EventEmitter, Self, Inject, Directive } from "@angular/core";
import { RequestType } from "./client/request-type";
import { EventParams } from "./event-params";
import { FIELD_ACCESSOR, Field } from "./dialog/field";
import { Validation } from "./dialog/handle-params";

/**
 * Base class for envents directives
 */
@Directive()
export class EventBase
{
  /**
   * Optional debounce time.
   */
  @Input()
  coolDebounceTime?: number;

  /**
   * Optional command.
   */
  @Input()
  coolEventsCommand?: string;

  /**
   * Creates a `EventBase` instance.
   * @param field a field reference.
   */
  constructor(@Self() @Inject(FIELD_ACCESSOR) public field: Field)
  {
  }

  /**
   * Creates default `EventParams`.
   * @param type an event type.
   * @param event an event instance.
   * @param handler an event handler.
   * @return `EventParams` instance.
   */
  createParams(
    type?: string,
    event?: Event,
    handler?: EventEmitter<EventParams>): EventParams
  {
    const field = this.field;
    const view = field.view;

    const params: EventParams =
    {
      action: RequestType.Event,
      type,
      event,
      handler,
      procedure: view?.coolProcedure,
      window: view?.coolWindow,
      form: view?.form,
      field,
      component: field.coolName,
      validate: Validation.MustBeValid,
      preventDefault: true,
      stopPropagation: false,
      command: this.coolEventsCommand,
      defer: this.coolDebounceTime ?? null,
      deduplicate: this.coolDebounceTime != null
    };

    return params;
  }

  /**
   * Triggers event.
   * @param params an event parameters.
   */
  trigger(params: EventParams): void
  {
    const field = this.field;
    const view = field.view;
    const dialog = view?.dialog;

    if (!view || dialog.pending)
    {
      return;
    }

    if (!view.active)
    {
      if ((field.coolType === "STNDLST") ||
        ((params.type !== "Click") && (params.type !== "DoubleClick")))
      {
        return;
      }
    }

    function process()
    {
      const model = field.modelAccessor?.model;

      if (model && 
        (model.disabled || 
          (model.invalid && (params.validate !== Validation.MayBeInvalid))))
      {
        return;
      }

      const event = params.event;

      if (event)
      {
        if (event.defaultPrevented)
        {
          return;
        }

        if ((event.target as HTMLElement).matches("[disabled], [disabled] *"))
        {
          return;
        }

        params.handler?.emit(params);

        if (event.defaultPrevented)
        {
          return;
        }
      }

      if (params.bubble)
      {
        for(let target = params.event?.target as Element;
          target && (target !== params.field.element.nativeElement);
          target = target.parentElement)
        {
          if (target.hasAttribute("coolName"))
          {
            dialog.handle(
            {
              ...params,
              defer: true,
              preventDefault: false,
              stopPropagation: false,
              component: target.getAttribute("coolName")
            }).subscribe();

            break;
          }
        }
      }

      dialog.handle(params).subscribe();
    }

    if (params.delay != null)
    {
      window.setTimeout(process, params.delay);
    }
    else
    {
      process();
    }
  }
}
