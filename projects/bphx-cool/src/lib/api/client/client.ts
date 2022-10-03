import { Observable } from "rxjs";
import { InjectionToken } from "@angular/core";
import { Response } from "./response";
import { Request } from "./request";
import { RequestType } from "./request-type";

/**
 * Used to provide a `Client`.
 */
export const CLIENT_ACCESSOR =
  new InjectionToken<Client>("coolClient");

/**
 * A client to communicate with application logic.
 */
export type Client =
{
  /**
   * A command to send to the client
   * @param request a request data.
   * @returns an observable instance that delivers Response.
   */
  [name in Exclude<RequestType, RequestType.Command>]:
    (request: Request) => Observable<Response>;
};
