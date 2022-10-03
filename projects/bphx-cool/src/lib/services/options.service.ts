import { Injectable } from "@angular/core";

/**
 * Options used throughout the library.
 */
@Injectable({ providedIn: "root" })
export class OptionsService
{
  /**
   * A delay in milliseconds of sending LoseFocus and GainFocus events.
   */
  focusDelay = 200;

  /**
   * An offset in milliseconds of triggering LoseFocus event.
   */
  loseFocusOffset = 40;

  /**
   * An offset in milliseconds of triggering GainFocus.
   * events.
   */
  gainFocusOffset = 50;

  /**
   * A delay in milliseconds of triggering Keypress event.
   */
  keypressDelay = 10;

  /**
   * Debounce interval for the KeyPress event.
   */
  keyPressDebounceTime = 500;

  /**
   * A delay in milliseconds of triggering Changed event.
   */
  changedDelay = 300;

  /**
   * An offset in milliseconds of triggering Changed event.
   */
  changedOffset = 1;

  /**
   * An offset in milliseconds of triggering Changed event for
   * check or radio boxes.
   */
  radioOrCheckboxChangedOffset = 10;

  /**
   * A delay in milliseconds of triggering Click, and other Mouse
   * events over check or radio boxes.
   */
  radioOrCheckboxDelay = 10;

  /**
   * A delay in milliseconds of between two mousedown events
   * to trigger double click.
   */
  doubleClickDelay = 400;

  /**
   * A delay in milliseconds of triggering Click event using keyboard
   * selection in a table.
   */
  tableKeyboardSelectionDelay = 20;

  /**
   * A delay in milliseconds of marking selection in menu using mouse pointer.
   */
  menuMouseSelectioDelay = 150;

  /**
   * A menu expansion delay.
   */
  menuExpansionDelay = 600;

  /**
   * A delay in milliseconds of a validation alert of lose focus.
   */
  validationAlertDelay = 250;

  /**
   * A delay in milliseconds of activate event handler execution.
   */
  activateDelay = 400;

  /**
   * A delay for updating dialog view.
   */
  updatingViewDelay = 100;

  /**
   * A delay for updating fields.
   */
  updatingFieldsDelay = 0;
}
