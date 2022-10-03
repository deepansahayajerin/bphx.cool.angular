import { RequestType } from "../client/request-type";
import { Json } from "../json";

/**
 * Initial action over dialog.
 */
export interface InitAction
{
  /**
   * Initial request type if any.
   */
  action?: RequestType.Start|RequestType.Get|RequestType.Fork|null;

  /**
   * Initial opaque state index.
   */
  index?: number;

  /**
   * Initial procedure name.
   */
  procedure?: string;

  /**
   * Initial command line.
   */
  commandLine?: string;

  /**
   * Display first indicator.
   */
  displayFirst?: boolean;

  /**
   * Restart indicator.
   */
  restart?: boolean;

  /**
   * Optional parameters.
   */
  params?: { [name: string]: string | string[] };

  /**
   * Initial in parameters.
   */
  in?: Json;
}
