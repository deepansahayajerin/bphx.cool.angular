import { ViewElement } from "./view-element";
import { Observable } from "rxjs";
import { InjectionToken } from "@angular/core";
import { View } from "./view";
import { Global } from "../client/global";
import { Procedure } from "../client/procedure";
import { HandleParams } from "./handle-params";
import { DialogState } from "./dialog-state";
import { MessageType } from "../client/message-type";
import { Window } from "../client/window";
import { Field } from "./field";
import { JsonObject } from "../json";
import { InitAction } from "./init-action";

export const DIALOG_ACCESSOR = new InjectionToken<Dialog>("coolDialog");

/**
 * An application dialog.
 */
export interface Dialog extends ViewElement
{
  /**
   * A `Global` instance.
   */
  readonly global: Global;

  /**
   * Current mode value passed from the server.
   */
  readonly mode?: string;

  /**
   * Opaque state index.
   */
  readonly index?: number;

  /**
   * An array of procedures.
   */
  readonly procedures: Procedure[];

  /**
   * List of all windows per procedure in display order.
   */
  readonly windows: Window[];

  /**
   * A set of views.
   */
  views?: Map<Element, View>;

  /**
   * Active `View` instance, if any.
   */
  activeView?: View;

  /**
   * Queue of events pending to be submutted.
   */
  readonly queue: HandleParams[];

  /**
   * An init action read when dialog is initialized.
   */
  readonly initAction?: InitAction;

  /**
   * Dialog state.
   */
  readonly state: DialogState;

  /**
   * Tests whether the application is pending for response.
   * Value greater than zero means that request is in process.
   */
  pending: number;

  /**
   * Mouse pointer clientX.
   */
  readonly clientX: number;

  /**
   * Mouse pointer clientY.
   */
  readonly clientY: number;

  /**
   * A session state.
   */
  readonly session?: JsonObject;

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
  start(params?: HandleParams): Observable<boolean>;

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
  fork(): Observable<boolean>;

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
  get(params?: HandleParams): Observable<boolean>;

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
  changeDialect(dialect: string): Observable<boolean>;

  /**
   * Triggers an application event.
   * In most cases it results into server postback, and screen update.
   *
   * #### Implementation details:
   *
   * `handle()` is asynchronous function that delegates work to `Client` class.
   *
   * Depending on `params.action` passed, following methods are called:
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
  handle(params: HandleParams): Observable<boolean>;

  /**
   * Triggers window close event.
   * @param window a window to close.
   * @param event optional event object.
   * @returns an observable that completes with response.
   */
  close(window: Window, event?: Event): Observable<boolean>;

  /**
   * Triggers window activate event.
   * @param window a window to activate.
   * @param event - optional event object.
   * @returns an observable that completes with response.
   */
  activate(window: Window, event?: Event): Observable<boolean>;

  /**
   * Invalidates view after server roundtrip.
   */
  updateView(): void;

  /**
   * Gets message text by resource id.
   * @param id - a resource id.
   * @param optional arguments.
   * @returns a message text.
   */
  message(id: string, ...args): string;

  /**
   * Gets type of alert message type, if any.
   * Alert may come from validation or from `Global.messageType`.
   */
  readonly alert: MessageType;

  /**
   * An array of alert messages, if any.
   */
  readonly alertMessages: string[];

  /**
   * Indicates whether alert is closed.
   *
   * `true` when alert is manually closed, in this case no exit state messages
   * are displayed till the next request to the server.
   */
  readonly alertClosed: boolean;

  /**
   * A callback called by alert component.
   *
   * If alert is manually closed then `alertClosed` is set to `true`.
   * @param event an event object.
   */
  refreshAlert(event: Event);

  /**
   * Shows a an alert message.
   * @param type - a type of alert.
   * @param message - an alert message.
   * @returns Observable to subscibe to alert.
   */
  showAlert(type: MessageType, message: string): Observable<string>;

  /**
   * Gets a scroll amount in rows base on the `Global`'s `scrollAmt` value, and
   * on the `pageSize` of the procedure.
   * @param procedure a reference `Procedure` instance.
   */
  getScrollAmt(procedure: Procedure): number;

  /**
   * Gets a field by `Element`.
   * @param element a DOM element to get field for.
   * @returns a Field for a dom element.
   */
   getField(element: Element): Field;
}
