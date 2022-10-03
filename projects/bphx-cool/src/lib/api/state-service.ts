import { InjectionToken } from "@angular/core";
import { Json } from "./json";

/**
 * Used to provide a session state.
 */
export const SESSION_ACCESSOR = new InjectionToken<StateService>("coolSession");

/**
 * Used to provide a local state.
 */
export const LOCAL_ACCESSOR = new InjectionToken<StateService>("coolLocal");

/**
 * A session or local state.
 */
export interface StateService
{
  /**
   * Gets data by name.
   * @param name a name.
   * @param defaultValue a defaul value.
   */
  get<T extends Json>(name: string, defaultValue: T): T;

  /**
   * Sets data by name.
   * @param name a name.
   * @param value a value to set.
   */
  set(name: string, value: Json): void;

  /**
   * Flushes current state to the storage.
   */
  save(): void;
}
