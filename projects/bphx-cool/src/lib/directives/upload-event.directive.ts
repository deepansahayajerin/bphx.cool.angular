import { Directive, Output, EventEmitter, Input, Inject } from "@angular/core";
import {  ElementRef, HostListener, Self } from "@angular/core";
import { EventBase } from "../api/event-base";
import { FIELD_ACCESSOR, Field } from "../api/dialog/field";
import { EventParams } from "../api/event-params";
import { Json } from "../api/json";

/**
 * Upload event handler.
 */
@Directive({ selector: "[coolUpload]" })
export class UploadEventDirective extends EventBase
{
  /**
   * Upload event.
   */
  @Output()
  coolUpload = new EventEmitter<EventParams>();

  /**
   * File input reference.
   */
  @Input()
  coolInput: ElementRef<HTMLInputElement>;

  /**
   * Creates a `UploadDirective` instance.
   * @param field a field reference.
   */
  constructor(@Self() @Inject(FIELD_ACCESSOR) public field: Field)
  {
    super(field);
  }

  @HostListener("click")
  onClick(): void
  {
    this.unbind?.();
    this.unbind = null;

    const input = this.coolInput?.nativeElement;

    if (!input)
    {
      return;
    }

    const unbind = () => input.removeEventListener("change", change);

    const change = (event: Event) =>
    {
      unbind();

      const file = input.files[0];
  
      input.value = "";
  
      const reader = new FileReader();
  
      reader.onload = () =>
      {
        const params = this.createParams("Upload", event, this.coolUpload);
  
        params.attribute =
        [
          { name: "FileName", value: file.name },
          { name: "FileData", value: reader.result as string }
        ];
  
        this.trigger(params);
      };
  
      reader.readAsDataURL(file);
    };

    this.unbind = unbind;
    input.addEventListener("change", change);
    input.click();
  }

  private unbind: () => void;
}
