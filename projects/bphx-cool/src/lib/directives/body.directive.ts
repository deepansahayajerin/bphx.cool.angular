import { RowDirective } from "./row.directive";
import { EMPTY, interval, Observable, of } from "rxjs";
import { ElementRef, Directive, AfterViewInit } from "@angular/core";
import { HostListener, Optional, Self, Input, Inject } from "@angular/core";
import { indexOf } from "../api/utils";
import { OptionsService } from "../services/options.service";
import { ClickEventDirective } from "./click-event.directive";
import { Field, FIELD_ACCESSOR } from "../api/dialog/field";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";
import { ViewElement } from "../api/dialog/view-element";
import { Selectable } from "../api/selectable";
import { ListAccessorDirective } from "./list-accessor.directive";
import { InitDirective } from "./init.directive";
import { debounce, first, map } from "rxjs/operators";

/**
 * A container of the table body.
 */
@Directive(
{
  selector: "[coolBody]",
  exportAs: "body"
})
export class BodyDirective implements ViewElement, AfterViewInit
{
  /**
   * Multiselection indicator.
   */
  @Input()
  multiple?: boolean;

  /**
   * Creates a `BodyDirective` instance.
   * @param options options service.
   * @param element an element reference.
   * @param listModel optional list model.
   * @param view a `View` reference.
   * @param field optional field reference.
   * @param init optional `InitDirective` to subscribe.
   * @param click optional click, if attached.
   */
  constructor(
    public options: OptionsService,
    public element: ElementRef<HTMLElement>,
    @Self() @Optional() public listModel: ListAccessorDirective,
    @Optional() @Inject(VIEW_ACCESSOR) public view?: View,
    @Self() @Optional() @Inject(FIELD_ACCESSOR) public field?: Field,
    @Self() @Optional() public init?: InitDirective,
    @Self() @Optional() public click?: ClickEventDirective)
  {
    if (init)
    {
      init.init.
        pipe(debounce(() => interval(options.tableKeyboardSelectionDelay))).
        subscribe(() => this.refresh());
    }
    else
    {
      if (field)
      {
        const refresh = field.refresh;

        field.refresh = 
          (init: boolean) => init && this.refresh() && refresh?.(init);
      }
    }
  }

  ngAfterViewInit(): void
  {
    this.listModel?.rows?.changes.subscribe(() =>
    {
      this.listModel.writeValue(this.selection);
      this.focusRow(this.focused);
    });
  }

  get selection(): unknown[]
  {
    const selection = this.field?.modelAccessor?.model.viewModel;

    return selection == null ? [] :
      Array.isArray(selection) ? selection : [selection];
  }

  set selection(value: unknown[])
  {
    this.field?.modelAccessor?.model?.viewToModelUpdate(value);
  }

  private focusRow(value: number)
  {
    this.listModel?.rows?.forEach(row =>
      row.element.nativeElement.classList.
        toggle("coolFocused", row.coolRow === value));
  }

  private isBusy(pendingOnly: boolean): boolean
  {
    const dialog = this.view?.dialog;

    return !dialog ||
      (dialog.pending > 0) ||
      (!pendingOnly && (dialog.queue.length > 0));
  }

  private scrollTo(index: number, top: boolean): Observable<RowDirective>
  {
    if ((index == null) || Number.isNaN(index))
    {
      return EMPTY;
    }

    const rowHeight = this.field?.lineHeight ?? 20;
    const element = this.element.nativeElement;
    const clientHeight = element.clientHeight;
    const scrollTop = element.scrollTop;
    let offsetTop = rowHeight * index;
    let delta = 0;

    if (offsetTop < 0)
    {
      offsetTop = 0;
    }

    if (top)
    {
      element.scrollTop = offsetTop;
    }
    else
    {
      if (offsetTop + rowHeight - scrollTop > clientHeight)
      {
        const newTop = clientHeight + scrollTop - rowHeight;

        delta = offsetTop - newTop;
        offsetTop = newTop;
      }

      if (offsetTop < scrollTop)
      {
        delta += offsetTop - scrollTop;
//        offsetTop = scrollTop;
      }

      if (delta)
      {
        element.scrollTop += delta;
      }
    }

    if (!this.listModel?.rows)
    {
      return EMPTY;
    }

    const row = this.listModel.rows.find(item => item.coolRow === index);

    if (row)
    {
      return of(row);
    }

    return this.listModel.rows.changes.
      pipe(
        first(),
        map(() => this.listModel.rows.find(item => item.coolRow === index)));
  }

