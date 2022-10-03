/**
 * A request type.
 */
export const enum RequestType
{
  /**
   * Get request.
   */
  Get = "get",

  /**
   * Command request.
   */
  Command = "command",

  /**
   * Event request.
   */
  Event = "event",

  /**
   * Changes dialect request.
   */
  ChangeDialect = "changeDialect",

  /**
   * Current state request.
   */
  Current = "current",

  /**
   * Starts application request.
   */
  Start = "start",

  /**
   * Forks the application state request.
   */
  Fork = "fork",

  /**
   * A help request.
   */
  Help = "help"
}
