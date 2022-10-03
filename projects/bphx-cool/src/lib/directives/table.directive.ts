import { Directive, Input, AfterContentInit, NgZone } from "@angular/core";
import { ContentChild, Optional, Inject } from "@angular/core";
import { HeaderDirective } from "./header.directive";
import { BodyDirective } from "./body.directive";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";

/**
 * A table that may synchronize header and footer.
 */
@Directive({ selector: "[coolTable]" })
export class TableDirective implements AfterContentInit
{
  /**
   * Indicates whether to scroll header horizontally in sync with body.
   */
  @Input()
  coolHorizontalScroll?: boolean;

  /**
   * A reference to the table header.
   */
  @ContentChild(HeaderDirective, { static: true })
  header?: HeaderDirective;

  /**
   * A reference to the table body.
   */
  @ContentChild(BodyDirective, { static: true })
  body?: BodyDirective;

  /**
   * Creates a `TableDirective` instance.
   * @param ngZone a angular zone service.
   * @param view a `View` reference.
   */
  constructor(
    private ngZone: NgZone,
    @Optional() @Inject(VIEW_ACCESSOR) public view?: View)
  {
  }

  ngAfterContentInit(): void
  {
    if (this.body && (this.coolHorizontalScroll != null))
    {
      this.ngZone.runOutsideAngular(() =>
      {
        this.body.element.nativeElement.addEventListener("scroll", () =>
        {
          if ((this.coolHorizontalScroll != null) && this.body && this.header)
          {
            this.header.element.nativeElement.scrollLeft =
              this.body.element.nativeElement.scrollLeft;
          }
        });
      });
    }
  }
}