  /**
   * Refreshes view.
   */
  private refresh(): boolean
  {
    const element = this.element.nativeElement;
    const clientHeight = element.clientHeight;
    const rowHeight = this.field?.lineHeight ?? 20;

    element.setAttribute("clientRows", "" + ((clientHeight / rowHeight) | 0));

    const items = this.field?.items;
    let top: unknown = (items as Selectable)?.top;
    const forceTop = top != null;

    if (items)
    {
      (items as Selectable).top = null;
    }

    if (!this.multiple && !forceTop)
    {
      top = this.selection[0];

      if ((top == null) && (this.focused != null))
      {
        top = this.focused;
      }

      if ((top == null) && this.view?.active)
      {
        top = 0;
      }
    }

    if (top != null)
    {
      const index = typeof top === "number" ? Number(top) :
        (top as { index: number }).index;

      this.focused = index;

      this.scrollTo(index, forceTop).
        subscribe(row =>
        {
          if (row && (index === this.focused))
          {
            this.focusRow(index);
          }
        });
    }

    return false;
  }

  @HostListener("focus", ["$event"])
  onFocus(event: FocusEvent): void
  {
    const model  = this.field?.modelAccessor?.model;

    if (model?.disabled || this.isBusy(!this.multiple))
    {
      event.preventDefault();
      event.stopImmediatePropagation();

      return;
    }

    const focused = this.focused;

    this.scrollTo(focused, false).
      subscribe(row =>
      {
        if (row && (focused === this.focused))
        {
          this.focusRow(focused);
        }
      });
  }

  @HostListener("keydown", ["$event"])
  onKeydown(e: KeyboardEvent): void
  {
    const key = e.key;

    if (key === "Tab")
    {
      // let browser to handle TAB according with tabindex attribute.
      return;
    }

    if (this.focused == null)
    {
      return;
    }

    const model = this.field?.modelAccessor?.model;

    if (!model || model.disabled || this.isBusy(true))
    {
      return;
    }

    const hasClick = this.click?.coolClick.observers.length > 0;
    const items = this.field?.items;
    const length = Array.isArray(items) ? items.length : 0;
    const shift = this.multiple && e.shiftKey;
    let selection = this.selection;
    let updateFocus = true;
    let up = false;
    let focused = this.focused;
    let preventDefault = true;

    let focusedItem =
    {
      index: this.focused,
      value: hasClick ? "+" : "*"
    };

    switch(key)
    {
      case " ":
      {
        if (this.multiple)
        {
          const index = indexOf(selection, this.focused);

          if (index >= 0)
          {
            focusedItem.value = "-";
            selection[index] = focusedItem;
          }
          else
          {
            selection.push(focusedItem);
          }
        }
        else
        {
          selection = selection.length ? [] : [focusedItem];
        }

        break;
      }
      case "ArrowUp":
      case "Up":
      {
        up = true;
      }
      // falls through.
      case "ArrowDown":
      case "Down":
      {
        let index = this.focused;

        if (this.multiple)
        {
          if (index === (up ? 0 : length - 1))
          {
            selection = null;
            updateFocus = false;

            break;
          }

          if (!shift)
          {
            focused = up ? index - 1 : index + 1;
            selection = null;
          }
          else
          {
            const prev = index;
            let removed = false;

            focused = up ? index - 1 : index + 1;

            focusedItem =
            {
              index: focused,
              value: hasClick ? "+" : "*"
            };

            const first = selection.length && (selection[0] === prev);
            const last = selection.length &&
              (selection[selection.length - 1] === prev);

            if (first)
            {
              if (!last && !up)
              {
                selection.splice(0, 1);
                removed = true;
              }
            }
            else
            {
              if (last && up)
              {
                selection.pop();
                removed = true;
              }

              if (!last)
              {
                index = indexOf(selection, prev);

                if (index === -1)
                {
                  selection.push(
                  {
                    index: prev,
                    value: hasClick ? "+" : "*"
                  });
                }
              }
            }

            index = indexOf(selection, this.focused);

            if (index !== -1)
            {
              if (!removed)
              {
                selection.splice(index, 1);
              }
            }
            else
            {
              selection.push(focusedItem);
            }
          }
        }
        else
        {
          if (selection.length && (up ? --index >= 0 : ++index < length))
          {
            focused = index;

            focusedItem =
            {
              index: focused,
              value: hasClick ? "+" : "*"
            };
          }

          selection = [focusedItem];
        }

        break;
      }
      default:
      {
        preventDefault = false;
        updateFocus = false;
        selection = null;

        break;
      }
    }

    if (preventDefault)
    {
      e.preventDefault();
      e.stopPropagation();
    }

    if (updateFocus)
    {
      this.focused = focused;

      this.scrollTo(focused, false).
        subscribe(row =>
        {
          if (row && (focused === this.focused))
          {
            this.focusRow(focused);

            const rowElement = row.element.nativeElement;

            if (!selection || rowElement.matches("[disabled], [disabled] *"))
            {
              return;
            }

            this.selection = selection;

            if (hasClick)
            {
              const debounce = this.click.coolDebounceTime;

              this.click.coolDebounceTime =
                this.options.tableKeyboardSelectionDelay;

              try
              {
                rowElement.click();
              }
              finally
              {
                this.click.coolDebounceTime = debounce;
              }
            }
            else
            {
              rowElement.click();
            }
          }
        });
    }
  }

