/**
 * A termination action.
 */
export const enum TerminationAction {
  /**
   * Normal (commit) action.
   */
  Normal = "normal",
  /**
   * Rollback action.
   */
  Rollback = "rolback",
  /**
   * Abort action.
   */
  Abort = "abort"
}
