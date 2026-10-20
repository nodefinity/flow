import type { Programme, TrackMetadata } from '@flow/shared'
import { getTrackMetadataAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useState } from 'react'
import { PlaybackMode, usePlayerStore } from '../playerStore'

function getRadioDisplayTrack(programme: Programme, segmentIndex: number) {
  const activeSegment = programme[segmentIndex]
  if (activeSegment?.kind === 'track')
    return activeSegment.track

  return programme.slice(segmentIndex + 1).find(segment => segment.kind === 'track')?.track
}

export function useDisplayTrack() {
  const playbackMode = usePlayerStore.use.playbackMode()
  const queue = usePlayerStore.use.queue()
  const currentIndex = usePlayerStore.use.currentIndex()
  const programme = usePlayerStore.use.programme()
  const nowPlayingSegmentIndex = usePlayerStore.use.nowPlayingSegmentIndex()

  const currentTrack = playbackMode === PlaybackMode.RADIO
    ? getRadioDisplayTrack(programme, nowPlayingSegmentIndex)
    : queue[currentIndex]

  const [trackWithMetadata, setTrackWithMetadata] = useState<TrackMetadata | undefined>(() => {
    if (!currentTrack)
      return undefined

    return currentTrack as TrackMetadata
  })

  useEffect(() => {
    if (!currentTrack) {
      setTrackWithMetadata(undefined)
      return
    }

    const fetchMetadata = async () => {
      const metadata = await getTrackMetadataAsync(currentTrack.id)
      const channels = Number.parseInt(metadata.channels, 10)

      setTrackWithMetadata({
        ...currentTrack,
        ...metadata,
        channels: Number.isNaN(channels) ? 0 : channels,
      })
    }

    fetchMetadata()
  }, [currentTrack])

  return trackWithMetadata
}
