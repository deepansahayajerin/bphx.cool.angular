import { TerminationAction } from "./termination-action";
import { MessageType } from "./message-type";
import { Json } from "../json";

/**
 * A global object.
 */
export interface Global
{
  /**
   * Next location value.
   */
  nextlocation?: string;

  /**
   * Current dialect value. Default is `"DEFAULT"`.
   */
  currentDialect?: string;

  /**
   * Current local system id.
   */
  localSystemId?: string;

  /**
   * Current panel id.
   */
  panelId?: string;

  /**
   * Current scroll indicator.
   */
  scrollInd?: string;

  /**
   * Current scroll amount. Default is `"PAGE"`.
   */
  scrollAmt?: string;

  /**
   * Current scroll location.
   */
  scrollLoc?: string;

  /**
   * The next transaction.
   */
  nexttran?: string;

  /**
   * Current user id.
   */
  userId?: string;

  /**
   * Current terminal id.
   */
  terminalId?: string;

  /**
   * Current exit state name.
   */
  exitstate?: string;

  /**
   * Current transaction code.
   */
  trancode?: string;

  /**
   * Current program function keys.
   */
  pfkey?: string;

  /**
   * Current error message.
   */
  errmsg?: string;

  /**
   * Current command.
   */
  command?: string;

  /**
   * Current termination action.
   */
  terminationAction?: TerminationAction;

  /**
   * Current message type.
   */
  messageType?: MessageType;

  /**
   * Current timestamp.
   */
  currentTimestamp?: string|Date;

  /**
   * Current date.
   */
  currentDate?: string|Date;

  /**
   * Current time.
   */
  currentTime?: string|Date;

  /**
   * Other fields.
   */
  [key: string]: Json;
}
