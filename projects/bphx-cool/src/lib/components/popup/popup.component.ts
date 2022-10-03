/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, ElementRef, EventEmitter, NgZone, ViewEncapsulation } from "@angular/core";
import { Output, Input } from "@angular/core";
import { OnChanges, OnDestroy, AfterContentInit } from "@angular/core";

const directions =
[
  "right-bottom-corner",
  "right-top-corner",
  "left-top-corner",
  "left-bottom-corner",
  "left-bar",
  "right-bar",
  "top-bar",
  "bottom-bar"
];

/**
 * Movable and resizable window with header and content.
 */
@Component(
{
  selector: "cool-popup,[coolPopup]",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.css"],
  encapsulation: ViewEncapsulation.None,
  exportAs: "popup"
})
export class PopupComponent implements OnDestroy, OnChanges, AfterContentInit
{
  /**
   * A CSS selector for a popup content. This content used to measure the size.
   */
  @Input()
  contentSelector?: string;

  /**
   * Optional draggable indicator.
   */
  @Input()
  draggable?: boolean;

  /**
   * optional resizable indicator.
   */
  @Input()
  resizable?: boolean;

  /**
   * Optional left position as a css length or number in pixels.
   */
  @Input()
  left?: number|string;

  /**
   * An event emitter for the left position.
   */
  @Output()
  leftChange = new EventEmitter<string>(true);

  /**
   * Optional top position as a css length or number in pixels.
   */
  @Input()
  top?: number|string;

  /**
   * An event emitter for the top position.
   */
  @Output()
  topChange = new EventEmitter<string>(true);

  /**
   * Optional width as a css length or number in pixels.
   */
  @Input()
  width?: number|string;

  /**
   * An event emitter for the width.
   */
  @Output()
  widthChange = new EventEmitter<string>(true);

  /**
   * Optional height position as a css length or number in pixels.
   */
  @Input()
  height?: number|string;

  /**
   * An event emitter for the width.
   */
  @Output()
  heightChange = new EventEmitter<string>(true);

  /**
   * An activation event emitter.
   */
  @Output()
  activate = new EventEmitter<PopupComponent>(true);

  /**
   * A move event emitter.
   */
  @Output()
  move = new EventEmitter<PopupComponent>(true);

  /**
   * A resize event emitter.
   */
  @Output()
  size = new EventEmitter<PopupComponent>(true);

  /**
   * Creates a PopupComponent instance.
   * @param element an reference to html element.
   * @param ngZone a angular zone service.
   */
  constructor(
    public element: ElementRef<HTMLElement>,
    private ngZone: NgZone)
  {
    this.element.nativeElement.classList.add("coolPopup");
    this.mousedown = this.mousedown.bind(this);
    this.mouseup = this.mouseup.bind(this);
    this.mousemove = this.mousemove.bind(this);

    ngZone.runOutsideAngular(() =>
    {
      element.nativeElement.addEventListener("mousedown", this.mousedown);
      element.nativeElement.addEventListener("touchstart", this.mousedown);
    });
  }

  /**
   * Updates position.
   */
  update(): void
  {
    this.adjustPosition();
  }

  /**
   * Cleans up after component.
   */
  ngOnDestroy(): void
  {
    const element = this.element.nativeElement;
    const document = element.ownerDocument;

    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("touchmove", this.mousemove);
    element.removeEventListener("mousedown", this.mousedown);
    element.removeEventListener("touchstart", this.mousedown);
    document.removeEventListener("mouseup", this.mouseup);
    document.removeEventListener("touchend", this.mouseup);
  }

  /**
   * Triggers on change of input properties.
   */
  ngOnChanges(): void
  {
    if (this.contentInitialized)
    {
      this.restore(this.left, this.top, this.width, this.height);
    }
  }

  /**
   * Handles component state when content is ready.
   */
  ngAfterContentInit(): void
  {
    this.contentInitialized = true;
    this.restore(this.left, this.top, this.width, this.height);
    this.adjustPosition();
  }

  private action =
  {
    state: null,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    direction: null,
    x: 0,
    y: 0
  };

  private mousedown(event: MouseEvent|TouchEvent)
  {
    this.ngZone.run(() => this.activate.emit(this));

    const action = this.action;

    if (!action.state)
    {
      const target = event.target as HTMLElement;
      const rect = this.getBoundingRect();

      if (this.draggable)
      {
        if (this.left == null)
        {
          this.left = rect.left;
        }

        if (this.top == null)
        {
          this.top = rect.top;
        }
      }

      if (this.resizable)
      {
        if (this.width == null)
        {
          this.width = rect.width;
        }

        if (this.height == null)
        {
          this.height = rect.height;
        }
      }

      const pos = this.getPosition(event);

      action.y = pos.pageY;
      action.x = pos.pageX;
      action.left = rect.left;
      action.top = rect.top;
      action.width = rect.width;
      action.height = rect.height;

      const element = this.element.nativeElement;
      const header = element.querySelector("header,[header]");

      if (header && header.contains(target))
      {
        if (!this.draggable)
        {
          return;
        }

        action.state = "dragging";
        event.preventDefault();
      }
      else
      {
        const resizeCorner = element.querySelector("div.resizeCorner");
        const resizeBar = element.querySelector("div.resizeBar");

        if ((resizeCorner && resizeCorner.contains(target)) ||
          (resizeBar && resizeBar.contains(target)))
        {
          if (!this.resizable)
          {
            return;
          }

          action.state = "resizing";

          for(const name of directions)
          {
            if (target.classList.contains(name))
            {
              action.direction = name;

              break;
            }
          }

          event.preventDefault();
        }
      }

      if (action.state)
      {
        const document = element.ownerDocument;

        document.addEventListener("mousemove", this.mousemove);
        document.addEventListener("touchmove", this.mousemove);
        document.addEventListener("mouseup", this.mouseup);
        document.addEventListener("touchend", this.mouseup);
      }
    }
    else if (action.state)
    {
      this.mouseup(event);
    }
    // No more cases
  }

