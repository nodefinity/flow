import type { TrackMetadata } from '@flow/shared'

/**
 * Describes the stylistic character of a radio channel.
 * Once @flow/shared exports this type, import it from there instead.
 */
export interface ChannelStyle {
  genreHints?: string[]
  energyLevel?: 'low' | 'medium' | 'high'
  tempoRange?: { min: number, max: number }
  moodTags?: string[]
}

function includesCI(haystack: string | undefined, needle: string): boolean {
  if (!haystack)
    return false
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

/**
 * Returns a filtered candidate set of local tracks suitable for the given
 * ChannelStyle. This is a pure filtering function — it does not rank or
 * sequence tracks.
 *
 * Filtering rules (v1):
 * - Only `source: 'local'` tracks are considered.
 * - Tracks with no `url` are always excluded.
 * - If `style.genreHints` is non-empty, keep only tracks whose `genre`
 *   contains any hint (case-insensitive substring match).
 * - If `style.moodTags` is non-empty, keep only tracks whose `comment` or
 *   `genre` contains any mood tag (case-insensitive substring match).
 * - If neither `genreHints` nor `moodTags` is set, all remaining local
 *   tracks with a URL are returned.
 */
export function queryCandidateSet(
  tracks: TrackMetadata[],
  style: ChannelStyle,
): TrackMetadata[] {
  const { genreHints, moodTags } = style

  const hasGenreHints = Array.isArray(genreHints) && genreHints.length > 0
  const hasMoodTags = Array.isArray(moodTags) && moodTags.length > 0

  return tracks.filter((track) => {
    // Only local tracks
    if (track.source !== 'local')
      return false

    // Must have a URL
    if (!track.url)
      return false

    // Genre filter
    if (hasGenreHints) {
      const matchesGenre = genreHints!.some(hint => includesCI(track.genre, hint))
      if (!matchesGenre)
        return false
    }

    // Mood tag filter
    if (hasMoodTags) {
      const matchesMood = moodTags!.some(
        tag => includesCI(track.genre, tag) || includesCI(track.comment, tag),
      )
      if (!matchesMood)
        return false
    }

    return true
  })
}
