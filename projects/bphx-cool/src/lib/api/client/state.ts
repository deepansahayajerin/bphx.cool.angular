/**
 * A generic state.
 */
export interface State
{
  /**
   * Optional name.
   */
  name?: string;

  /**
   * Optional integer value(s).
   */
  int?: number;

  /**
   * Optional long value(s).
   */
  long?: number;

  /**
   * Optional decimal value(s).
   */
  decimal?: number;

  /**
   * Optional double value(s).
   */
  double?: number;

  /**
   * Optional string value(s).
   */
  string?: string

  /**
   * Optional boolean value(s).
   */
  boolean?: boolean;

  /**
   * Optional date value(s).
   */
  date?: string|Date;

  /**
   * Optional time value(s).
   */
  time?: string|Date;

  /**
   * Optional date time value.
   */
  dateTime?: string|Date;

  /**
   * Optional map or list.
   */
  map?: State[];
}

/**
 * Converts state to object.
 * @param state a state to convert.
 * @returns object produced from state.
 */
export function fromState(state: State): unknown
{
  if (state == null)
  {
    return null;
  }

  const value =
    state.int ??
    state.long ??
    state.decimal ??
    state.double ??
    state.string ??
    state.boolean ??
    state.date ??
    state.time ??
    state.dateTime;

  if (value != null)
  {
    return value;
  }

  const map = state.map;

  if (!map?.length)
  {
    return null;
  }

  if (map[0].name)
  {
    return map.reduce(
      (result, item) =>
      {
        const value = fromState(item);

        if ((value != null) && item.name)
        {
          result[item.name] = value;
        }

        return result;
      },
      {} as { [name: string]: unknown });
  }
  else
  {
    return map.map(fromState);
  }
}

/**
 * Converts state to object.
 * @param state a state to convert.
 * @returns object produced from state.
 */
export function toState(instance: unknown): State
{
  if ((instance == null) || (instance instanceof Function))
  {
    return null;
  }

  const state: State = {};

  if (Array.isArray(instance))
  {
    state.map = instance.map(toState);
  }
  else
  {
    state.map = [];

    for(const name in instance as { [name: string]: unknown })
    {
      const item = instance[name];

      if ((item != null) && (name[0] !== "$"))
      {
        let data: State;

        switch(typeof(item))
        {
          case "function":
          {
            break;            
          }
          case "number":
          {
            data = { decimal: item };

            break;
          }
          case "boolean":
          {
            data = { boolean: item };

            break;
          }
          case "string":
          {
            data = { string: item };

            break;
          }
          default:
          {
            if (item instanceof Date)
            {
              data = { dateTime: item };
            }
            else
            {
              data = toState(item);
            }
          }
        }

        if (data)
        {
          data.name = name;
          state.map.push(data);
        }
      }
    }
  }

  return state.map && state.map.length ? state : null;
}
