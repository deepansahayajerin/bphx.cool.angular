import { Directive, Output, EventEmitter, Self, HostListener, Inject } from "@angular/core";
import { EventBase } from "../api/event-base";
import { OptionsService } from "../services/options.service";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { isInputText } from "../api/utils";
import { EventParams } from "../api/event-params";
import { Validation } from "../api/dialog/handle-params";

@Directive({ selector: "[coolChanged],[coolChange]" })
export class ChangedDirective extends EventBase
{
  /**
   * Changed event.
   */
  @Output()
  coolChanged = new EventEmitter<EventParams>();

  /**
   * Change event.
   */
  @Output()
  coolChange = new EventEmitter<EventParams>();

  /**
   * Creates a `ChangedDirective` instance.
   * @param field a field reference.
   * @param options options service.
   */
  constructor(
    @Self() @Inject(FIELD_ACCESSOR) public field: Field,
    public options: OptionsService)
  {
    super(field);
  }

  @HostListener("beforeinput")
  beforeinput(): void
  {
    this.oldValue ??= this.field.modelAccessor?.initialValue;
  }

  @HostListener("change", ["$event"])
  change(event: Event): void
  {
    const oldValue = this.oldValue;

    this.oldValue = null;

    const params = this.coolChanged.observers.length ?
      this.createParams("Changed", event, this.coolChanged) :
      this.coolChange.observers.length ?
        this.createParams("Change", event, this.coolChange) :
      null;

    if (!params)
    {
      return;
    }

    const field = this.field;
    const type = field.coolType;
    const radio = type === "RDBTNOC";
    const checkbox = type === "CHKBOX";
    const modelAccessor = field.modelAccessor;
    const model = modelAccessor?.model;

    if (radio && model)
    {
      params.component = model.name;
    }

    if (((oldValue ?? modelAccessor?.initialValue) === model?.model) &&
      isInputText(modelAccessor?.element?.nativeElement))
    {
      return;
    }

    const options = this.options;

    params.delay = radio || checkbox ?
      options.radioOrCheckboxChangedOffset : options.changedOffset;
    params.defer = options.changedDelay;

    if (!model?.dirty)
    {
      params.validate = Validation.MayBeInvalid;
    }

    this.trigger(params);
  }

  /**
   * Old value cached on start of input.
   */
  private oldValue: unknown = null;
}
