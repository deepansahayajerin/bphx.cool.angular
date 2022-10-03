import { Observable, of, EMPTY, forkJoin } from "rxjs";
import { tap, switchMap, catchError, map, defaultIfEmpty } from "rxjs/operators";
import { HostListener, Input, Inject, Optional, OnDestroy, NgZone } from "@angular/core";
import { Component, ViewEncapsulation, Injector } from "@angular/core";
import { ViewContainerRef, ElementRef, OnInit } from "@angular/core";
import { CommandView } from "../../api/client/command-view";
import { ErrorHandlerService } from "../../services/error-handler.service";
import { EventObject } from "../../api/client/event-object";
import { KeyStatus } from "../../api/client/key-status";
import { ProcedureType } from "../../api/client/procedure-type";
import { MessageBoxService } from "../../services/message-box.service";
import { MessageType } from "../../api/client/message-type";
import { MessagesService } from "../../services/messages.service";
import { UploadBoxService } from "../../services/upload-box.service";
import { Global } from "../../api/client/global";
import { DialogState } from "../../api/dialog/dialog-state";
import { HandleParams, Validation } from "../../api/dialog/handle-params";
import { RequestType } from "../../api/client/request-type";
import { Response } from "../../api/client/response";
import { Client, CLIENT_ACCESSOR } from "../../api/client/client";
import { Request } from "../../api/client/request";
import { Control } from "../../api/client/control";
import { Procedure } from "../../api/client/procedure";
import { Window, WindowState } from "../../api/client/window";
import { ResponseType } from "../../api/client/response-type";
import { getMessageBoxButtons } from "../../api/client/message-box-buttons";
import { isVisible, isDisabled, isSelect, isReadonly, toBoolean } from "../../api/utils";
import { elementsInTabOrder } from "../../api/utils";
import { isInputText, isMenuItem, nodeName } from "../../api/utils";
import { OptionsService } from "../../services/options.service";
import { DialogLocation } from "../../api/dialog/dialog-location";
import { DIALOG_LOCATION_ACCESSOR } from "../../api/dialog/dialog-location";
import { Dialog, DIALOG_ACCESSOR } from "../../api/dialog/dialog";
import { View } from "../../api/dialog/view";
import { LAUNCH_ACCESSOR, Launch } from "../../api/dialog/launch";
import { StateService, SESSION_ACCESSOR } from "../../api/state-service";
import { PageResolver, PAGE_RESOLVER } from "../../api/page-resolver";
import { WindowPosition } from "../../api/client/window-position";
import { Field } from "../../api/dialog/field";
import { fromState, toState } from "../../api/client/state";
import { Json, JsonObject, fromAttributes, mapArray } from "../../api/json";
import { PageComponent } from "../../api/page-component";
import { InitAction } from "../../api/dialog/init-action";

/**
 * A dialog directive.
 *
 * During init dialog executes action specified in the location, which can be:
 * - start - to (re)start the application;
 * - fork - to form current execution state;
 * - get - to refresh the application state.
 *
 * Start action uses following formats:
 *   - `url/` (nothing is specified after "#" hash sign).
 *   - `url/#/start`.
 *     In these cases application is started from default procedure.
 *   - `url/#/start/Procedure?in=json_data`.
 *   - `url/#/exec/Procedure?in=json_data`.
 *   - `url/#/startTran/Command?in=json_data`.
 *   - `url/#/execTran/Command?in=json_data`.
 *     Where
 *       `Procedure` - is a start procedure name;
 *       into import after application has started.
 *       `Command` - is a nexttran value.
 *       `in=json_data` - is optional import data in json format to merge
 *   - `url/#id/fork` - forks current execution state.
 *   - `url/#id` - refreshes the state from server.
 */
@Component(
{
  selector: "cool-dialog,[coolDialog]",
  exportAs: "dialog",
  templateUrl: "./dialog.component.html",
  styleUrls: ["./dialog.component.css"],
  providers:
  [
    { provide: DIALOG_ACCESSOR, useExisting: DialogComponent }
  ],
  encapsulation: ViewEncapsulation.None
})
export class DialogComponent implements Dialog, OnInit, OnDestroy
{
  /**
   * A `ViewContainerRef` for message boxes.
   */
  @Input()
  viewContainerRef?: ViewContainerRef;

  /**
   * Optional access key(s) for activate next window.
   */
  @Input()
  nextWindowAccessKey?: string;

  /**
   * Optional access key(s) for activate previous window.
   */
  @Input()
  prevWindowAccessKey?: string;

  /**
   * Optional screen width assumed at design time.
   */
  @Input()
  designWidth?: number;

  /**
   * Optional screen height assumed at design time.
   */
  @Input()
  designHeight?: number;
  
  /**
   * A `Global` instance.
   */
  global: Global = {};

  /**
   * Current mode value passed from the server.
   */
  mode?: string;

  /**
   * Opaque state index.
   */
  index?: number;

  /**
   * An array of procedures.
   */
  procedures: Procedure[] = [];

  /**
   * List of all windows per procedure in display order.
   */
  windows: Window[] = [];

  /**
   * A set of views.
   */
  views = new Map<Element, View>();

  /**
   * Active `View` reference, if any.
   */
  activeView?: View;

  /**
   * Queue of events pending to be submutted.
   */
  queue: HandleParams[] = [];

  /**
   * An init action read when dialog is initialized.
   */
  initAction?: InitAction;

  /**
   * Dialog state.
   */
  state: DialogState;

  /**
   * Tests whether the application is pending for response.
   * Value greater than zero means that request is in process.
   */
  get pending(): number
  {
    return this.internalPending;
  }

  /**
   * Sets a pending state.
   */
  set pending(value: number)
  {
    this.internalPending = value;
    this.updateState();
  }

  /**
   * Mouse pointer clientX.
   */
  clientX: number;

  /**
   * Mouse pointer clientY.
   */
  clientY: number;

  /**
   * A session state.
   */
  get session(): JsonObject
  {
    if (!this.dialogSession)
    {
      if ((this.index == null) || !this.sessionState)
      {
        return {};
      }

      this.dialogSession =
        this.sessionState.get("coolDialog:" + this.index, {});
    }

    return this.dialogSession;
  }

  /**
   * An activate timer ID.
   */
  activateTimeout: null|ReturnType<typeof setTimeout>;

  /**
   * Creates a `DialogDirective` instance.
   * @param injector an `Injector` instance.
   * @param viewContainerRef a `ViewContainerRef` instance.
   * @param element an element reference.
   * @param dialogLocation a `DialogLocation` instance.
   * @param sessionState a `SessionService` instance.
   * @param messagesService a `MessagesService` instance.
   * @param messageBoxService a `MessageBoxService` instance.
   * @param uploadBoxService a `UploadBoxService` instance.
   * @param errorHandlerService a `ErrorHandlerService` instance.
   * @param pageResolver a `PageResolver` service.
   * @param client a `Client` instance.
   * @param launch a `Launch` instance.
   * @param optionsService an `OptionsService` instance.
   * @param ngZone a angular zone service.
   */
  constructor(
    public injector: Injector,
    viewContainerRef: ViewContainerRef,
    public element: ElementRef<HTMLElement>,
    @Optional() @Inject(DIALOG_LOCATION_ACCESSOR)
    public dialogLocation: DialogLocation,
    @Optional() @Inject(SESSION_ACCESSOR) 
    public sessionState: StateService,
    public messagesService: MessagesService,
    public messageBoxService: MessageBoxService,
    public uploadBoxService: UploadBoxService,
    public errorHandlerService: ErrorHandlerService,
    @Inject(PAGE_RESOLVER)
    public pageResolver: PageResolver,
    @Inject(CLIENT_ACCESSOR) public client: Client,
    @Optional() @Inject(LAUNCH_ACCESSOR) 
    public launch: Launch,
    public optionsService: OptionsService,
    private ngZone: NgZone)
  {
    this.viewContainerRef = viewContainerRef;
    element.nativeElement.classList.add("coolDialog");

    this.mousemove = this.mousemove.bind(this);
    this.focusin = this.focusin.bind(this);
    this.focusout = this.focusout.bind(this);

    ngZone.runOutsideAngular(() =>
    {
      element.nativeElement.addEventListener("focusin", this.focusin);
      element.nativeElement.addEventListener("focusout", this.focusout);
      element.nativeElement.ownerDocument.
        addEventListener("mousemove", this.mousemove);
    });
  }

