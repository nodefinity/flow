import { useEffect } from 'react'
import { BackHandler, Platform } from 'react-native'

export function useBackHandler(visible: boolean, onBack: () => void) {
  useEffect(() => {
    if (Platform.OS !== 'android')
      return

    const handleBackPress = () => {
      if (visible) {
        onBack()
        return true
      }
      return false
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () => {
      subscription.remove()
    }
  }, [visible, onBack])
}
