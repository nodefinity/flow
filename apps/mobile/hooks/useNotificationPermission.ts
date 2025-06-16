import type { Permission } from 'react-native-permissions'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { check, request, RESULTS } from 'react-native-permissions'

export function useNotificationPermission() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = Platform.select({
          ios: 'ios.permission.USER_NOTIFICATIONS' as Permission,
          android: 'android.permission.POST_NOTIFICATIONS' as Permission,
        })

        if (!permission)
          return

        const result = await check(permission)

        if (result === RESULTS.DENIED) {
          const permissionResult = await request(permission)
          console.log('Notification permission status:', permissionResult)
        }
      }
      catch (err) {
        console.warn('Request notification permission failed:', err)
      }
    }

    requestNotificationPermission()
  }, [])
}
