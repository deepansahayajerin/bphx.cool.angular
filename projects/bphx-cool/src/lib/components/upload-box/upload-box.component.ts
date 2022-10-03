import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { FileData } from "../../api/client/file-data";

@Component({
  selector: "cool-upload-box",
  templateUrl: "./upload-box.component.html",
  styleUrls: ["./upload-box.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class UploadBoxComponent
{
  /**
   * Optional window title.
   */
  @Input()
  title?: string;

  /**
   * Optional window text.
   */
  @Input()
  text?: string;

  /**
   * Indicates whether to accept multiple files.
   */
  @Input()
  multiple?: boolean = false;

  /**
   * Optional comma-separated list of file type specifiers.
   */
  @Input()
  accept?: string;

  /**
   * An event triggered on complete action.
   */
  @Output()
  done = new EventEmitter<FileData[]>();

  @ViewChild("content")
  content: ElementRef<HTMLElement>;

  @ViewChild("input")
  input: ElementRef<HTMLInputElement>;

  dragging = false;

  /**
    * Creates a `UploadBoxComponent`.
    * @param element an element reference.
    */
  constructor(private element: ElementRef<HTMLElement>)
  {
  }

  /**
   * Triggers done event.
   * @param files files list.
   */
  complete(files?: ArrayLike<File>): Promise<FileData[]>
  {
    if (!files?.length)
    {
      this.done.emit(null);
    }

    return Promise.all(Array.from(files).
      map(file => new Promise<FileData>(resolve =>
      {
        const reader = new FileReader();

        reader.onload = () => resolve(
        {
          name: file.name, 
          type: file.type, 
          dataUri: reader.result as string
        });

        reader.readAsDataURL(file);
      }))).
      then(data => 
      {
        this.done.emit(data);

        return data;
      });
  }

  @HostListener("document:keydown", ["$event"])
  keydown(event: KeyboardEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (event.key === "Escape")
    {
      event.preventDefault();
      event.stopPropagation();
      this.complete();
    }
  }

  @HostListener("document:paste", ["$event"])
  paste(event: ClipboardEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    const files = event.clipboardData.files;

    if (files)
    {
      event.preventDefault();
      this.complete(files);
    }
  }

  change(event: Event): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    const files = this.input?.nativeElement.files;

    if (files?.length)
    {
      event.preventDefault();
      this.complete(files);
    }
  }

  drag(event: DragEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    const content = this.content?.nativeElement;

    const dragging = content && 
      ((event.type !== "dragleave") || 
        content.contains(event.relatedTarget as Node)) && 
      !!event.dataTransfer.types.includes("Files");

    this.dragging = dragging;
    content?.classList.toggle("dragging", dragging);

    if (dragging)
    {
      event.preventDefault();
    }
  }

  drop(event: DragEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    this.dragging = false;

    this.content?.nativeElement.classList.remove("dragging");

    const files = event?.dataTransfer.files;

    if (files?.length)
    {
      event.preventDefault();
      this.complete(files);
    }
  }
}
