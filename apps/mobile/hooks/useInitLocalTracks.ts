import { useTrackStore } from '@flow/store'
import { useEffect, useState } from 'react'
import { getLocalTracks } from '@/utils/localTrackService'
import { requestMusicPermission, requestNotificationPermission } from '@/utils/permission'

export function useInitLocalTracks() {
  const setLocalTracks = useTrackStore.use.setLocalTracks()
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const init = async () => {
      await requestNotificationPermission()
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
