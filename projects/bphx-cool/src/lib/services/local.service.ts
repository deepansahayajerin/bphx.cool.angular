import { Injectable, Inject, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { StateService } from "../api/state-service";
import { Json, JsonObject } from "../api/json";

@Injectable()
export class LocalService implements StateService, OnDestroy
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
    const storage = this.document.defaultView.localStorage;

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
   * Flushes current state to the storage.
   */
  save(): void
  {
    const window = document.defaultView;

    window.removeEventListener("storage", this.change);

    try
    {
      this.flush();
    }
    finally
    {
      window.addEventListener("storage", this.change);
    }
  }

  /**
   * Creates a LocalService instance.
   * @param document a document instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(@Inject(DOCUMENT) document: unknown)
  {
    this.document = document as Document;
    this.change = this.change.bind(this);
    this.unload = this.unload.bind(this);

    const window = this.document.defaultView;

    window.addEventListener("storage", this.change);
    window.addEventListener("beforeunload", this.unload);
  }

  /**
   * Destroys service state.
   */
  ngOnDestroy(): void
  {
    this.unload();
  }

  /**
   * Handles storage change.
   * @param event a storage event.
   */
  private change(event: StorageEvent)
  {
    let name = event.key;

    if (name)
    {
      if (this.prefix)
      {
        if (!name.startsWith(this.prefix))
        {
          return;
        }

        name = name.substring(this.prefix.length);
      }

      // eslint-disable-next-line no-prototype-builtins
      if (this.data.hasOwnProperty(name))
      {
        this.data[name] = JSON.parse(event.newValue);
      }
    }
  }

  /**
   * Detaches events on page unloading.
   */
  private unload()
  {
    const window = document.defaultView;

    window.removeEventListener("storage", this.change);
    window.removeEventListener("beforeunload", this.unload);
    this.flush();
  }

  /**
   * Flushes data to storage.
   */
  private flush()
  {
    const storage = this.document.defaultView.localStorage;

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
   * A Document instance.
   */
  private document: Document;
}
