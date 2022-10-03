import { Pipe, PipeTransform } from "@angular/core";

type Part = unknown[] & {$zip?: Zip};
type Item = { inner?: unknown, outer?: unknown };
type Zip = Item[] & { $inner?: Part, $outer?: Part};

/**
 * Zips two arrays.
 */
@Pipe({ name: "zip" })
export class ZipPipe implements PipeTransform
{
  /**
   * Creates a new array with corresponding items from outer and inner array.
   * @param outer an outer array.
   * @param inner an inner array.
   * @returns zipped array.
   */
  transform(outer: Part, inner: Part): Zip
  {
    if (!outer)
    {
      outer = [];
    }

    if (!inner)
    {
      inner = [];
    }

    const $zip = inner.$zip ?? outer.$zip;

    const zip: Zip = outer.map((value, index) =>
    {
      const innerValue = inner[index] ?? {};

      if ($zip)
      {
        const item = $zip[index];

        if (item && (item.outer === value) && (item.inner === innerValue))
        {
          return item;
        }
      }

      return { outer: value, inner: innerValue };
    });

    zip.$inner = inner;
    zip.$outer = outer;
    inner.$zip = zip;
    outer.$zip = zip;

    return zip;
  }
}
