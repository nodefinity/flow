import type { TrackRow } from '@flow/database'
import type { Channel, Programme, Track } from '@flow/shared'
import type { ProgrammeHost, ProgrammePlayer } from '@flow/store'
import { queryCandidateSetFromDB } from '@flow/database'
import { ProgrammeManager, usePlayerStore } from '@flow/store'
import { Platform } from 'react-native'

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

const LOCAL_PROGRAMME_TARGET_SECONDS = 30 * 60

const localHost: ProgrammeHost = {
  async generateProgramme({ candidateTracks }) {
    const programme: Programme = []
    let duration = 0

    for (const track of candidateTracks) {
      if (duration >= LOCAL_PROGRAMME_TARGET_SECONDS)
        break

      programme.push({ kind: 'track', track })
      duration += Math.max(0, track.duration)
    }

    return programme
  },
}

async function loadCandidateTracks(channel: Channel) {
  if (Platform.OS === 'web')
    return []

  const candidates = await queryCandidateSetFromDB(channel.style)
  return candidates.map(toTrack)
}

const player: ProgrammePlayer = {
  getSnapshot() {
    const state = usePlayerStore.getState()
    return {
      playbackMode: state.playbackMode,
      isPlaying: state.isPlaying,
      programme: state.programme,
      nowPlayingSegmentIndex: state.nowPlayingSegmentIndex,
    }
  },
  loadProgramme(programme) {
    usePlayerStore.getState().loadProgramme(programme)
  },
}

export const programmeManager = new ProgrammeManager({
  host: localHost,
  player,
  loadCandidateTracks,
})
