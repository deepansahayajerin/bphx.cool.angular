/**
 * A file data.
 */
export interface FileData
{
  /**
   * File name.
   */
  name?: string;

  /**
   * File MIME type
   */
  type: string;

  /**
   * File content as data uri.
   */
  dataUri: string;
}
