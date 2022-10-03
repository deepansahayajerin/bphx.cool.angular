/**
 * Initial position of the window.
 */
export const enum WindowPosition
{
  /**
   * window or dialog is placed where it was indicate during design.
   */
  Desiged = "designed",

  /**
   * The center of the window or dialog falls wherever
   * mouse pointer happens to be.
   */
  Mouse = "mouse",

  /**
   * System determines where to place the window or dialog.
   */
  System = "system"
}
