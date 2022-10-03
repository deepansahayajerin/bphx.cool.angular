import { Procedure } from "../api/client/procedure";
import { Directive, Optional, ElementRef, Inject } from "@angular/core";
import { OnChanges, SimpleChanges } from "@angular/core";
import { OnDestroy, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Window } from "../api/client/window";
import { Dialog, DIALOG_ACCESSOR } from "../api/dialog/dialog";
import { VIEW_ACCESSOR, View } from "../api/dialog/view";
import { Field } from "../api/dialog/field";
import { EventEmitter } from "@angular/core";
import { OptionsService } from "../services/options.service";

/**
 * A window or screen view directive.
 */
@Directive(
{
  selector: "[coolWindow],[coolProcedure]",
  providers:
  [
    { provide: VIEW_ACCESSOR, useExisting: ViewDirective }
  ]
})
export class ViewDirective implements View, OnDestroy, OnChanges
{
  /**
   * Creates a `WindowDirective` instance.
   * @param element an element reference.
   * @param form optional form reference.
   * @param dialog a `Dialog` reference.
   * @param optionsService optional `OptionsService` reference.
   */
  constructor(
    public element: ElementRef<HTMLElement>,
    @Optional() public form: NgForm,
    @Inject(DIALOG_ACCESSOR) public dialog: Dialog,
    @Optional() public optionsService: OptionsService)
  {
    this.element.nativeElement.classList.add("coolView");
    this.dialog.views?.set(element.nativeElement, this);
  }

  /**
   * A procedure instance.
   */
  @Input()
  coolProcedure?: Procedure;

  /**
   * A window instance.
   */
  @Input()
  coolWindow?: Window;

  /**
   * A default field.
   */
  @Input()
  defaultField: Field;


  /**
   * A set of view fields.
   */
  readonly fields = new Map<Element, Field>();

  /**
   * A view id.
   */
  get id(): string
  {
    const procedure = this.coolProcedure;
    const window = this.coolWindow;

    return "v" + (!procedure ? "" :
      !window ? procedure.id : (procedure.id + "." + window.name));
  }

  /**
   * Active indicator.
   */
  get active(): boolean
  {
    return this.dialog.activeView === this;
  }

  /**
   * An update event.
   */
  readonly update = new EventEmitter<View>();

  ngOnDestroy(): void
  {
    this.dialog.views?.delete(this.element.nativeElement);

    if (this.dialog.activeView === this)
    {
      this.dialog.activeView = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    const element = this.element.nativeElement;

    if (changes.coolProcedure || changes.coolWindow)
    {
      const window = this.coolWindow;
      const procedure = !changes.coolProcedure && changes.coolWindow ?
        (this.coolProcedure = window?.procedure) : this.coolProcedure;

      if (procedure)
      {
        element.setAttribute("coolProcedure", procedure.name);
        element.setAttribute("coolProcedureId", String(procedure.id));
      }
      else
      {
        element.removeAttribute("coolProcedure");
        element.removeAttribute("coolProcedureId");
      }

      if (window)
      {
        element.setAttribute("coolWindow", window.name);
      }
      else
      {
        element.removeAttribute("coolWindow");
      }

      if (window?.active)
      {
        this.dialog.activeView = this;
      }
      else
      {
        if (this.dialog.activeView === this)
        {
          this.dialog.activeView = null;
        }
      }

      clearTimeout(this.updatingTimeout);
      
      this.updatingTimeout = setTimeout(
        () => this.doUpdate(),
        this.optionsService?.updatingFieldsDelay);
    }
  }

  /**
   * Triggers update.
   */
  public doUpdate(): void
  {
    this.fields.forEach(field => field.update?.(true));
    this.update.emit(this);
  }

  /**
   * Updating timeout, if any.
   */
  private updatingTimeout: null|ReturnType<typeof setTimeout>;
}
