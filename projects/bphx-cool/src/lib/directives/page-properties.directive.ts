import { Directive, Input } from "@angular/core";
import { OnChanges, SimpleChanges, Inject } from "@angular/core";
import { VIEW_ACCESSOR, View } from "../api/dialog/view";

@Directive(
{
  selector:
    "[coolPageSize],[coolScrollSize],[coolDefaultField]," +
    "[coolTitle],[coolDisplayErrorMessage]"
})
export class PagePropertiesDirective implements OnChanges
{
  /**
   * Display error message indicator.
   */
  @Input()
  coolDisplayErrorMessage?: boolean;

  /**
   * Default title.
   */
  @Input()
  coolTitle?: string;

  /**
   * A page size.
   */
  @Input()
  coolPageSize?: number|string;

  /**
   * A scroll size.
   */
  @Input()
  coolScrollSize?: number|string;

  /**
   * Creates `PagePropertiesDirective` instance.
   * @param view a `View` reference.
   */
  constructor(@Inject(VIEW_ACCESSOR) public view: View)
  {
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    const procedure = this.view.coolProcedure;

    if ("coolPageSize" in changes)
    {
      procedure.pageSize = this.coolPageSize ? Number(this.coolPageSize) : 0;
    }

    if ("coolScrollSize" in changes)
    {
      procedure.scrollSize =
        this.coolScrollSize ? Number(this.coolScrollSize) : 0;
    }
  }
}