  ngOnDestroy(): void
  {
    const element = this.element.nativeElement;

    element.removeEventListener("focusin", this.focusin);
    element.removeEventListener("focusout", this.focusout);
    element.ownerDocument.removeEventListener("mousemove", this.mousemove);
  }

  ngOnInit(): void
  {
    this.updateState();

    if (this.dialogLocation)
    {
      const init = this.initAction = this.dialogLocation.initState();

      this.index = init.index;

      let initAction: Observable<boolean>;

      switch(init.action)
      {
        case RequestType.Start:
        {
          initAction = this.start(
          {
            action: RequestType.Start,
            restart: init.restart,
            procedureName: init.procedure,
            commandLine: init.commandLine,
            displayFirst: init.displayFirst,
            params: init.params
          });

          break;
        }
        case RequestType.Fork:
        {
          initAction = this.fork();

          break;
        }
        case RequestType.Get:
        {
          initAction = this.get();

          break;
        }
      }

      if (initAction)
      {
        initAction.subscribe(result =>
        {
          if (result && init.in)
          {
            const procedure = this.procedures[0];

            if (procedure)
            {
              if (procedure.in)
              {
                Object.assign(procedure.in, init.in);
              }
              else
              {
                procedure.in = init.in;
              }
            }
          }
        });
      }
    }
  }

  /**
   * Gets message text by resource id.
   *
   * `MessagesService` and `Global.currentDialect` are used
   * to resolve resouces.
   * @param id - a resource id.
   * @param args optional arguments.
   * @returns a message text.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  message(id: string, ...args): string
  {
    const messagesService = this.messagesService;
    const message = messagesService.getMessage(id, this.global.currentDialect);

    return typeof message === "string" ?
      messagesService.format(message, ...args) : message?.(...args);
  }

  /**
   * Gets type of alert message type, if any.
   * Alert may come from validation or from `Global.messageType`.
   */
  get alert(): MessageType
  {
    if (this.pending)
    {
      return MessageType.None;
    }

    const activeView = this.activeView;
    const form = activeView?.form;

    return form?.dirty && !form.valid ? MessageType.Warning :
      !activeView && !this.alertClosed && this.global.errmsg ?
        this.global.messageType : null;
  }

  /**
   * An array of alert messages, if any.
   */
  get alertMessages(): string[]
  {
    const messages: string[] = [];
    const alert = this.alert;

    if (!alert || (alert === MessageType.None))
    {
      return messages;
    }

    const activeView = this.activeView;
    const form = activeView?.form;

    if (form?.dirty && !form.valid)
    {
      let hasMessages = false;

      for(const name in form.controls)
      {
        const control = form.controls[name];

        if (control.errors)
        {
          for(const key in control.errors)
          {
            const error = control.errors[key];

            if (error?.pattern)
            {
              const message = this.message("validation." + key, error.pattern);

              if (message)
              {
                hasMessages = true;
                messages.push(message);
              }
            }
          }
        }
      }

      if (!hasMessages)
      {
        const message = this.message("validation.error");

        if (message)
        {
          messages.push(message);
        }
      }
    }

    if (!activeView && this.global.messageType && !!this.global.errmsg)
    {
      messages.push(this.global.errmsg);
    }

    return messages;
  }

  /**
   * Indicates whether alert is closed.
   *
   * `true` when alert is manually closed, in this case no exit state messages
   * are displayed till the next request to the server.
   */
  alertClosed: boolean;

  /**
   * A callback called by alert component.
   *
   * If alert is manually closed then `alertClosed` is set to `true`.
   * @param event an event object.
   */
  refreshAlert(event: Event): void
  {
    if (event && (event.type === "click"))
    {
      this.alertClosed = true;
    }
  }

  /**
   * Shows a an alert message.
   * @param type - a type of alert.
   * @param message - an alert message.
   * @returns Observable to subscibe to alert.
   */
  showAlert(type: MessageType, message: string): Observable<string>
  {
    return of("").
      pipe(
        switchMap(() =>
        {
          if (this.state !== DialogState.Ready)
          {
            return EMPTY;
          }

          const style = type === MessageType.Warning ? "Exclamation" :
            type === MessageType.Error ? "Critical" : "Information";

          this.internalState = DialogState.MessageBox;
          this.updateState();

          return this.messageBoxService.open(
            this.viewContainerRef,
            style,
            this.message(style) ?? style,
            message,
            [{ name: "OK", text: this.message("OK") }],
            "OK");
        }),
        tap(() =>
        {
          this.internalState = null;
          this.updateState();
        }));
  }

  /**
   * Gets a scroll amount in rows base on the `Global`'s `scrollAmt` value, and
   * on the `pageSize` of the procedure.
   * @param procedure a reference `Procedure` instance.
   */
  public getScrollAmt(procedure: Procedure): number
  {
    const value = this.global.scrollAmt ?? "PAGE";

    if (value === "CURS")
    {
      return 1;
    }

    const pageSize = procedure.pageSize ?? 0;

    return value === "HALF" ? pageSize >> 1 : pageSize;
  }

  @HostListener("input", ["$event"])
  onInput(event: Event): void
  {
    const target = event.target as HTMLElement;

    if (this.activeView &&
      target.hasAttribute("coolAutotab") &&
      ("value" in target) &&
      (target["maxLength"] > 0) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((target as any).value?.length >= (target as any).maxLength))
    {
      const elements =
        elementsInTabOrder(this.activeView.element.nativeElement);
      let index = elements.indexOf(target);

      if (index >= 0)
      {
        if (++index === elements.length)
        {
          index = 0;
        }

        const field = this.getField(elements[index]);

        field?.focus?.();
      }
    }
  }

