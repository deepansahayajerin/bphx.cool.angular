import { Injectable, ViewContainerRef } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { FileData } from "../api/client/file-data";
import { UploadBoxComponent } from "../components/upload-box/upload-box.component";

/**
 * Upload box service.
 */
@Injectable({ providedIn: "root" })
export class UploadBoxService 
{
  /**
   * Opens an uload box using specified view container.
   * @param viewContainerRef a view container to host message box.
   * @param title optional window title.
   * @param text optional window text.
   * @param multiple indicates whether to accept multiple files.
   * @param accept optional comma-separated list of file type specifiers.
   * @returns observable that is resolved file types.
   */
  open(
    viewContainerRef: ViewContainerRef,
    title?: string,
    text?: string,
    multiple?: boolean,
    accept?: string):
    Observable<FileData[]>
  {
    return new Observable(subscriber =>
    {
      const componentRef = 
        viewContainerRef.createComponent(UploadBoxComponent);
      const uploadBox = componentRef.instance;

      uploadBox.title = title;
      uploadBox.text = text;
      uploadBox.multiple = multiple;
      uploadBox.accept = accept;

      uploadBox.done.
        pipe(tap(() => componentRef.destroy())).
        subscribe(subscriber);
    });
  }
}
