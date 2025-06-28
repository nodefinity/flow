import type { TrackMetadata } from '@flow/core'
import { getTrackMetadataAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useState } from 'react'
import { usePlayerStore } from '../playerStore'

export function useDisplayTrack() {
  const queue = usePlayerStore.use.queue()
  const currentIndex = usePlayerStore.use.currentIndex()

  const [trackWithMetadata, setTrackWithMetadata] = useState<TrackMetadata | undefined>(undefined)

  const currentTrack = queue[currentIndex]

  useEffect(() => {
    if (!currentTrack)
      return

    const fetchMetadata = async () => {
      const metadata = await getTrackMetadataAsync(currentTrack.id)
      setTrackWithMetadata({ ...currentTrack, ...metadata })
    }

    fetchMetadata()
  }, [currentTrack])

  return trackWithMetadata
}
