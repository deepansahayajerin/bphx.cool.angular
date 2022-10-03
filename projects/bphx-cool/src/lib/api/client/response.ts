import { LaunchCommand } from "./launch-command";
import { Global } from "./global";
import { ProcedureDigest } from "./procedure";
import { MessageBox } from "./message-box";
import { ResponseType } from "./response-type";
import { Json } from "../json";

/**
 * A service response object.
 */
export interface Response
{
  /**
   * Opaque application index.
   */
  index?: number;

  /**
   * A mode parameter.
   */
  mode?: string;

  /**
   * Current procedure id.
   */
  id?: number;

  /**
   * Response timestamp.
   */
  timestamp?: string|Date;

  /**
   * A response type.
   */
  responseType: ResponseType;

  /**
   * An import structure.
   */
  in?: Json;

  /**
   * An export structure.
   */
  out?: Json;

  /**
   * A global data structure.
   */
  global?: Global;

  /**
   * A list of current procedures.
   */
  procedures?: ProcedureDigest[];

  /**
   * A message box, if any.
   */
  messageBox?: MessageBox;

  /**
   * A list of launch commands, if any.
   */
  launches?: LaunchCommand[];
}