  private setSelection(element: HTMLElement, selectionRangeOnly: boolean)
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!element || !isInputText(element) || !(element as any).select)
    {
      return;
    }

    const field = this.getField(element);

    if (!field)
    {
      return;
    }

    const control = field.control;

    try
    {
      let selected = false;
      const attributes = control?.attributes;

      if (attributes)
      {
        const start = attributes.SelectionStart;
        const end = attributes.SelectionEnd;

        if ((start != null) && (end != null))
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (element as any).setSelectionRange(Number(start), Number(end));
          selected = true;
          delete attributes.SelectionStart;
          delete attributes.SelectionEnd;
        }
      }

      if (!selected && !selectionRangeOnly)
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element as any).select();
      }
    }
    catch(e)
    {
      // Fine.
    }
  }

  /**
   * Gets a field by `Element`.
   * @param element a DOM element to get field for.
   * @returns a Field for a dom element.
   */
  getField(element: Element): Field
  {
    if (!element)
    {
      return null;
    }

    const fieldElement = element.closest("[coolType]");

    if (!fieldElement)
    {
      return null;
    }

    const viewElement = fieldElement.closest(".coolView");

    if (!viewElement)
    {
      return null;
    }

    return this.views.get(viewElement)?.fields?.get(fieldElement);
  }

  private mousemove(event: MouseEvent)
  {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  }

  private focusin(event: FocusEvent): void
  {
    const target = event.target as HTMLElement;

    if (target.classList.contains("coolUpdatingFocus"))
    {
      return;
    }

    const field = this.getField(target);

    if (field)
    {
      field.element.nativeElement.classList.add("coolFocused");

      if (field.view?.coolWindow)
      {
        field.view.coolWindow.focused = field.coolName;
      }
    }

    this.setSelection(target, false);
  }

  private focusout(event: FocusEvent): void
  {
    const target = event.target as HTMLElement;

    if (target.classList.contains("coolUpdatingFocus"))
    {
      return;
    }

    const field = this.getField(target);

    if (!field)
    {
      return;
    }

    const view = field.view;
    const focusedElements =
      view.element.nativeElement.querySelectorAll(".coolFocused");

    for(let i = 0; i < focusedElements.length; ++i)
    {
      focusedElements[i].classList.remove("coolFocused");
    }

    const window = view.coolWindow;

    if (!window || !window.focused || (this.state !== DialogState.Pending))
    {
      return;
    }

    if (target.classList.contains("ng-dirty") &&
      target.classList.contains("ng-invalid"))
    {
      setTimeout(
        () =>
        {
          const message = this.alertMessages[0];

          if (message)
          {
            this.ngZone.run(() =>
            {
              this.showAlert(this.alert, message).
                subscribe(() => target.focus());
            });
          }
        },
        this.optionsService.validationAlertDelay);
    }
  }

  @HostListener("document:keydown", ["$event"])
  keydown(event: KeyboardEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (this.internalState &&
      (this.internalState !== DialogState.Ended))
    {
      return;
    }

    if (event.metaKey)
    {
      return;
    }

    const target = event.target as HTMLElement;
    const field = this.getField(target);
    const view = field?.view ?? this.activeView;
    const window = view?.coolWindow;
    const procedure = view?.coolProcedure;

    if (window && this.pending)
    {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const isMenu = isMenuItem(target);
    const isTextElement = isInputText(target, false);
    const isSelectElement = isSelect(target);
    const isReadOnly = isReadonly(target);
    const ctrlKey = event.ctrlKey;
    const shiftKey = event.shiftKey;
    const altKey = event.altKey;
    let key = event.key;
    let type = 0;

    switch(key)
    {
      case "Control":
      case "Shift":
      case "Alt":
      case "Meta":
      {
        return;        
      }
      case "F1":
      case "F2":
      case "F3":
      case "F4":
      case "F5":
      case "F6":
      case "F7":
      case "F8":
      case "F9":
      case "F10":
      case "F11":
      case "F12":
      case "F13":
      case "F14":
      case "F15":
      case "F16":
      case "F17":
      case "F18":
      case "F19":
      case "F20":
      case "F21":
      case "F22":
      case "F23":
      case "F24":
      {
        type = 3;

        break;
      }
      case "Enter":
      case "Return":
      {
        switch(nodeName(target))
        {
          case "textarea":
          case "button":
          case "a":
          {
            return;
          }
          case "input":
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            switch((target as any).type.toLowerCase())
            {
              case "button":
              {
                return;
              }
            }
          }
        }

        key = "Enter";
        type = 1;

        break;
      }
      case "Tab":
      {
        type = 2;

        break;
      }
      case " ":
      {
        key = "Space";

        break;
      }
    }

    const accesskey = (ctrlKey ? "Ctrl+" : "") +
      (shiftKey ? "Shift+" : "") +
      (altKey ? "Alt+" : "") +
      (key ? key.toUpperCase() : "");

    if (window &&
      (altKey || 
        ctrlKey || 
        isReadOnly || 
        !(isTextElement || isSelectElement) ||
        (type === 1) ||
        (type === 3)))
    {
      const accessElement = view.element.nativeElement.
        querySelector("[coolAccesskey~='" + accesskey + "']") as HTMLElement;

      if (!isDisabled(accessElement))
      {
        event.preventDefault();
        event.stopPropagation();

        this.blurActiveElement();

        setTimeout(
          () =>
          {
            accessElement.click();
            this.getField(accessElement)?.focus?.();
          },
          this.optionsService.gainFocusOffset);

        return;
      }
    }

    if ((type === 1) && view.defaultField)
    {
      const defaultField = view.defaultField;
      const modelAccessor = defaultField.modelAccessor;
      const fieldElement = (modelAccessor ?
        modelAccessor.element : defaultField.element)?.nativeElement;

      //event.preventDefault();
      //event.stopPropagation();
      // this.blurActiveElement();

      if (fieldElement)
      {
        setTimeout(
          () =>
          {
            fieldElement.click();
            // defaultField.focus();
          },
          this.optionsService.gainFocusOffset);
      }

      return;
    }

    if (type === 3)
    {
      event.preventDefault();
      event.stopPropagation();

      if (shiftKey && 
        (key === "F4") && 
        window && 
        (procedure.type == ProcedureType.Window))
      {
        this.close(window, event).subscribe();
      }
      else if (!window)
      {
        this.handle(
        {
          action: RequestType.Command,
          command: "INVALID",
          validate: Validation.MayBeInvalid,
          defer: false,
          procedure
        }).subscribe();
      }

      return;
    }

    const nextWindow =
      this.activeView &&
      this.activeView.coolWindow &&
      this.nextWindowAccessKey &&
      (this.nextWindowAccessKey.split(" ").indexOf(accesskey) !== -1);

    const prevWindow =
      !nextWindow &&
      this.activeView &&
      this.activeView.coolWindow &&
      this.prevWindowAccessKey &&
      (this.prevWindowAccessKey.split(" ").indexOf(accesskey) !== -1);

    if (nextWindow || prevWindow)
    {
      let candidateWindow: Window = null;
      let foundActive = false;

      Cycle:

      for(const currentProcedure of this.procedures)
      {
        for(const currentWindow of currentProcedure.windows)
        {
          if (currentWindow.locked)
          {
            continue;
          }

          if (nextWindow)
          {
            if (currentWindow === this.activeView.coolWindow)
            {
              foundActive = true;
            }
            else
            {
              if (foundActive)
              {
                candidateWindow = currentWindow;

                break Cycle;
              }

              if (!candidateWindow)
              {
                candidateWindow = currentWindow;
              }
            }
          }
          else
          {
            if (currentWindow === this.activeView.coolWindow)
            {
              if (candidateWindow)
              {
                break Cycle;
              }
            }
            else
            {
              candidateWindow = currentWindow;
            }
          }
        }
      }

      if (candidateWindow)
      {
        event.preventDefault();
        event.stopPropagation();
        this.activate(candidateWindow, event).subscribe();

        return;
      }
    }

    if (window &&
      (type === 0) &&
      !shiftKey &&
      !ctrlKey &&
      (altKey || isMenu || isReadOnly ||
      !(isTextElement || isSelectElement)))
    {
      const elements =
      [
        isMenu && target.closest("ul"),
        (altKey || !isMenu) && view.element.nativeElement
      ];

      try
      {
        for(const targetElement of elements)
        {
          if (!targetElement)
          {
            continue;
          }

          const shortcutElements = targetElement.querySelectorAll(
            "[coolShortcut='" + key.toLowerCase() + "']," +
            "[coolShortcut='" + key.toUpperCase() + "']");

          for(let i = 0; i < shortcutElements.length; i++)
          {
            let shortcutElement = shortcutElements[i] as HTMLElement;

            if (!isVisible(shortcutElement) || isDisabled(shortcutElement))
            {
              continue;
            }

            let shortcutField = this.getField(shortcutElement);
            const controlElement =
              shortcutField && shortcutField.element.nativeElement;

            if (controlElement &&
              controlElement.matches("[coolSubmenu].coolExpanded"))
            {
              continue;
            }

            event.preventDefault();
            event.stopPropagation();

            this.blurActiveElement();

            setTimeout(
              () =>
              {
                shortcutElement.click();


                if (isMenuItem(controlElement))
                {
                  const child =
                    controlElement.querySelector("a+ul>[coolType=MENUITEM]");

                  shortcutElement = child && child.querySelector("a");

                  if (shortcutElement)
                  {
                    shortcutField = this.getField(shortcutElement);
                  }
                }

                shortcutField?.focus?.();
              },
              this.optionsService.gainFocusOffset);

            return;
          }
        }
      }
      catch(e)
      {
        // Continue.
      }
    }

    if ((ctrlKey ||
      shiftKey ||
      altKey ||
      (type === 3) ||
      !(isTextElement || isSelectElement)))
    {
      // Global access keys.
      const accesskeyElement = this.element.nativeElement.querySelector(
        ":not(.coolView) [coolAccesskey~='" + accesskey + "']") as
        HTMLElement;

      if (isVisible(accesskeyElement))
      {
        event.preventDefault();
        event.stopPropagation();

        if (!isDisabled(accesskeyElement))
        {
          this.blurActiveElement();

          setTimeout(
            () =>
            {
              accesskeyElement.click();

              const accessField = this.getField(accesskeyElement);

              accessField?.focus?.();
            },
            this.optionsService.gainFocusOffset);
        }

        return;
      }
    }
  }

  @HostListener("document:paste", ["$event"])
  paste(event: ClipboardEvent): void
  {
    if (event.defaultPrevented)
    {
      return;
    }

    if (this.internalState &&
      (this.internalState !== DialogState.Ended))
    {
      return;
    }

    const target = event.target as HTMLElement;
    const field = this.getField(target);
    const view = field?.view ?? this.activeView;
    const window = view?.coolWindow;
    const procedure = view?.coolProcedure;

    if (procedure.type !== ProcedureType.Online)
    {
      return;
    }

    if (window && this.pending)
    {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const isTextElement = isInputText(target, false);
    const isReadOnly = isReadonly(target);

    if (!isTextElement || isReadOnly)
    {
      return;
    }

    const values = event.clipboardData.getData("text")?.
      replace(/\r?\n\s*$/, "").
      split(/\r?\n/).
      map(line => line.split("\t"));

    if (!values?.length)
    {
      return;
    }

    const elements = 
      elementsInTabOrder(view.element.nativeElement, isInputText);
    let input = target as HTMLInputElement;
    const inputCol = Number(input.getAttribute("coolCol"));
    const inputLength = Number(input.getAttribute("coolLength"));
    let inputRow = Number(input.getAttribute("coolRow"));
    let index = elements.indexOf(input);

    if (index === -1)
    {
      return;
    }

    event.preventDefault();

    let firstRow = true;
    
    for(const row of values)
    {
      if (firstRow)
      {
        firstRow = false;
      }
      else
      {
        let found = false;

        while(++index < elements.length)
        {
          input = elements[index] as HTMLInputElement;
          
          const nextCol = Number(input.getAttribute("coolCol"));
          const nextRow = Number(input.getAttribute("coolRow"));
          const nextLength = Number(input.getAttribute("coolLength"));

          if ((nextRow > inputRow) && 
            (((nextCol >= inputCol) && (nextCol < inputCol + inputLength)) ||
            ((inputCol >= nextCol) && (inputCol < nextCol + nextLength))))
          {
            found = true;
            inputRow = nextRow;

            break;
          }
        }

        if (!found)
        {
          return;
        }
      }
  
      let firstCol = true;
  
      for(const col of row)
      {
        if (firstCol)
        {
          firstCol = false;
        }
        else
        {
          if (index >= elements.length)
          {
            return;
          }

          input = elements[++index] as HTMLInputElement;
          inputRow = Number(input.getAttribute("coolRow"));
        }

        if (!input)
        {
          return;
        }

        if (!input.readOnly && !input.disabled)
        {
          const value = (input.maxLength >= 0 ? 
            col.substring(0, input.maxLength) : col).replace(/\s+$/, "");
  
          if (value !== input.value)
          {
            input.value = value;
            input.dispatchEvent(new Event("change"));
          }
        }
      }
    }
  }

  /**
   * Starts or restarts the application. This function is shorthand of:
   *
   * ```
   * dialog.handle(
   * {
   *   action: DialogAction.Start,
   *   validate: false,
   *   defer: false
   * });
   * ```
   * @param params start parameters instance.
   * @returns an observable that completes with response.
   */
  start(params?: HandleParams): Observable<boolean>
  {
    if (!params)
    {
      params = { action: RequestType.Start };
    }
    else
    {
      params.action = RequestType.Start;
    }

    params.validate = Validation.MayBeInvalid;
    params.defer = false;
    this.internalState = null;
    this.updateState();

    return this.handle(params);
  }

  /**
   * Forks the application state. This function is shorthand of:
   *
   * ```
   * dialog.handle(
   * {
   *   action: DialogAction.Fork,
   *   validate: false,
   *   defer: false
   * });
   * ```
   * @returns an observable that completes with response.
   */
  fork(): Observable<boolean>
  {
    return this.handle(
    {
      action: RequestType.Fork,
      validate: Validation.MayBeInvalid,
      defer: false
    });
  }

  /**
   * Gets current state of procedure of application. This function is
   * shorthand of:
   *
   * ```
   * dialog.handle(
   * {
   *   action: DialogAction.Current,
   *   validate: false,
   *   defer: false
   * });
   * ```
   * or
   * ```
   * dialog.handle(
   * {
   *   action: DialogAction.Get,
   *   window: ...,
   *   validate: false,
   *   defer: false
   * });
   * ```
   * @param params get parameters instance.
   * @returns an observable that completes with response.
   */
  get(params?: HandleParams): Observable<boolean>
  {
    if (!params)
    {
      params = 
      { 
        action: RequestType.Current, 
        validate: Validation.MayBeInvalid, 
        defer: false 
      };
    }
    else
    {
      params.action = RequestType.Get;
      params.validate = Validation.MayBeInvalid;
      params.defer = false;
    }

    return this.handle(params);
  }

  /**
   * Changes current dialect. This function is shorthand of:
   *
   * ```
   * dialog.global.currentDialect = dialect;
   *
   * dialog.handle(
   * {
   *   action: DialogAction.ChangeDialect,
   *   validate: false,
   *   defer: false
   * });
   * ```
   * @param dialect a dialect value.
   * @returns an observable that completes with response.
   */
  changeDialect(dialect: string): Observable<boolean>
  {
    this.global.currentDialect = dialect;

    return this.handle(
    {
      action: RequestType.ChangeDialect,
      validate: Validation.MayBeInvalid,
      defer: false
    });
  }

  /**
   * Triggers an application event.
   * In most cases it results into server postback, and screen update.
   *
   * #### Implementation details:
   *
   * `handle()` is asynchronous function that delegates work to `Client` class.
   *
   * Depending on `params.action` passed, following methods are called:
   *   - `Client.command()` - to send a command;
   *   - `Client.event()` - to send an event;
   *   - `Client.get()` - to get current procedure state;
   *   - `Client.current()` - to get current application state;
   *   - `Client.start()` - to start the application;
   *   - `Client.changeDialect()` - to change current dialect in global;
   *   - `Client.fork()` - to fork application state;
   *
   * `DialogAction.Event` actions might be queued before sending them
   * to the server, if `params.defer` is specified.
   *
   * Following events exploit event queueing:
   *   - Click, when the same control triggers also DoubleClick;
   *   - GainFocus and LoseFocus (these will usually go with Click);
   *   - Changed (this will usually goes with Click);
   *
   * **Note:** Though this allows to reduce server round trips by passing
   * group of events to to the server in a single call, this is not only
   * optimization but also a required technique to handle a sequence
   * of events that happen in close proximity, like:
   *   - `Focus`, `Click`;
   *   - `Changed`, `Click`;
   *   - `Click`, `DoubleClick`;
   *
   * `EventObject` passed along with `'event'` action identifies an event type,
   * source window and source control.
   * Server uses this information to find an event handler to call.
   *
   * While request is being sent, `handle()` turns dialog's `state`
   * into `DialogState.Pending`.
   * When request is complete dialog's `state` is `DialogState.Ready`.
   * When application is finished `state` is `DialogState.Ended`.
   *
   * Depending on response and response type several actions
   * can take place:
   *   - `ResponseType.Default` - current window is displayed.
   *   - `ResponseType.Navigate` - navigation is done.
   *   - `ResponseType.MessageBox` - message box is shown;
   *   - `ResponseType.End` - application is finished;
   *   - error - error handler is called (show error message box).
   *
   * `ResponseType.Default` means no navigation has taken place.
   * Response contains:
   *   - current import, export and global instances;
   *   - digest of procedures with windows and their controls;
   *   - command views and launch commands;
   *
   * `ResponseType.Navigate` means navigation has occurred.
   * Response contains a list of procedure digests.
   * `handle()` issues `DialogAction.Get` calls to get states
   * of updated procedures.
   * Original call completes when all nested requests complete.
   *
   * `ResponseType.MessageBox'` triggers a message box dialog.
   * Response contains message box parameters.
   * After message box is closed a `DilogAction.Command` call is
   * issued with message box outcome. Original call completes when
   * nested requests completes, including command with message outcome.
   * @param params - parameters instance.
   * @returns an observable that completes with response.
   */
  handle(params: HandleParams): Observable<boolean>
  {
    return new Observable(subscribe =>
    {
      const procedure = params.procedure;

      if (procedure && !procedure.id)
      {
        subscribe.next(false);

        return;
      }

      const form = params.form;
      const window = params.window;
      const action = params.action;
      let isCommand = action === RequestType.Command;
      let serviceAction: Exclude<RequestType, RequestType.Command> =
        action === RequestType.Command ? RequestType.Event : action;
      const type = params.type;

      if (isCommand && (params.command === "HELP"))
      {
        isCommand = false;
        serviceAction = RequestType.Help;
        params.validate = Validation.MayBeInvalid;
        params.deduplicate = false;
        params.defer = false;
      }

      if ((this.internalState === DialogState.Ended) ||
        (window && window.locked &&
          !((action === RequestType.Event) &&
            ((type === "Activated") || (type === "Close")))))
      {
        subscribe.next(false);

        return;
      }

      params.subscriber = subscribe;
      params.serviceAction = serviceAction;

      if (isCommand)
      {
        const global = this.global;

        if (stringEqual(params.command, "ENTER") &&
          !stringEqual(global.command, global.$$command))
        {
          params.command = global.command;
        }

        params.eventObject =
        {
          type: "Command",
          command: params.command
        };

        const commands = procedure.commands;
        const view = commands && commands[params.command];

        if (view && view.autoFlow)
        {
          params.validate = Validation.MayBeInvalid;
        }
      }
      else
      {
        if (params.clearQueue)
        {
          this.clearQueue(false);
        }

        const event = params.event;
        const eventComponent = params.targetWindow ? undefined :
          params.component ?? undefined;
        const eventWindow =
          params.targetWindow ?? window?.name ?? undefined;

        if (event)
        {
          const target = event.target as HTMLElement;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = event as any;

          const eventObject: EventObject =
          {
            type: params.type,
            component: eventComponent,
            window: eventWindow,
            command: params.command ?? undefined,
            character: params.key ?? e.key ?? undefined,
            x: e.screenX ?? 0,
            y: e.screenY ?? 0,
            currentText: params.value != null ? params.value :
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (target as any)?.value ?? undefined
          };

          if (e.altKey)
          {
            eventObject.alt = KeyStatus.Down;
          }

          if (e.ctrlKey)
          {
            eventObject.ctrl = KeyStatus.Down;
          }

          if (e.shiftKey)
          {
            eventObject.shift = KeyStatus.Down;
          }

          params.eventObject = eventObject;
        }
        else
        {
          const eventObject: EventObject =
          {
            type: params.type,
            component: eventComponent,
            window: eventWindow,
            currentText:
              typeof params.value === "string" ? params.value : undefined
          };

          params.eventObject = eventObject;
        }
      }

      if (params.canceled?.("prepare") === true)
      {
        subscribe.next(false);

        return;
      }

      if (params.attribute)
      {
        params.eventObject.attribute = params.attribute;
      }

      if (params.data)
      {
        params.eventObject.data = params.data.map(toState);
      }

      if (form && !form.valid && (params.validate !== Validation.MayBeInvalid))
      {
        if (params.validate === Validation.CancelInvalid)
        {
          subscribe.next(false);

          return;
        }

        form.form.markAsDirty();

        if (this.activeView)
        {
          const message = this.alertMessages[0];

          if (message)
          {
            return this.
              showAlert(this.alert, message).
              subscribe(() => subscribe.next(false));
          }
        }

        subscribe.next(false);

        return;
      }

      if (params.deduplicate)
      {
        for(let i = 0, length = this.queue.length; i < length; ++i)
        {
          const item = this.queue[i];

          if ((item.window === params.window) &&
            (item.action === params.action) &&
            (item.type === params.type) &&
            (item.command === params.command) &&
            (item.field === params.field) &&
            (item.component === params.component) &&
            (item.targetWindow === params.targetWindow))
          {
            item.subscriber?.next(false);
            this.queue.splice(i, 1);

            break;
          }
        }
      }

      this.queue.push(params);

      if (!(params.defer < 0))
      {
        if (this.handlingTimeout != null)
        {
          clearTimeout(this.handlingTimeout);
          this.handlingTimeout = null;
        }

        this.handlingTimeout = setTimeout(
          () =>
          {
            this.handlingTimeout = null;

            if (!this.pending)
            {
              this.processQueue();
            }
          },
          !params.defer || (params.defer === true) ? 0 : params.defer);
      }
    });
  }

  /**
   * Triggers window close event.
   * @param window a window to close.
   * @param event optional event object.
   * @returns an observable that completes with response.
   */
  close(window: Window, event?: Event): Observable<boolean>
  {
    if (!window.locked)
    {
      switch(window.procedure.type)
      {
        case ProcedureType.Window:
        {
          return this.handle(
          {
            action: RequestType.Event,
            type: "Close",
            procedure: window.procedure,
            window,
            validate: Validation.MayBeInvalid,
            event,
            clearQueue: true,
            passData: false
          });
        }
        case ProcedureType.Online:
        {
          const element = (event?.target as HTMLElement) ?? 
            this.element.nativeElement;

          element.dispatchEvent(
            new KeyboardEvent("keydown", { key: "F3", bubbles: true }));

          break;
        }
      }
    }

    return of(false);
  }

  /**
   * Triggers window activate event.
   * @param window a window to activate.
   * @param event - optional event object.
   * @returns an observable that completes with response.
   */
  activate(window: Window, event?: Event): Observable<boolean>
  {
    return new Observable(subscriber =>
    {
      clearTimeout(this.activateTimeout);

      this.activateTimeout = null;

      if (window.active)
      {
        subscriber.next(false);

        return;
      }

      this.activateTimeout = setTimeout(() =>
      {
        const activeView = this.activeView;
        const form = activeView && activeView.form;

        return form && form.dirty ?
          this.
            handle(
            {
              action: RequestType.Event,
              type: "Deactivated",
              procedure: activeView.coolWindow.procedure,
              window: activeView.coolWindow,
              event,
              defer: false
            }).
            pipe(
              switchMap(result =>
              {
                for(const currentProcedure of this.procedures)
                {
                  if (window.procedure.id === currentProcedure.id)
                  {
                    for(const currentWindow of currentProcedure.windows)
                    {
                      if (window.name === currentWindow.name)
                      {
                        return this.handle(
                        {
                          action: RequestType.Event,
                          type: "Activated",
                          procedure: currentProcedure,
                          window: currentWindow,
                          event,
                          passData: false,
                          defer: false
                        });
                      }
                    }
                  }
                }

                return of(result);
              })).subscribe(subscriber) :
          this.handle(
          {
            action: RequestType.Event,
            type: "Activated",
            procedure: window.procedure,
            window,
            event,
            passData: false,
            defer: false
          }).subscribe(subscriber);
        },
        this.optionsService.activateDelay);
    });
  }

  /**
   * Invalidates view after server roundtrip.
   */
  updateView(): void
  {
    clearTimeout(this.updatingViewTimeout);

    this.updatingViewTimeout = setTimeout(
      () =>
      {
        if (this.pending || this.queue.length || !this.activeView)
        {
          return;
        }

        this.activeView.form?.form.markAsPristine();
        this.alertClosed = false;
        this.updateFocus();
      },
      this.optionsService.updatingViewDelay);
  }

  private updateFocus()
  {
    if (this.state !== DialogState.Ready)
    {
      return;
    }

    const activeView = this.activeView;

    if (!activeView)
    {
      return;
    }

    const window = activeView.coolWindow;
    const element = activeView.element.nativeElement;
    let matchedElement =
      find(element.querySelectorAll("[coolError]")) ??
      find(element.querySelectorAll("[coolFocus='1'],[coolFocus='2']"));

    if (!matchedElement)
    {
      if (window)
      {
        matchedElement = (window.focused && find(element.querySelectorAll(
          "[coolName='" + window.focused + "']," +
          "label[coolName='" + window.focused + "']>[tabindex]"))) ??
          find(elementsInTabOrder(element));
      }
      else
      {
        matchedElement =
          find(element.querySelectorAll("[coolVideo][coolType]"));
      }

      if (!matchedElement)
      {
        matchedElement =
          element.querySelector("[coolCommand][coolType=action]");
      }

      if (!matchedElement && window)
      {
        matchedElement = elementsInTabOrder(element).
          sort((item1, item2) =>
            (item1.offsetTop - item2.offsetTop) ||
              (item1.offsetLeft - item2.offsetLeft))[0];
      }
    }

    const activeElement = element.ownerDocument.activeElement as HTMLElement;

    if (matchedElement)
    {
      if (activeElement === matchedElement)
      {
        this.setSelection(matchedElement, true);
      }
      else
      {
        const matchedField = this.getField(matchedElement);

        if (matchedField)
        {
          const element = matchedField.element.nativeElement;

          element.classList.add("coolUpdatingFocus");

          try
          {
            matchedField.focus?.();
          }
          finally
          {
            element.classList.remove("coolUpdatingFocus");
          }

          this.setSelection(element, false);
        }
      }
    }
    else
    {
      if (activeElement &&
        activeElement.blur &&
        !element.contains(activeElement) &&
        !element.matches("body"))
      {
        activeElement.classList.add("coolUpdatingFocus");

        try
        {
          activeElement.blur();
        }
        finally
        {
          activeElement.classList.remove("coolUpdatingFocus");
        }
      }
    }

    function isSelected(item: HTMLElement): boolean
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!((item as any).checked ??
        item.querySelector(":not(option):checked") ??
        item.querySelector("tr.selected"));
    }

    function find(elements: HTMLElement[]|NodeListOf<HTMLElement>)
    {
      let foundElement: HTMLElement = null;
      let selected = false;
      let priority = 0;
      let tabIndex = null;
      const length = elements ? elements.length : 0;

      for(let i = 0; i < length; ++i)
      {
        const item = elements[i];

        if (!isVisible(item) || isDisabled(item))
        {
          continue;
        }

        const index = item.tabIndex;

        if (window &&
          window.focused &&
          (window.focused === item.getAttribute("coolName")))
        {
          foundElement = item;

          break;
        }
        else if ((priority < 1) && (index >= 0))
        {
          priority = 1;
          foundElement = item;
          tabIndex = index;
          selected = isSelected(item);
        }
        else if ((priority === 1) && (index >= 0) &&
          ((tabIndex === index) ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((foundElement as any).name === (item as any).name)) &&
          !selected &&
          isSelected(item))
        {
          foundElement = item;
          tabIndex = index;
          selected = true;
        }
        // No more cases.

        const focused = item.getAttribute("coolFocus");

        if (focused === "2")
        {
          foundElement = item;

          break;
        }
        else if ((priority < 2) && (focused === "1"))
        {
          priority = 2;
          foundElement = item;
          tabIndex = index;
        }
        else if ((priority < 1) &&
          item.getAttribute("coolVideo") && (index >= 0))
        {
          priority = 1;
          foundElement = item;
          tabIndex = index;
          selected = isSelected(item);
        }
        else if ((priority < 1) && (index >= 0) &&
          ((tabIndex == null) || (tabIndex > index)))
        {
          foundElement = item;
          tabIndex = index;
          selected = isSelected(item);
        }
        // No more cases.
      }

      return foundElement;
    }
  }

  /**
   * Clears the queue.
   * @param force to force clearing the queue.
   *   if value is true then all queue is cleared,
   *   otherwise only events are cleared.
   */
  private clearQueue(force: boolean)
  {
    const newQueue: HandleParams[] = [];

    this.queue.forEach(item =>
    {
      if (force ||
        (item.action === RequestType.Event) ||
        (item.action === RequestType.Command) ||
        (item.action === RequestType.Help))
      {
        item.subscriber?.next(false);
      }
      else
      {
        newQueue.push(item);
      }
    });

    this.queue = newQueue;

    if (!newQueue.length && (this.handlingTimeout != null))
    {
      clearTimeout(this.handlingTimeout);
      this.handlingTimeout = null;
    }
  }

  /**
   * Processes groups of requests in the queue.
   */
  private processQueue()
  {
    const items: HandleParams[] = [];

    while(this.queue.length)
    {
      const item = this.queue[0];

      if ((item.window && !item.window.id) || (item.canceled?.("process") === true))
      {
        this.queue.shift();

        continue;
      }

      if (item.canceled)
      {
        // Refresh attributes
        if (item.attribute)
        {
          item.eventObject.attribute = item.attribute;
        }

        if (item.data)
        {
          item.eventObject.data = item.data.map(toState);
        }
      }

      const isEvent = item.window &&
        (item.serviceAction === RequestType.Event);

      if (items.length && !(isEvent && (item.window === items[0].window)))
      {
        break;
      }

      this.queue.shift();
      items.push(item);

      if (!isEvent)
      {
        break;
      }
    }

    if (items.length)
    {
      this.processRequest(items).
        subscribe(() => this.processQueue(), () => this.clearQueue(true));
    }
  }

  private processRequest(items: HandleParams[]): Observable<boolean>
  {
    const global = this.global;
    const params = items[0];
    const procedure = params.procedure;
    const window = params.window;
    const action =
      params.serviceAction as Exclude<RequestType, RequestType.Command>;
    const request: Request = { dialog: this, action };

    // If procedure is invalidated then cancel request.
    if (procedure && !procedure.id)
    {
      return of(false);
    }

    if (global.scrollAmt && (global.scrollAmt !== "PAGE"))
    {
      (request.global ??= {}).scrollAmt = global.scrollAmt;
    }

    if (global.nexttran)
    {
      (request.global ??= {}).nexttran = global.nexttran;
    }

    if (global.clientUserId)
    {
      (request.global ??= {}).clientUserId = global.clientUserId;
    }

    if (global.dialog)
    {
      (request.global ??= {}).dialog = global.dialog;
    }

    if (global.exitState)
    {
      (request.global ??= {}).exitState = global.exitState;
    }

    if (global.exitStateId)
    {
      (request.global ??= {}).exitStateId = global.exitStateId;
    }

    switch(action)
    {
      case RequestType.Start:
      {
        request.restart = params.restart;
        request.commandLine = params.commandLine;
        request.displayFirst = params.displayFirst;
        request.params = params.params;
      }
      // falls through
      case RequestType.ChangeDialect:
      {
        (request.global || (request.global = {})).currentDialect =
          global.currentDialect;

        break;
      }
    }

    if (this.index != null)
    {
      request.index = this.index;
    }

    const eventObjects: EventObject[] = [];
    let commandParams: HandleParams = null;

    items.forEach(item =>
    {
      if (item.action === RequestType.Command)
      {
        commandParams = item;
      }

      if (item.eventObject)
      {
        eventObjects.push(item.eventObject);
      }
    });

    if (eventObjects.length)
    {
      request.events = eventObjects;
    }

    if (procedure)
    {
      request.id = procedure.id;
      request.procedure = procedure.name;

      if ((procedure.scrollSize != null) && commandParams)
      {
        let offset: number;

        switch(commandParams.command)
        {
          case "TOP":
          {
            offset = 0;

            break;
          }
          case "BOTTOM":
          {
            offset = procedure.scrollSize - this.getScrollAmt(procedure);

            break;
          }
          case "PREV":
          {
            offset = (procedure.pageOffset ?? 0) - this.getScrollAmt(procedure);

            break;
          }
          case "NEXT":
          {
            offset = (procedure.pageOffset ?? 0) + this.getScrollAmt(procedure);

            break;
          }
          case "RESET":
          {
            offset = 0;

            break;
          }
        }

        if ((offset >= 0) && (offset < procedure.scrollSize))
        {
          procedure.pageOffset = offset;
          global.errmsg = "";
          this.resolve(items);
          this.processed();

          return of(true);
        }
      }

      if (params.passData !== false)
      {
        request.in = prepareRequestView(procedure.in) || {};

        if (window && (procedure.type == ProcedureType.Window))
        {
          if (window.active)
          {
            request.focused = window.focused;
          }

          if (window.controls)
          {
            const controls: { [name: string]: Control } = {};

            for(const name in window.controls)
            {
              const control = window.controls[name];
              const accessor = control.field?.modelAccessor;
              const valueChanged = accessor &&
                (accessor.initialValue != control.value);

              if (valueChanged || control.disabledState)
              {
                const item: Control = { name };
                let hasData = false;

                if (valueChanged)
                {
                  hasData = true;
                  item.value = control.value;
                }

                if (control.disabledState)
                {
                  hasData = true;
                  item.disabledState = true;
                }

                if (hasData)
                {
                  controls[name] = item;
                }
              }
            }

            request.controls = toState(controls)?.map ?? null;
          }
        }
      }
    }
    else
    {
      request.procedure = params.procedureName;
    }

    return of(true).
      pipe(
        tap(() => ++this.pending),
        switchMap(() => this.client[action](request)),
        tap(() => --this.pending, () => --this.pending),
        switchMap(response => this.processResponse(items, request, response)),
        catchError(error =>
        {
          if (!error)
          {
            this.processed();
            this.resolve(items);

            return of(true);
          }

          let message = "";
          let id = 0;
          let type = "";
          let details = "";
          let stackTrace = "";

          if (typeof error === "string")
          {
            message = "Unknown error";
            details = error;
          }
          else
          {
            if ((error.status === 0) && (error.type !== "error"))
            {
              this.processed();
              this.resolve(items);

              return of(true);
            }

            if (error.status && error.statusText)
            {
              message = error.status + " " + error.statusText + " ";
            }

            if (error.message)
            {
              message += error.message;
            }

            if (error.errorID)
            {
              id = error.errorID;
            }

            if (error.exceptionType)
            {
              type = error.exceptionType;
            }

            if (error.exceptionMessage)
            {
              details = error.exceptionMessage;
            }

            if (error.stackTrace)
            {
              stackTrace = error.stackTrace;
            }
          }

          this.internalState = DialogState.Error;
          this.updateState();

          return this.errorHandlerService.
            open(
              this.viewContainerRef,
              message,
              id,
              type,
              details,
              stackTrace).
            pipe(
              tap(() =>
              {
                this.internalState = null;
                this.updateState();
                this.processed();
                this.resolve(items, false);
              }),
              map(() => true));
        }));
  }

  private processResponse(
    items: HandleParams[],
    request: Request,
    response: Response): Observable<boolean>
  {
    const params =  items[0];
    let procedure = params.procedure;

    if (!response.procedures)
    {
      response.procedures = [];
    }

    if (response.mode !== undefined)
    {
      this.mode = response.mode;
    }

    this.index = response.index || 0;

    if (this.dialogLocation)
    {
      this.dialogLocation.setIndex(this.index);
    }

    const refresh: Procedure[] = [];
    const ids: { [id: number]: Procedure } = {};

    this.procedures.forEach(item => ids[item.id] = item);

    const dialect = this.global.currentDialect;
    const totalWindows: Window[] = [];
    let lockIndex = -1;

    const pages: Observable<PageComponent>[] = [];

    const newProcedures = response.procedures.map((item, index) =>
    {
      const online = item.type === ProcedureType.Online;
      const currentProcedure = ids[item.id];
      const input = currentProcedure?.in;
      const output = currentProcedure?.out;
      let commands: { [name: string]: CommandView } = null;

      if (Array.isArray(item.commands))
      {
        commands = {};
        item.commands.forEach(command => commands[command.name] = command);
      }

      const currentWindows: { [name: string]: Window } = {};

      currentProcedure?.windows.
        forEach(window => currentWindows[window.name] = window);

      const newProcedure: Procedure =
      {
        id: item.id,
        type: item.type,
        name: item.name,
        scope: item.scope,
        locked: item.locked,
        pageSize: currentProcedure?.pageSize,
        scrollSize: currentProcedure?.scrollSize,
        in: (response.id === item.id) && response.in ?
          prepareResponseView(response.in, input) ?? {} : input,
        out: (response.id === item.id) && response.out ?
          prepareResponseView(response.out, output) ?? {} : output,
        commands: commands ?? (currentProcedure?.commands)
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newProcedure as any).state = getProcedureState(this, newProcedure);

      const windows =
        (item.windows?.
          map(window => fromState(window) as Window).
          filter(window => 
            (window.visible !== false) && 
            ((window.windowState == null) || 
              (window.windowState == WindowState.Opened))) ??
          currentProcedure?.windows ??
          (!online ? [] :
            [
              {
                name: item.name,
                caption: item.name,
                modal: false,
                displayExitStateMessage: false,
                resizable: true
              }
            ])).
          map(window =>
          {
            const totalIndex = totalWindows.length;
            const currentWindow = currentWindows[window.name];
            const controls =
              (window.digest ? currentWindow?.controls : window?.controls) ??
              {};

            // if (item.changed &&
            //   (window !== currentWindow) &&
            //   (controls === currentWindow?.controls))
            // {
            //   for(const name of Object.keys(controls))
            //   {
            //     const control = controls[name];

            //     control.disabledState = false;
            //   }
            // }

            const newWindow: Window =
            {
              procedure: newProcedure,
              name: window.name,
              caption: window.caption,
              left: window.left,
              top: window.top,
              width: window.width,
              height: window.height,
              position: window.position,
              focused: currentWindow && !window.controls ?
                currentWindow.focused : window.focused,
              modal: window.modal,
              resizable: window.resizable,
              errmsg: online ?
                response.global?.errmsg : window.errmsg,
              messageType: online ?
                response.global?.messageType : window.messageType,
              order: totalIndex + 1,
              active: false,
              id: (online ? procedure?.windows[0]?.id : null) ??
                currentWindow?.id ?? ++this.windowId,
              page: currentWindow?.page,
              controls,
            };

            if (!newWindow.page)
            {
              pages.push(
                this.pageResolver.
                  resolve(dialect, newProcedure, newWindow).
                  pipe(tap(page => newWindow.page = page)));
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (newWindow as any).state =
              (procedure?.type === ProcedureType.Online) &&
              (item.type === ProcedureType.Online) &&
              procedure?.windows[0]?.state ||
              getWindowState(this, newWindow);

            totalWindows.push(newWindow);

            if (newProcedure.locked || newWindow.modal)
            {
              lockIndex = totalIndex;
            }

            return newWindow;
          }).
          sort((item1, item2) => item1.id - item2.id);

      newProcedure.windows = windows;

      if (procedure === currentProcedure)
      {
        procedure = newProcedure;
      }

      if (item.changed || (index === response.procedures.length - 1))
      {
        refresh.push(newProcedure);
      }

      return newProcedure;
    });

    newProcedures.sort((item1, item2) => item1.id - item2.id);

    totalWindows.forEach(
      (window, index) => window.locked = index <= lockIndex);

    if (lockIndex > 0)
    {
      for(let i = 0; i < lockIndex; ++i)
      {
        totalWindows[i].locked = true;
      }
    }

    const launches = this.launch && response.launches;
    const activeWindow = totalWindows[totalWindows.length - 1] || null;

    return forkJoin(pages).
      pipe(
        defaultIfEmpty(null),
        switchMap(() =>
        {
          switch(response.responseType)
          {
            default:
            case ResponseType.Default:
            {
              this.setProcedures(newProcedures);

              if (activeWindow)
              {
                activeWindow.active = true;
                activeWindow.locked = false;
              }

              this.updateDialog(response);
              this.resolve(items);
              this.processed();

              return of(true);
            }
            case ResponseType.Navigate:
            {
              this.clearQueue(false);

              for(let i = refresh.length; i-- > 0;)
              {
                this.
                  handle(
                  {
                    action: RequestType.Get,
                    validate: Validation.MayBeInvalid,
                    defer: false,
                    procedure: refresh[i]
                  }).
                  subscribe();
              }

              this.resolve(items);

              return of(true);
            }
            case ResponseType.MessageBox:
            {
              if (activeWindow)
              {
                activeWindow.active = false;
              }

              this.setProcedures(newProcedures);
              this.updateDialog(response);

              const messageBox = fromAttributes(response.messageBox ?? {});

              this.internalState = null;
              this.updateState();

              switch(messageBox.type)
              {
                default:
                {
                  const buttons = getMessageBoxButtons(messageBox.buttons).
                    map(name => ({ name, text: this.message(name) }));
                  const defaultButton =
                    buttons[messageBox.defaultButton - 1] ??
                    buttons[0];

                  return this.messageBoxService.
                    open(
                      this.viewContainerRef,
                      messageBox.style,
                      messageBox.title ?? this.message(messageBox.style),
                      messageBox.text?.replace(/\r\n|\r|\n/g, "\n"),
                      buttons,
                      defaultButton && defaultButton.name).
                    pipe(
                      switchMap(command =>
                        this.handle(
                        {
                          action: RequestType.Command,
                          command: 
                            (command === "Escape") || (command === "Close") ?
                              defaultButton?.name : command,
                          validate: Validation.MayBeInvalid,
                          defer: false,
                          passData: false,
                          procedure
                        })),
                      tap(
                        () => this.resolve(items), 
                        () => this.resolve(items, false)));
                }
                case "FileOpen":
                {
                  return this.uploadBoxService.
                    open(
                      this.viewContainerRef,
                      messageBox.title ?? this.message("uploadBox.title"),
                      (messageBox.text ?? this.message("uploadBox.text"))?.
                        replace(/\r\n|\r|\n/g, "\n"),
                      toBoolean(messageBox.attribute?.["multiple"]),
                      messageBox.attribute?.["accept"]).
                    pipe(
                      switchMap(files =>
                        this.handle(
                        {
                          action: RequestType.Command,
                          command: files?.length ? "OK" : "Cancel",
                          validate: Validation.MayBeInvalid,
                          defer: false,
                          passData: false,
                          data: files as unknown as Json[],
                          procedure
                        })),
                      tap(
                        () => this.resolve(items), 
                        () => this.resolve(items, false)));
                }
              }
            }
            case ResponseType.End:
            {
              this.internalState = DialogState.Ended;
              this.updateState();
              this.clearQueue(true);
              this.setProcedures([]);
              this.activeView = null;
              this.resolve(items);

              return of(true);
            }
          }
        }),
        tap(() =>
        {
          const windows = [];

          for(const procedure of this.procedures)
          {
            if ((procedure.id != null) && procedure.in && procedure.out)
            {
              const procedureWindows = procedure.windows;

              for(let i = procedureWindows.length; i-- > 0;)
              {
                windows.push(procedureWindows[i]);
              }
            }
          }

          this.windows = windows;
        }),
        tap(() =>
        {
          launches?.forEach(item =>
            this.launch.launch(
              this,
            fromAttributes(item).attribute as { [name: string]: unknown }));
        }));
  }

  private processed()
  {
    this.updateView();
  }

  private resolve(items: HandleParams[], reject?: boolean)
  {
    items.forEach(item => item.subscriber?.next(!reject));
  }

  private setProcedures(procedures: Procedure[])
  {
    procedures ??= [];

    // Refresh queue items, if possible.
    if (procedures.length && this.queue.length)
    {
      const map = procedures.reduce((map, procedure) =>
      {
        if (!procedure.changed)
        {
          map[procedure.id] = procedure;
        }

        return map;
      },
      {} as { [id: string]: Procedure});

      this.queue.forEach(item =>
      {
        const procedure = map[item?.procedure?.id];

        if (procedure)
        {
          item.procedure = procedure;
        }
      });
    }

    this.procedures.forEach(item => item.id = null);
    this.procedures = procedures;
  }

  /**
   * Updates dialog state.
   */
  private updateDialog(response: Response)
  {
    const timestamp = response.timestamp;
    const global = response.global ?? {};

    if (timestamp)
    {
      global.currentTimestamp = timestamp;
      global.currentDate =
        typeof timestamp === "string" ? timestamp.substring(0, 10) : timestamp;
      global.currentTime =
        typeof timestamp === "string" ? timestamp.substring(11, 19) : timestamp;
    }

    global.$$command = global.command;
    this.global = global;
  }

  private blurActiveElement()
  {
    const activeElement  =
      this.element.nativeElement.ownerDocument.activeElement as HTMLElement;

    if (activeElement && activeElement.focus)
    {
      // This is to trigger change event, if required.
      activeElement.classList.add("coolUpdatingFocus");

      try
      {
        activeElement.blur();
        activeElement.focus();
      }
      finally
      {
        activeElement.classList.remove("coolUpdatingFocus");
      }
    }
  }

  private updateState(): void
  {
    const state = this.pending ? DialogState.Pending :
      this.internalState || DialogState.Ready;

    if (state !== this.state)
    {
      const element = this.element.nativeElement;

      if (this.state)
      {
        element.classList.remove(this.state);
      }

      this.state = state;

      if (state)
      {
        element.classList.add(state);
      }
    }
  }

  /**
   * A dialog state.
   */
  private internalState: DialogState;

  /**
   * A pending state.
   */
  private internalPending = 0;

  /**
   * A dialog session.
   */
  private dialogSession: JsonObject;

  /**
   * Handling timeout.
   */
  private handlingTimeout: null|ReturnType<typeof setTimeout>;

  /**
   * An updating view timeout.
   */
  private updatingViewTimeout: null|ReturnType<typeof setTimeout>;

  /**
   * A window id identifier.
   */
  private windowId = 0;
}

