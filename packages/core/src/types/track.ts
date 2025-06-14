export interface Track {
  id: string

  /**
   * Track title
   * @default ''
   */
  title: string

  /** Track artwork (uri) */
  artwork: string

  /**
   * Artist name
   * @default ''
   */
  artist: string

  /**
   * Album name
   * @default ''
   */
  album: string

  /** Music genre */
  genre: string

  /**
   * Duration in seconds
   * @default 0
   */
  duration: number

  /**
   * File URI or path
   * @default ''
   */
  url: string

  /**
   * Date added to library (Unix timestamp, optional)
   * @default undefined
   */
  createdAt?: number

  /**
   * Date modified (Unix timestamp, optional)
   * @default undefined
   */
  modifiedAt?: number

  /**
   * File size in bytes (optional)
   * @default undefined
   */
  fileSize?: number
}