  @HostListener("mousedown", ["$event"])
  @HostListener("dblclick", ["$event"])
  onMouseEvent(event: MouseEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (this.field?.modelAccessor?.model?.disabled ||
      this.isBusy(!this.multiple))
    {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.matches("[disabled], [disabled] *"))
    {
      return;
    }

    const rowElement = target.closest("tr");
    const row = this.listModel?.rows?.
      find(item => item.element.nativeElement == rowElement);

    const hasClick = this.click?.coolClick.observers.length > 0;
    const hasDoubleClick = this.click?.coolDoubleClick.observers.length > 0;

    switch(event.type)
    {
      case "mousedown":
      {
        if ((event.button !== 0) ||
          (event.timeStamp - this.options.doubleClickDelay <
            this.mousedownTimestamp))
        {
          return;
        }
  
        this.mousedownTimestamp = event.timeStamp;
  
        if (row)
        {
          this.focused = row.coolRow;
          this.focusRow(row.coolRow);
  
          if (this.multiple)
          {
            const selection = [...this.selection];
            const index = this.focused != null ?
              indexOf(selection, this.focused) : -1;
  
            if (index === -1)
            {
              selection.push(
              {
                index: this.focused,
                value: hasClick ? "+" : "*"
              });
            }
            else
            {
              selection[index] =
              {
                index: selection[index],
                value: hasClick ? "-" : ""
              };
            }
  
            this.selection = selection;
          }
          else
          {
            this.selection =
            [
              {
                index: this.focused,
                value: hasClick ? "+" : "*"
              }
            ];
          }
        }

        break;
      }
      case "dblclick":
      {
        if (hasDoubleClick)
        {
          if (row)
          {
            if (this.multiple)
            {
              const selection = [...this.selection];
              const index = this.focused != null ?
                indexOf(selection, this.focused) : -1;
    
              if (index === -1)
              {
                selection.push(
                {
                  index: this.focused,
                  value: "-"
                });
              }
              else
              {
                selection[index] =
                {
                  index: selection[index],
                  value: "+"
                };
              }
    
              this.selection = selection;
            }
            else
            {
              this.selection =
              [
                {
                  index: this.focused,
                  value: "+"
                }
              ];
            }
          }
        }
        else
        {
          if (this.view?.defaultField)
          {
            event.preventDefault();
            event.stopPropagation();
            Promise.resolve().
              then(() => this.view.defaultField.element.nativeElement.click());
          }
        }

        break;
      }
    }
  }

  private focused: number;
  private mousedownTimestamp: number;
}
