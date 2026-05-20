import type { TrackRow } from '@flow/database'
import type { ChannelStyle, Programme, Track } from '@flow/shared'
import { queryCandidateSetFromDB } from '@flow/database'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i]!, arr[j]!] = [arr[j]!, arr[i]!]
  }
  return arr
}

function toTrack(row: TrackRow): Track {
  return {
    id: row.id,
    source: row.source as 'local' | 'remote',
    title: row.title,
    artist: row.artist,
    album: row.album,
    artwork: row.artwork ?? '',
    url: row.url,
    duration: row.duration,
    createdAt: row.createdAt,
    modifiedAt: row.modifiedAt,
    fileSize: row.fileSize,
  }
}

const DEFAULT_PROGRAMME_SIZE = 20

export async function generateProgramme(style: ChannelStyle = {}): Promise<Programme> {
  const candidates = await queryCandidateSetFromDB(style)

  if (candidates.length === 0)
    return []

  const selected = shuffle(candidates).slice(0, DEFAULT_PROGRAMME_SIZE)
  return selected.map(row => ({ kind: 'track', track: toTrack(row) }))
}

export function getProgrammeTracks(programme: Programme): Track[] {
  return programme
    .filter(seg => seg.kind === 'track')
    .map(seg => seg.track)
}
