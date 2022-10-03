import { Intensity } from "./intensity";
import { Highlighting } from "./highlighting";

/**
 * A video attributte.
 */
export interface Video
{
  /**
   * Attribute name.
   */
  name?: string;

  /**
   * A color.
   */
  color?: string;

  /**
   * A background color.
   */
  backgroundColor?: string;

  /**
   * A protection indicator.
   */
  protected?: boolean;

  /**
   * A field intensity.
   */
  intensity?: Intensity;

  /**
   * A field highlight.
   */
  highlighting?: Highlighting;

  /**
   * Focused status.
   */
  focused?: boolean;

  /**
   * Error status.
   */
  error?: boolean;
}
