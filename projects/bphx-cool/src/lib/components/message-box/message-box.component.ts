import { Component, Input, EventEmitter, Output, AfterViewInit } from "@angular/core";
import { ViewEncapsulation } from "@angular/core";
import { ElementRef, OnChanges, SimpleChanges } from "@angular/core";

import { isVisible } from "../../api/utils";

/**
 * A message box component.
 */
@Component({
  selector: "cool-message-box",
  templateUrl: "./message-box.component.html",
  styleUrls: ["./message-box.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class MessageBoxComponent implements OnChanges, AfterViewInit
{
  /**
   * Message box style.
   */
  @Input()
  style?: string;

  /**
   * Message box title.
   */
  @Input()
  title?: string;

  /**
   * Message box text.
   */
  @Input()
  text?: string;

  /**
   * Message box buttons.
   */
  @Input()
  buttons?: { name: string, text?: string }[];

  /**
   * Button to focus.
   */
  @Input()
  focus?: string;

  /**
   * An event triggered on complete action.
   */
  @Output()
  done = new EventEmitter<string>();

  /**
   * Creates a `MessageBoxComponent`.
   * @param element an element reference.
   */
  constructor(private element: ElementRef<HTMLElement>)
  {
  }

  ngAfterViewInit(): void
  {
    this.updateFocus();
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    if ("focus" in changes)
    {
      setTimeout(() => this.updateFocus());
    }
  }

  private updateFocus(): void
  {
    const element = this.focus &&
      this.element.nativeElement.
        querySelector("[button-name='" +  this.focus + "']") as HTMLElement ||
      this.element.nativeElement;

    if (element)
    {
      element.focus();
    }
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

    const target = event.currentTarget as HTMLElement;

    if (event.altKey &&
      event.key &&
      (event.key !== "Alt") &&
      target &&
      target.parentElement)
    {
      const key = event.key.toUpperCase();
      const items = target.parentElement.querySelectorAll("u");

      for(let i = 0; i < items.length; ++i)
      {
        const item = items[i];
        const textContent = item.textContent;

        if (isVisible(item) &&
          (textContent && (textContent.toUpperCase() === key)))
        {
          event.preventDefault();
          event.stopPropagation();
          item.click();

          break;
        }
      }
    }
  }
}
