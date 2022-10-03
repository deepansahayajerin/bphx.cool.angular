export type Json = null | boolean | number | string | Date | Json[] | JsonObject;
export type JsonObject = { [prop: string]: Json };

/**
 * An attribute.
 */
export type Attribute =
{
  /**
  * Attribute name.
  */
  name: string;

  /**
  * Attribute value.
  */
  value?: Json;
}

/**
 * A union type between array of attributes and keyed object.
 */
export type Attributes = Attribute[] | JsonObject;

/**
 * An interface for the object that has `Attributes`.
 */
export type ObjectWithAttributes =  { attribute?: Attributes; }

/**
* Maps array to keyed object.
* @param array an array to map.
* @returns a keyed object.
*/
export function mapArray<T extends { name: string }>(array?: T[]):
  { [name: string]: T }
{
  if (array && array.length)
  {
    const items: { [name: string]: T } = {};

    array.forEach(item => items[item.name] = item);

    return items;
  }
}

/**
* Converts array of attributes to keyed object over input object.
* @param value an object with attributes.
* @returns the same instance passed on input.
*/
export function fromAttributes<T extends ObjectWithAttributes>(value?: T): T
{
  if (value && Array.isArray(value.attribute))
  {
    const items: JsonObject = {};

    value.attribute.forEach(item => items[item.name] = item.value);
    value.attribute = items;
  }

  return value;
}

/**
 * Converts keyed object to array of attributes over input object.
 * @param value an object with attributes.
 * @returns the same instance passed on input.
 */
export function toAttributes<T extends ObjectWithAttributes>(value?: T): T
{
  if (value?.attribute && !Array.isArray(value.attribute))
  {
    const items: Attribute[] = [];

    for(const name in value.attribute)
    {
      items.push({ name, value: value.attribute[name] });
    }

    value.attribute = items.length ? items : null;
  }

  return value;
}
