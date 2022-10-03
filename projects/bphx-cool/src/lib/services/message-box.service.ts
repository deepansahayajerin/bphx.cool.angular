import { Injectable, ViewContainerRef } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { MessageBoxComponent } from "../components/message-box/message-box.component";

/**
 * A message box service.
 */
@Injectable({ providedIn: "root" })
export class MessageBoxService
{
  /**
   * Opens a message box using specified view container.
   * @param viewContainerRef a view container to host message box.
   * @param style a message box style.
   * @param title a message box title.
   * @param text a message box text.
   * @param buttons a message box buttons.
   * @param focus button to focus.
   * @returns observable that is resolved with selected button.
   */
  open(
    viewContainerRef: ViewContainerRef,
    style?: string,
    title?: string,
    text?: string,
    buttons?: { name: string, text?: string }[],
    focus?: string):
    Observable<string>
  {
    return new Observable(subscriber =>
    {
      const componentRef = 
        viewContainerRef.createComponent(MessageBoxComponent);
      const messageBox = componentRef.instance;
  
      messageBox.style = style;
      messageBox.title = title;
      messageBox.text = text;
      messageBox.buttons = buttons;
      messageBox.focus = focus;
  
      messageBox.done.
        pipe(tap(() => componentRef.destroy())).
        subscribe(subscriber);
    });
  }
}
