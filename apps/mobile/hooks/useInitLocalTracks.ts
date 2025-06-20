import { useTrackStore } from '@flow/core'
import { useEffect, useState } from 'react'
import { getLocalTracks, requestMusicPermission } from '@/utils/localTrackService'

export function useInitLocalTracks() {
  const setLocalTracks = useTrackStore.use.setLocalTracks()
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestMusicPermission()
      if (!hasPermission) {
        setLocalTracks([])
      }
      else {
        const tracks = await getLocalTracks()
        setLocalTracks(tracks)
      }
      setHasHydrated(true)
    }
    init()
  }, [])

  return hasHydrated
}
