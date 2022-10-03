import { Directive, Inject, Input, Optional } from "@angular/core";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { isSelect } from "../api/utils";

@Directive(
{
  selector:
    "input[coolDefaultValue][ngModel][type=checkbox]," +
    "input[coolDefaultValue][ngModel][type=radio]," +
    "input[coolHighValue][ngModel][type=radio]," +
    "input[coolDefaultValue][ngModel][type=text]," +
    "select[coolType][ngModel]"
})
export class DefaultValueDirective
{
  /**
   * Optional default value.
   */
  @Input()
  coolDefaultValue?: unknown;

  /**
   * Optional high value.
   */
  @Input()
  coolHighValue?: unknown;

  /**
   * Creates a `DefaultValueDirective`.
   * @param field a field reference.
   */
  constructor(@Optional() @Inject(FIELD_ACCESSOR) field: Field)
  {
    if (field?.modelAccessor)
    {
      const select = isSelect(field.element.nativeElement);
      const update = field.update;
      let updating = false;

      field.update = (init: boolean) =>
      {
        if (!updating)
        {
          updating = true;

          try
          {
            const model = field.modelAccessor.model;

            if (model)
            {
              if (select)
              {
                const value = model.value;

                if (value == null)
                {
                  model.control.setValue("");
                }
              }
              else
              {
                const value = model.value;
                const defaultValue = this.coolDefaultValue;
                const highValue = this.coolHighValue;
                const newValue = model.value || defaultValue;
        
                if (((defaultValue != null) && ((value == null) || (value === ""))) ||
                  ((highValue != null) && (value > newValue) && (value <= highValue)))
                {
                  model.control.setValue(newValue);
                }
              }
            }

            update?.(init);
          }
          finally
          {
            updating = false;
          }
        }
      };
    }
  }
}
