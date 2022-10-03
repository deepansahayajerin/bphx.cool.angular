/**
 * An expression accessor.
 */
export class Accessor
{
  /**
   * Creates an Accessor for the expression.
   * @param expression an expression as array of property parts.
   *   Each expression part is either array index, or
   *   property names connected with ".".
   * @returns an Accessor instance.
   */
  constructor(...expression: (string|number)[])
  {
    expression.forEach(
      part => typeof part === "number" ?
        this.parts.push(part) : this.parts.push(...part.split(".")));
  }

  /**
   * Gets a value for an expression.
   * @param instance an instance to get expression for.
   * @returns an expression value.
   */
  get(instance: unknown): unknown
  {
    for(const part of this.parts)
    {
      if (instance == null)
      {
        break;
      }

      instance = instance[part];
    }

    return instance;
  }

  /**
   * Sets a value for the expression.
   * @param instance an instance to set expression.
   * @param value a value to set.
   */
  set(instance: unknown, value: unknown): void
  {
    const parts = this.parts;

    if ((instance == null) || !parts.length)
    {
      return;
    }

    for(let i = 0; i < parts.length - 1; ++i)
    {
      const part = parts[i];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instance = part in (instance as any) ? instance[part] :
        (instance[part] = typeof parts[i + 1] === "number" ? [] : {});
    }

    instance[parts[parts.length - 1]] = value;
  }

  /**
   * accessor parts.
   */
  private parts: (string|number)[] = [];
}
