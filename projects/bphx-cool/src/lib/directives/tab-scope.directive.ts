import { Directive, HostListener, ElementRef } from "@angular/core";
import { elementsInTabOrder, isButton } from "../api/utils";

/**
 * A directive to intercept Tab and Shift+Tab to restrict tabbing within
 * element.
 */
@Directive({ selector: "[coolTabScope]" })
export class TabScopeDirective
{
  /**
   * Creates a TabScopeDirective instance.
   * @param element an element reference.
   */
  constructor(private element: ElementRef<HTMLElement>) { }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void
  {
    const target = event.target as HTMLElement;
    const button = isButton(target);
    let arrow = false;
    let tab: boolean;
    let home = false;
    let end = false;

    switch(event.key)
    {
      case "Tab":
      {
        tab = event.shiftKey;

        break;
      }
      case "ArrowUp":
      case "Up":
      case "ArrowLeft":
      case "Left":
      {
        if (!button)
        {
          return;
        }

        arrow = true;
        tab = true;

        break;
      }
      case "ArrowDown":
      case "Down":
      case "ArrowRight":
      case "Right":
      {
        if (!button)
        {
          return;
        }

        arrow = true;
        tab = false;

        break;
      }
      case "Home":
      {
        if (event.ctrlKey && !event.shiftKey && !event.altKey)
        {
          home = true;
        }
        else
        {
          return;
        }
    
        break;        
      }
      case "End":
      {
        if (event.ctrlKey && !event.shiftKey && !event.altKey)
        {
          end = true;
        }
        else
        {
          return;
        }
    
        break;        
      }
      default:
      {
        return;
      }
    }

    let elements = elementsInTabOrder(this.element.nativeElement);

    if (arrow)
    {
      elements = elements.filter(isButton);
    }

    const index = home ? 0 : end ? 
      elements.length - 1 :  elements.indexOf(target);

    const focusElement = !elements.length ? this.element.nativeElement :
      elements[
        home || end ? index :
        tab ? index > 0 ? index - 1 : elements.length - 1 :
        index + 1 < elements.length ? index + 1 : 0];

    if (focusElement === target)
    {
      target.classList.add("coolTabbing");

      try
      {
        target.blur();
      }
      finally
      {
        target.classList.remove("coolTabbing");
      }
    }

    focusElement.focus();
    event.preventDefault();
    event.stopPropagation();
  }
}
