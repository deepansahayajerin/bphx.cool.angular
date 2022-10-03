import { Subscription } from "rxjs";
import { Directive, Optional, ElementRef } from "@angular/core";
import { HostListener, Inject, OnDestroy } from "@angular/core";
import { OptionsService } from "../services/options.service";
import { isMenuItem, nodeName } from "../api/utils";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";

/**
 * A menu bar.
 */
@Directive({ selector: "[coolMenu]" })
export class MenuDirective implements OnDestroy
{
  /**
   * Creates a `MenuDirective` instance.
   * @param options options service.
   * @param element an element reference.
   * @param view a `View` reference.
   */
  constructor(
    public options: OptionsService,
    public element: ElementRef<HTMLElement>,
    @Optional() @Inject(VIEW_ACCESSOR)
    public view?: View)
  {
    this.subscription = view?.update.subscribe(() => this.update());
  }

  ngOnDestroy(): void
  {
    this.subscription?.unsubscribe();
  }

  update(): void
  {
    const active = this.view?.active;

    if (active !== this.active)
    {
      this.active = active;

      if (!active && this.focused)
      {
        Promise.resolve().then(() => this.refresh(null, false, true));
      }
    }
  }

  private refresh(
    focus: HTMLElement,
    expand: boolean,
    immediate: boolean): void
  {
    if (this.focusTimeout)
    {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }

    const element = this.element.nativeElement;

    const toFocus: HTMLElement[] = [];
    const toUnfocus: HTMLElement[] = [];
    let expanded: boolean;
    let first = true;

    for(let item = focus; item; item = item.parentElement)
    {
      const root = item === element;

      if (root || isMenuItem(item, true))
      {
        toFocus.push(item);

        expanded = item.classList.contains("coolExpanded");

        if (!first || (expand !== false))
        {
          if (!expanded)
          {
            this.markExpanded(item, immediate);
          }
        }
        else
        {
          if (expanded && (expand === false))
          {
            this.markCollapsed(item, immediate);
          }
        }

        if (root)
        {
          break;
        }

        first = false;
      }
    }

    for(let item = this.focused; item; item = item.parentElement)
    {
      const root = item === element;

      if (root || isMenuItem(item, false))
      {
        if (toFocus.indexOf(item) === -1)
        {
          toUnfocus.push(item);
        }

        if (root)
        {
          break;
        }
      }
    }

    for(let i = 0; i < toUnfocus.length; ++i)
    {
      const item = toUnfocus[i];

      if (item !== toFocus[toFocus.length - toUnfocus.length + i])
      {
        this.markCollapsed(item, immediate);
      }
    }

    this.focused = focus;
  }

  @HostListener("mousedown", ["$event"])
  onMousedown(event: MouseEvent): void
  {
    this.expandedMenuBar = isMenuBar(this.focused);
    this.refresh(event.target as HTMLElement, true, false);
  }

  @HostListener("click", ["$event"])
  onClick(event: MouseEvent): void
  {
    let target = this.expandedMenuBar &&
      isMenuBar(event.target as HTMLElement) ? null :
      event.target as HTMLElement;

    if (target)
    {
      const item = target.closest("li");

      if (item && !item.hasAttribute("coolSubmenu"))
      {
        target = null;
      }
    }

    this.expandedMenuBar = false;
    this.refresh(target, true, true);
    event.preventDefault();
  }

  @HostListener("mouseover", ["$event"])
  onMouseover(event: MouseEvent): void
  {
    const target = event.target as HTMLElement;

    if (this.focused && (nodeName(target) === "a"))
    {
      target.focus();
      this.refresh(target, true, false);
    }
  }

  @HostListener("focusin", ["$event"])
  onFocusin(event: FocusEvent): void
  {
    const target = event.target as HTMLElement;

    this.refresh(target, false, false);
  }

  @HostListener("focusout", ["$event"])
  onFocusout(event: FocusEvent): void
  {
    const relatedTarget = event.relatedTarget as Node;

    if (relatedTarget && !this.element.nativeElement.contains(relatedTarget))
    {
      return;
    }

    if (this.focusTimeout)
    {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }

    this.focusTimeout = setTimeout(() => this.refresh(null, false, true));
  }

