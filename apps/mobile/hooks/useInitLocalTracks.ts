import { migrateDB } from '@flow/database'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { scanLocalTracks } from '@/utils/localTrackService'
import { requestMusicPermission, requestNotificationPermission } from '@/utils/permission'

export function useInitLocalTracks() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      if (Platform.OS === 'web') {
        if (!cancelled)
          setHasHydrated(true)
        return
      }

      try {
        await migrateDB()
        await requestNotificationPermission()
        const hasPermission = await requestMusicPermission()
        if (hasPermission) {
          await scanLocalTracks()
        }
      }
      catch (error) {
        console.error('Failed to initialize Library:', error)
      }
      finally {
        if (!cancelled)
          setHasHydrated(true)
      }
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [])

  return hasHydrated
}
