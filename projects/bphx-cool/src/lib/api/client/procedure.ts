import { State } from "./state";
import { CommandView } from "./command-view";
import { Window } from "./window";
import { ProcedureType } from "./procedure-type";
import { Json } from "../json";

/**
 * Base interface for a procedure.
 */
export interface ProcedureBase
{
  /**
   * A procedure id.
   */
  id: number;

  /**
   * A procedure name.
   */
  name: string;

  /**
   * A changed indicator.
   * Used to re-request procedure's state.
   */
  changed?: boolean;

  /**
   * A locked indicaator.
   */
  locked?: boolean;

  /**
   * A procedure type.
   */
  type: ProcedureType;

  /**
   * A procedure scope.
   */
  scope?: string;

  /**
   * Procedure import.
   */
  in?: Json;

  /**
   * Procedure export.
   */
  out?: Json;

  /**
   * Page size for online.
   */
  pageSize?: number;

  /**
   * Scroll size for online.
   */
  scrollSize?: number;

  /**
   * Page offset for online.
   */
  pageOffset?: number;
}

/**
 * A procedure.
 */
export interface Procedure extends ProcedureBase
{
  /**
   * Commands passed, if any.
   */
  commands?: { [name: string]: CommandView };

  /**
   * A digest of windows and their controls.
   */
  windows?: Window[];

  /**
   * Optional state.
   */
  readonly state?: { [name: string]: unknown }|null;
}

/**
 * A procedure digest.
 */
export interface ProcedureDigest extends ProcedureBase
{
  /**
   * Commands passed, if any.
   */
  commands?: CommandView[];

  /**
   * A digest of windows and their controls.
   */
  windows?: State[];
}
