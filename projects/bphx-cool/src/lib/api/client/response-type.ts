export const enum ResponseType
{
  /**
   * Default response, no navigation has occurred.
   */
  Default = "default",

  /**
   * Navigation has occured.
   */
  Navigate = "navigate",

  /**
   * Message box should be shown.
   */
  MessageBox = "messageBox",

  /**
   * End of application.
   */
  End = "end"
}
