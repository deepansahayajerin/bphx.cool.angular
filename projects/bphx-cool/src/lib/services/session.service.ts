import { Injectable, OnDestroy, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { StateService } from "../api/state-service";
import { Json, JsonObject } from "../api/json";

@Injectable()
export class SessionService implements StateService, OnDestroy
{
  /**
   * A key prefix.
   */
  prefix: string;

  /**
   * Gets data by name.
   * @param name a name.
   * @param defaultValue a defaul value.
   */
  get<T extends Json>(name: string, defaultValue: T): T
  {
    if (name in this.data)
    {
      return this.data[name] as T;
    }

    const key = this.prefix ? this.prefix + name : name;
    const storage = this.document.defaultView.sessionStorage;

    return this.data[name] = JSON.parse(storage.getItem(key)) || defaultValue;
  }

  /**
   * Sets data by name.
   * @param name a name.
   * @param value a value to set.
   */
  set(name: string, value: Json): void
  {
    this.data[name] = value;
  }

  /**
   * Creates a LocalService instance.
   * @param document a document instance.
   */
  constructor(@Inject(DOCUMENT) document: unknown)
  {
    this.unload = this.unload.bind(this);
    this.document = document as Document;

    this.document.defaultView.addEventListener("beforeunload", this.unload);
  }

  /**
   * Destroys service state.
   */
  ngOnDestroy(): void
  {
    this.unload();
  }

  /**
   * Flushes current state to the storage.
   */
  save(): void
  {
    this.flush();
  }

  /**
   * Detaches events on page unloading.
   */
  private unload()
  {
    document.defaultView.removeEventListener("beforeunload", this.unload);
    this.flush();
  }

  /**
   * Flushes data to storage.
   */
  private flush()
  {
    const storage = this.document.defaultView.sessionStorage;

    Object.keys(this.data).forEach(name =>
    {
      const key = this.prefix ? this.prefix + name : name;
      const value = this.data[name];

      if (value == null)
      {
        storage.removeItem(key);
      }
      else
      {
        storage.setItem(key, JSON.stringify(value));
      }
    });
  }

  /**
   * State data.
   */
  private data: JsonObject = {};

  /**
   * A document instance.
   */
  private document: Document;
}
