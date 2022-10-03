/**
 * A dialog state.
 */
export const enum DialogState
{
  /**
   * Dialog manager is ready for the interaction.
   */
  Ready = "ready",

  /**
   * A message box is being shown.
   */
  MessageBox = "messageBox",

  /**
   * Request is being processed.
   */
  Pending = "pending",

  /**
   * An error state.
   */
  Error = "error",

  /**
   * Application ended.
   */
  Ended = "ended"
}
