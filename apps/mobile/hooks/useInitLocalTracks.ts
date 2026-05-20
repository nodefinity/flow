import { useEffect, useState } from 'react'
import { scanLocalTracks } from '@/utils/localTrackService'
import { requestMusicPermission, requestNotificationPermission } from '@/utils/permission'

export function useInitLocalTracks() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const init = async () => {
      await requestNotificationPermission()
      const hasPermission = await requestMusicPermission()
      if (hasPermission) {
        await scanLocalTracks()
      }
      setHasHydrated(true)
    }
    init()
  }, [])

  return hasHydrated
}
