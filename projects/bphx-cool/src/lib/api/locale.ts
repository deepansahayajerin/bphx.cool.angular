import { InjectionToken } from "@angular/core";

/**
 * Used to provide a `Locale`.
 */
export const LOCALE_ACCESSOR =
  new InjectionToken<Locale>("coolLocale");

/**
 * A service encapsulating locale parameters.
 */
export interface Locale
{
  decimalPoint?: string;
  groupSeparator?: string;
  currencySign?: string;

  shortMonths?: string[];

  /**
   * A century offset used to adjust year defined with two digits.
   */
  centuryOffset?: number;
}
