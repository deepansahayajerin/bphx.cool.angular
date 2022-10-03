import { Component, Input, ElementRef, Output, EventEmitter, AfterContentInit, ViewEncapsulation } from "@angular/core";

@Component(
{
  selector: "cool-error-box",
  templateUrl: "./error-box.component.html",
  styleUrls: ["./error-box.component.css"]
})
export class ErrorBoxComponent implements AfterContentInit
{
  /**
   * An error message.
   */
  @Input()
  message?: string;

  /**
   * A error id.
   */
  @Input()
  id?: number;

  /**
   * An error type.
   */
  @Input()
  type?: string;

  /**
   * Error details.
   */
  @Input()
  details?: string;

  /**
   * A stack trace.
   */
  @Input()
  stackTrace?: string;

  /**
   * An event triggered on complete action.
   */
  @Output()
  done = new EventEmitter<string>();

  /**
   * Creates a ErrorHandlerComponent.
   * @param element an element reference.
   */
  constructor(private element: ElementRef<HTMLElement>)
  {
  }

  ngAfterContentInit(): void
  {
    setTimeout(() =>
    {
      const element: HTMLElement =
        this.element.nativeElement.querySelector("[button-name]");

      if (element)
      {
        element.focus();
      }
    });
  }

  /**
   * Triggers done event.
   * @param name a button name.
   */
  onDone(name: string): void
  {
    this.done.emit(name);
  }

  keydown(event: KeyboardEvent): void
  {
    if (event.key === "Escape")
    {
      event.preventDefault();
      event.stopPropagation();
      this.onDone("Escape");

      return;
    }
  }
}
