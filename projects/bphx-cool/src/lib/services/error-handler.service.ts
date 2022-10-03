import { Observable } from "rxjs";
import { ViewContainerRef } from "@angular/core";
import { Injectable, ComponentFactoryResolver } from "@angular/core";
import { tap } from "rxjs/operators";
import { ErrorBoxComponent } from "../components/error-box/error-box.component";

@Injectable({ providedIn: "root" })
export class ErrorHandlerService {
  /**
   * Create a ErrorHandlerService.
   * @param componentFactoryResolver a component factory resolver.
   */
  constructor(private componentFactoryResolver: ComponentFactoryResolver)
  {
  }

  /**
   * Opens a message box using specified view container.
   * @param viewContainerRef a view container to host message box.
   * @param message an error message.
   * @param id an error id.
   * @param type an error type.
   * @param details an error details.
   * @param stackTrace an error stack trace.
   */
  open(
    viewContainerRef: ViewContainerRef,
    message?: string,
    id?: number,
    type?: string,
    details?: string,
    stackTrace?: string):
    Observable<string>
  {
    return new Observable(subscriber =>
    {
      const componentRef = viewContainerRef.createComponent(ErrorBoxComponent);
      const errorBox = componentRef.instance;
  
      errorBox.message = message;
      errorBox.id = id;
      errorBox.type = type;
      errorBox.details = details;
      errorBox.stackTrace = stackTrace;

      errorBox.done.
        pipe(tap(() => componentRef.destroy())).
        subscribe(subscriber);
    });
  }
}