function prepareRequestView(view: Json): Json
{
  if (view == null)
  {
    return null;
  }

  if (Array.isArray(view))
  {
    if (!view.length)
    {
      return null;
    }

    view = [...view];
    view.forEach(prepareRequestView);

    return view;
  }

  if (typeof view !== "object")
  {
    return view;
  }

  let newView: JsonObject;

  for(const key in view)
  {
    const value = view[key];

    if (key === "screenField")
    {
      if (Array.isArray(value))
      {
        const screenField = [];

        value.forEach(item =>
        {
          delete item.focused;
          screenField.push(item);
        });

        if (screenField.length)
        {
          if (!newView)
          {
            newView = {};
          }

          newView.screenField = screenField;
        }
      }
    }
    else
    {
      if ((value !== 0) || (value !== "") || (value != null))
      {
        const newItem = prepareRequestView(value);

        if (newItem != null)
        {
          if (!newView)
          {
            newView = {};
          }

          newView[key] = newItem;
        }
      }
    }
  }

  return newView;
}

function prepareResponseView(view: Json, prev: Json): Json
{
  let changed = view !== prev;

  if (view)
  {
    const prevArray = Array.isArray(prev);

    if (Array.isArray(view))
    {
      changed = !prevArray || (view.length !== prev.length);

      view.forEach((value, index) =>
      {
        const prevValue = prevArray ? prev[index] : null;
        const newValue = prepareResponseView(value, prevValue) ?? {};

        if (newValue !== value)
        {
          view[index] = newValue;
        }

        if (prevArray && (prevValue !== newValue))
        {
          changed = true;
        }
      });
    }
    else if (typeof view === "object")
    {
      const prevObject = prev && !prevArray && (typeof prev === "object");

      changed = !prevObject;

      const screenField = mapArray(view["screenField"]);

      for(const name of Object.keys(view))
      {
        if (name === "screenField")
        {
          continue;
        }

        const item = view[name];
        const prevItem = prevObject ? prev[name] : null;
        const newItem = prepareResponseView(item, prevItem);

        if (!eq(newItem, item))
        {
          if (newItem == null)
          {
            if (prevItem != null)
            {
              changed = true;
            }

            continue;
          }
          else
          {
            view[name] = newItem;
          }
        }

        if (prevObject && !eq(newItem, prevItem))
        {
          changed = true;
        }
      }

      if (!changed && prevObject && view)
      {
        for(const name in prev)
        {
          const item = prev[name];

          if ((item !== undefined) && (name[0] !== "$"))
          {
            const newValue = view[name];

            if (!eq(item, newValue))
            {
              changed = true;
            }
            // No more cases
          }
        }
      }

      if (screenField)
      {
        view["screenField"] = screenField;

        if (!changed && prev)
        {
          prev["screenField"] = screenField;
        }
      }
    }
    // No more cases.
  }

  return changed ? view : prev;
}

