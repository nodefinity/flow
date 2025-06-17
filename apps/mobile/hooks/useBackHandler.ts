import { useEffect } from 'react'
import { BackHandler } from 'react-native'

/**
 * Handle back event
 * @param visible - Whether the component is visible
 * @param onBack - Back button handler
 */
export function useBackHandler(visible: boolean, onBack: () => void) {
  useEffect(() => {
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
