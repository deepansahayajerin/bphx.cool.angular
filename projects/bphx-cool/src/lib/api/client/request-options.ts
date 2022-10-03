import { HttpHeaders, HttpParams } from "@angular/common/http";
import { RequestParams } from "./request";

/**
 * Request options.
 */
export interface RequestOptions
{
  headers?: HttpHeaders | { [header: string]: string | string[]; };
  observe?: "body";
  params?: HttpParams | RequestParams;
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
}
