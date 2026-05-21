import type { TrackMetadata } from '@flow/shared'
import { getTrackMetadataAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useState } from 'react'
import { PlaybackMode, usePlayerStore } from '../playerStore'

export function useDisplayTrack() {
  const playbackMode = usePlayerStore.use.playbackMode()
  const queue = usePlayerStore.use.queue()
  const currentIndex = usePlayerStore.use.currentIndex()
  const programme = usePlayerStore.use.programme()
  const nowPlayingSegmentIndex = usePlayerStore.use.nowPlayingSegmentIndex()

  const currentTrack = playbackMode === PlaybackMode.RADIO
    ? (programme[nowPlayingSegmentIndex]?.kind === 'track' ? programme[nowPlayingSegmentIndex].track : undefined)
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
      setTrackWithMetadata({ ...currentTrack, ...metadata })
    }

    fetchMetadata()
  }, [currentTrack])

  return trackWithMetadata
}
