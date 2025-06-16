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
  createdAt: number

  /**
   * Date modified (Unix timestamp, optional)
   * @default undefined
   */
  modifiedAt: number

  /**
   * File size in bytes (optional)
   * @default undefined
   */
  fileSize: number
}

export interface TrackMetadata extends Track {
  // audio header
  duration: number
  bitrate: number
  sampleRate: number
  channels: number
  format: string

  // tag info
  year: number
  genre: string
  track: number
  disc: number
  composer: string
  lyricist: string
  lyrics: string
  albumArtist: string
  comment: string
}