  @HostListener("keydown", ["$event"])
  onKeydown(e: KeyboardEvent): void
  {
    const element = this.element.nativeElement;
    let item = e.target as HTMLElement;

    while(item && (item !== element) && !isMenuItem(item, true))
    {
      item = item.parentElement;
    }

    if (!item)
    {
      return;
    }

    const root = element === item.parentElement;
    let nextFn: (element: Element) => Element;
    let escape = false;

    switch(e.key)
    {
      case "ArrowDown":
      case "Down":
      {
        nextFn = !root ? nextSibling :
          current => childOrNext(current, item);

        break;
      }
      case "ArrowUp":
      case "Up":
      {
        nextFn = !root ? previousSibling :
          current => childOrNext(current, item);

        break;
      }
      case "Enter":
      {
        item.click();

        return;
      }
      case "Esc":
      case "Escape":
      {
        escape = true;

        if (root)
        {
          item.blur();
          this.refresh(null, false, true);

          return;
        }
      }
      // falls through.
      case "ArrowLeft":
      case "Left":
      {
        nextFn = root ? previousSibling : current =>
        {
          const next = current.parentElement;

          if (!next)
          {
            return null;
          }

          if (escape || (next.parentElement !== element[0]))
          {
            return next;
          }
          else
          {
            return previousSibling(next);
          }
        };

        break;
      }
      case "ArrowRight":
      case "Right":
      {
        this.refresh(item, false, true);

        nextFn = root ? nextSibling : current =>
        {
          let next = current === item ?
            current.querySelector("ul li") :
            current.nextElementSibling;

          if (next)
          {
            return next;
          }

          next = item;

          while(next.parentElement !== element)
          {
            next = next.parentElement;
          }

          return nextSibling(next);
        };

        break;
      }
    }

    if (!nextFn)
    {
      return;
    }

    for(let next = nextFn(item);
      next && (next !== item);
      next = nextFn(next))
    {
      if (isMenuItem(next, true))
      {
        const link = next.querySelector("a");

        if (link)
        {
          this.refresh(link, false, true);
          link.focus();

          return;
        }
      }
    }
  }

  private markExpanded(item: HTMLElement, immediate: boolean)
  {
    const expand = () =>
    {
      if (item.classList.contains("coolExpanding"))
      {
        item.classList.add("coolExpanded");
        item.classList.remove("coolExpanding");
      }
    };

    item.classList.remove("coolCollapsing");
    item.classList.add("coolExpanding");

    if (immediate || (item.parentElement === this.element.nativeElement))
    {
      expand();
    }
    else
    {
      setTimeout(expand, this.options.menuExpansionDelay);
    }
  }

  private markCollapsed(item: HTMLElement, immediate: boolean)
  {
    const collapse = () =>
    {
      if (item.classList.contains("coolCollapsing"))
      {
        item.classList.remove("coolExpanded");
        item.classList.remove("coolCollapsing");
      }
    };

    item.classList.remove("coolExpanding");
    item.classList.add("coolCollapsing");

    if (immediate || (item.parentElement === this.element.nativeElement))
    {
      collapse();
    }
    else
    {
      setTimeout(collapse, this.options.menuExpansionDelay);
    }
  }

  private active: boolean;
  private focused: HTMLElement;
  private focusTimeout: number;
  private expandedMenuBar: boolean;
  private subscription: Subscription;
}

/**
 * Gets a next sibling element.
 * @param element an element to get next sibling for.
 * @return a next sibling, if any.
 */
function nextSibling(element: Element): Element
{
  return element.nextElementSibling ||
    element.parentElement.firstElementChild;
}

/**
 * Gets a previous sibling element.
 * @param element an element to get previous sibling for.
 * @return a previous sibling, if any.
 */
function previousSibling(element: Element): Element
{
  return element.previousElementSibling ||
    element.parentElement.lastElementChild;
}

/**
 * Gets child or next menu item.
 * @param element an element to get child or next element.
 * @param item a reference menu item element.
 */
function childOrNext(element: Element, item?: Element): Element
{
  return element === item ?
    element.querySelector("ul li") :
    element.nextElementSibling;
}

/**
 * Tests whether the element is in the menu bar.
 * @param element an element to test.
 */
function isMenuBar(element: HTMLElement): boolean
{
  const item = element && element.closest("ul");

  return item  && item.hasAttribute("coolMenu");
}
