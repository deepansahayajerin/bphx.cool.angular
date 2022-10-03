import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Client } from "../api/client/client";
import { Request, RequestParams } from "../api/client/request";
import { Response } from "../api/client/response";
import { RequestOptions } from "../api/client/request-options";
import { RequestType } from "../api/client/request-type";

/**
 * Client implementation that uses REST to communicate with the server.
 */
@Injectable()
export class HttpClientService implements Client
{
  /**
   * Default service base.
   */
  base = "api/";

  /**
   * Indicates to restart application if session has expired.
   */
  restartExpired = true;

  constructor(protected http: HttpClient)
  {
  }

  get(request: Request): Observable<Response>
  {
    const { options } = this.prepare(
      request,
      null,
      this.options(request.index || null, request.id));

    return this.http.get<Response>(this.base + request.procedure, options).
      pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  event(request: Request): Observable<Response>
  {
    const { body, options } = this.prepare(
      request,
      this.body(
      {
        index: request.index,
        id: request.id,
        in: request.in,
        global: request.global,
        focused: request.focused,
        events: request.events,
        controls: request.controls
      }),
      this.options(request.index || null, request.id));

    return this.http.post<Response>(
      this.base + request.procedure + "/event",
      body,
      options).
      pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  changeDialect(request: Request): Observable<Response>
  {
    const { body, options } = this.prepare(
      request,
      {
        index: request.index,
        global: { currentDialect: request.global.currentDialect }
      },
      this.options(request.index || null));

    return this.http.post<Response>(
      this.base + "changeDialect",
      body,
      options).
      pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  current(request: Request): Observable<Response>
  {
    const { options } = this.prepare(
      request,
      null,
      this.options(request.index || null));

    return this.http.get<Response>(this.base + "current", options).
      pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  start(request: Request): Observable<Response>
  {
    const global = request.global;
    const currentDialect = global?.currentDialect;
    const exitstate = global?.exitstate;
    const command = global?.command;

    const { body, options } = this.prepare(
      request,
      this.body(
      {
        index: request.index,
        procedure: request.procedure || null,
        commandLine: request.commandLine || null,
        displayFirst: request.displayFirst,
        restart: request.restart,
        global: exitstate || currentDialect || command ?
          { exitstate, currentDialect, command } : null
      }),
      this.options(request.index || null, request.id, request.params));

    return this.http.post<Response>(this.base + "start", body, options).
      pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  fork(request: Request): Observable<Response>
  {
    const { options } = this.prepare(
      request,
      null,
      this.options(request.index || null, null, request.params));

    return this.http.post<Response>(this.base + "fork", options).
    pipe(catchError((error, caught) => this.error(request, error, caught)));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  help(request: Request): Observable<Response>
  {
    return throwError(false);
  }

  /**
   * Prepares request.
   * @param request a request instance.
   * @param body a request body.
   * @param options a request options.
   * @returns prepared body and options.
   */
  protected prepare(request: Request, body: unknown, options: RequestOptions):
    { body: unknown, options: RequestOptions }
  {
    return { body, options };
  }

  protected body(value: unknown): unknown
  {
    if (value)
    {
      for(const key of Object.keys(value))
      {
        if (value[key] == null)
        {
          delete value[key];
        }
      }
    }

    return value;
  }

  protected params(params: RequestParams): RequestParams
  {
    for(const key of Object.keys(params))
    {
      if (params[key] == null)
      {
        delete params[key];
      }
    }

    return params;
  }

  protected options(
    index: number,
    id?: number,
    params?: RequestParams):
    RequestOptions
  {
    const options: RequestOptions =
    {
      responseType: "json",
      headers:
      {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      params: this.params({ id, index, ...params }),
      withCredentials: true
    };

    return options;
  }

  protected error(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    caught: Observable<Response>): Observable<Response>
  {
    const exception = error?.error;

    if (!exception || (typeof exception !== "object"))
    {
      return throwError(error);
    }

    if (this.restartExpired &&
      (error?.status === 401) &&
      exception &&
      (typeof exception.exceptionMessage === "string") &&
      exception.exceptionMessage.startsWith("NO-APP:"))
    {
      switch(request.action)
      {
        case RequestType.Get:
        case RequestType.Command:
        case RequestType.Event:
        case RequestType.ChangeDialect:
        case RequestType.Current:
        {
          return this.start(
          {
            dialog: request.dialog,
            action: RequestType.Start
          });
        }
        default:
        {
          break;
        }
      }
    }

    exception.status = error.status;
    exception.statusText = error.statusText;
    exception.error = error;
    exception.message = error.message;

    return throwError(exception);
  }
}
