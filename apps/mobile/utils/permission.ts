import type { Permission } from 'react-native-permissions'
import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

export async function requestNotificationPermission() {
  try {
    const permission = Platform.select({
      ios: 'ios.permission.USER_NOTIFICATIONS' as Permission,
      android: 'android.permission.POST_NOTIFICATIONS' as Permission,
    })

    if (!permission)
      return

    const result = await check(permission)

    console.log('result', result)

    if (result === RESULTS.DENIED) {
      console.log('denied')
      const permissionResult = await request(permission)
      console.log('Notification permission status:', permissionResult)
    }
  }
  catch (err) {
    console.warn('Request notification permission failed:', err)
  }
}

function getMusicPermission(): Permission | null {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.MEDIA_LIBRARY
  }
  else if (Platform.OS === 'android') {
    // Android 13 (API 33) and above use granular media permissions
    const androidVersion
      = typeof Platform.Version === 'string'
        ? Number.parseInt(Platform.Version, 10)
        : Platform.Version

    if (androidVersion >= 33) {
      return PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
    }
    else {
      // Android 12 and below use traditional storage permissions
      return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
    }
  }
  else {
    return null
  }
}

export async function requestMusicPermission(): Promise<boolean> {
  try {
    const permission = getMusicPermission()

    if (!permission) {
      console.warn('Do not support this platform')
      return true
    }

    const result = await request(permission)
    return result === RESULTS.GRANTED
  }
  catch (error) {
    console.error('Request permission error:', error)
    return false
  }
}
