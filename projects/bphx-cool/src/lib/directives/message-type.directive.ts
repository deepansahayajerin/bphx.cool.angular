import { Directive, HostBinding, Input } from "@angular/core";

/**
 * A directive to mark coolMessageType attribute.
 */
@Directive({selector: "[coolMessageType]"})
export class MessageTypeDirective
{
  /**
   * A message type.
   */
  @Input()
  @HostBinding("attr.coolMessageType")
  public coolMessageType: string;
}