function eq(first: unknown, second: unknown): boolean
{
  return (first === second) ||
    ((first == null) && (second == "")) ||
    ((second == null) && (first == ""));
}

function stringEqual(first: unknown, second: unknown): boolean
{
  return (first === second) ||
    ((typeof first === "string") &&
      (typeof second === "string") &&
      (first.trim() === second.trim()));
}

function getProcedureState(dialog: Dialog, procedure: Procedure): JsonObject
{
  const session = dialog.session;
  const procedures =
    session && (session.procedures || (session.procedures = {}));
  const id = procedure.id;

  return procedures ? procedures[id] || (procedures[id] = {}) : {};
}

function getWindowState(dialog: DialogComponent, window: Window): JsonObject
{
  const session = window.procedure.state;
  const windows = session.windows || (session.windows = {});
  let state = windows[window.name];

  if (!state)
  {
    windows[window.name] = state = {};

    const defaultView =
      dialog.element.nativeElement.ownerDocument.defaultView;
    const devicePixelRatio = defaultView.devicePixelRatio || 1;
    const availWidth = defaultView.screen.availWidth;
    const availHeight = defaultView.screen.availHeight;

    const left = window.left;
    const top =  typeof window.top === "number" ? window.top + "px" :window.top;
    const width = window.width ?? 0;
    const height = window.height ?? 0;
    const position = window.position ?? WindowPosition.Desiged;

    if (window.procedure?.type === "online")
    {
      state.left = "calc(50vw - 30em)";
      state.top = "calc(50vw - 20em)";
      state.width = "67.5em";
      state.height = "45em";
    }
    else
    {
      state.left = 
        position === WindowPosition.Mouse ?
          `calc(${dialog.clientX != null ? dialog.clientX : availWidth / 2
            }px - ${width}/${devicePixelRatio * 2})` :
        position === WindowPosition.System ?
          `calc(${(availWidth / 2)}px - ${width}/${devicePixelRatio * 2})` :
          left ?? 0;

      state.top =
        position === WindowPosition.Mouse ?
          `calc(${dialog.clientY != null ? dialog.clientY : availHeight / 2
            }px - ${height}/${devicePixelRatio * 2} - 3em)` :
        position === WindowPosition.System ?
          `calc(${availHeight / 2}px - ${height}/${devicePixelRatio * 2
            } - 3em` :
        dialog.designHeight ? 
          `calc(${top ?? 0}  - ${
            dialog.designHeight - defaultView.screen.height
            }px - 3em)` :
          `calc(${top ?? 0} - 3em)`;

      if (width && (width !== "0px"))
      {
        state.width = typeof width === "number" ? width + "px" : width;
      }
    }
  }

  return state;
}
