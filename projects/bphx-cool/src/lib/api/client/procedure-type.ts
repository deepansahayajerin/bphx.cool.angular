/**
 * A procedure type.
 */
export const enum ProcedureType
{
  /**
   * Unknown procedure.
   */
  Default = "default",
  /**
   * A batch procedure.
   */
  Batch = "batch",
  /**
   * An online procedure.
   */
  Online = "online",
  /**
   * A window procedure.
   */
  Window = "window",
  /**
   * A server procedure.
   */
  Server = "server"
}
