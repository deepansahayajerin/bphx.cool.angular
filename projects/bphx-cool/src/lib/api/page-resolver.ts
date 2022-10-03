import { Observable } from "rxjs";
import { InjectionToken } from "@angular/core";
import { Procedure } from "./client/procedure";
import { Window } from "./client/window";
import { PageComponent } from "./page-component";


/**
 * Used to provide a `PageResolver`.
 */
export const PAGE_RESOLVER =
  new InjectionToken<PageResolver>("coolPageResolver");

/**
 * Page component resolver.
 */
export interface PageResolver
{
  /**
   * Resolves page component type by procedure and window.
   * @param dialect a dialect to use to resolve component.
   * @param procedure a `Procedure` instance to resolve component.
   * @param window a `Window` instance to resolve component.
   * @returns an `Observable` that resolves a `PageComponent`.
   */
  resolve(
    dialect: string,
    procedure: Procedure,
    window?: Window): Observable<PageComponent>;
}
