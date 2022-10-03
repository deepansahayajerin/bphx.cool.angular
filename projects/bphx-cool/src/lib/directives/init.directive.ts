import { Subscription } from "rxjs";
import { Directive, Optional, OnInit, OnDestroy } from "@angular/core";
import { EventEmitter, Output, Inject } from "@angular/core";
import { View, VIEW_ACCESSOR } from "../api/dialog/view";
import { Procedure } from "../api/client/procedure";

/**
 * Initializes context.
 */
@Directive({ selector: "[coolInit]" })
export class InitDirective implements OnInit, OnDestroy
{
  /**
   * A context initializer.
   */
  @Output("coolInit")
  init = new EventEmitter(true);

  /**
   * Creates an {@link InitDirective} instance.
   * @param view optional `View` reference.
   */
  constructor(
    @Optional() @Inject(VIEW_ACCESSOR)
    public view: View)
  {
  }

  ngOnInit(): void
  {
    this.subscription = this.view?.update.subscribe(() => this.update());
    this.update();
  }

  ngOnDestroy(): void
  {
    this.subscription?.unsubscribe();
  }

  /**
   * Updates values.
   */
  public update(force = false): void
  {
    const procedure = this.view?.coolProcedure;

    if ((this.procedure !== procedure) || force)
    {
      this.procedure = procedure;
      this.init.emit();
    }
  }

  /**
   * A `Procedure` instance.
   */
  private subscription: Subscription;

  /**
   * A procedure reference.
   */
  private procedure: Procedure;
}