  private mouseup(event: MouseEvent|TouchEvent)
  {
    const action = this.action;

    if (!action.state)
    {
      return;
    }

    action.state = null;
    action.direction = null;

    const element = this.element.nativeElement;
    const document = element.ownerDocument;

    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("touchmove", this.mousemove);
    document.removeEventListener("mouseup", this.mouseup);
    document.removeEventListener("touchend", this.mouseup);
  }

  private mousemove(event: MouseEvent|TouchEvent)
  {
    let emitter: EventEmitter<PopupComponent>;
    let left = this.left;
    let top = this.top;
    let width = this.width;
    let height = this.height;

    const action = this.action;
    const pos = this.getPosition(event);

    switch(action.state)
    {
      case "dragging":
      {
        emitter = this.move;
        left = action.left + pos.pageX - action.x;
        top = action.top + pos.pageY - action.y;

        break;
      }
      case "resizing":
      {
        emitter = this.size;

        switch(action.direction)
        {
          case "right-bottom-corner":
          {
            width = action.width + pos.pageX - action.x;
            height = action.height + pos.pageY - action.y;

            break;
          }
          case "right-top-corner":
          {
            top = pos.pageY;
            width = action.width + pos.pageX - action.x;
            height = action.height - pos.pageY + action.y;

            break;
          }
          case "left-top-corner":
          {
            left = action.left + pos.pageX - action.x;
            top = pos.pageY;
            width = action.width - pos.pageX + action.x;
            height = action.height - pos.pageY + action.y;

            break;
          }
          case "left-bottom-corner":
          {
            left = pos.pageX;
            width = action.width - pos.pageX + action.x;
            height = action.height + pos.pageY - action.y;

            break;
          }
          case "left-bar":
          {
            left = action.left + pos.pageX - action.x;
            width = action.width - pos.pageX + action.x;

            break;
          }
          case "right-bar":
          {
            width = action.width + pos.pageX - action.x;

            break;
          }
          case "top-bar":
          {
            top = pos.pageY;
            height = action.height - pos.pageY + action.y;

            break;
          }
          case "bottom-bar":
          {
            height = action.height + pos.pageY - action.y;

            break;
          }
          default:
          {
            return;
          }
        }

        break;
      }
    }

    const leftChanged = this.left !== left;
    const topChanged = this.top !== top;
    const widthChanged = this.width !== width;
    const heightChanged = this.height !== height;

    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.restore(left, top, width, height);

    if (leftChanged || topChanged || widthChanged || heightChanged || emitter)
    {
      this.ngZone.run(() =>
      {
        if (leftChanged)
        {
          this.leftChange.
            emit(typeof left === "number" ? left + "px" : left);
        }
    
        if (topChanged)
        {
          this.topChange.
            emit(typeof top === "number" ? top + "px" : top);
        }
    
        if (widthChanged)
        {
          this.widthChange.
            emit(typeof width === "number" ? width + "px" : width);
        }
    
        if (heightChanged)
        {
          this.heightChange.
            emit(typeof height === "number" ? height + "px" : height);
        }
    
        if (emitter)
        {
          emitter.emit(this);
        }
      });
    }
  }

  private getPosition(event: MouseEvent|TouchEvent):
    { pageX: number, pageY: number }
  {
    if (event instanceof MouseEvent)
    {
      return { pageX: event.pageX, pageY: event.pageY };
    }
    else
    {
      const touch = event.targetTouches[0];

      return { pageX: touch?.pageX, pageY: touch?.pageY };
    }
  }

  private getBoundingRect()
  {
    const element = this.element.nativeElement;
    const rect = element.getBoundingClientRect() as DOMRect;

    if (element.offsetParent)
    {
      rect.x += element.offsetParent.scrollLeft;
      rect.y += element.offsetParent.scrollTop;
    }

    return rect;
  }

  private restore(
    left: number|string,
    top: number|string,
    width: number|string,
    height: number|string)
  {
    if (typeof left === "number")
    {
      left = Math.max(left, 0) + "px";
    }

    if (typeof top === "number")
    {
      top = Math.max(top, 0) + "px";
    }

    if (typeof width === "number")
    {
      width = width + "px";
    }

    if (typeof height === "number")
    {
      height = height + "px";
    }

    const element = this.element.nativeElement;

    if (left != null)
    {
      element.style.left = left;
    }

    if (top != null)
    {
      element.style.top = top;
    }

    if (width != null)
    {
      element.style.width = width;
    }

    if (height != null)
    {
      element.style.height = height;
    }
  }

  private adjustPosition(adjust?: boolean)
  {
    const element = this.element.nativeElement;
    const parent = element.offsetParent;

    if (!parent)
    {
      return;
    }

    if (!element.offsetWidth || !element.offsetHeight)
    {
      return;
    }

    const clientWidth = parent.clientWidth;
    const clientHeight = parent.clientHeight;
    const rect = this.getBoundingRect();

    let left = rect.left;
    let top = rect.top;

    if (rect.right > clientWidth)
    {
      adjust = true;
      left -= rect.right - clientWidth + 1;
    }

    if (left < 0)
    {
      left = 0;
      adjust = true;
    }

    if (rect.bottom > clientHeight)
    {
      adjust = true;
      top -= rect.bottom - clientHeight + 1;
    }

    if (top < 0)
    {
      top = 0;
      adjust = true;
    }

    if (adjust)
    {
      this.left = left;
      this.top = top;
      this.restore(left, top, this.width, this.height);
    }
  }

  private contentInitialized: boolean;
}
