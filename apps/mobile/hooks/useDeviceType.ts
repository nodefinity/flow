import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

type DeviceType = 'phone' | 'tablet'

function getDeviceType(): DeviceType {
  const { width } = Dimensions.get('window')
  return width >= 768 ? 'tablet' : 'phone'
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType)

  useEffect(() => {
    const updateDeviceType = () => {
      setDeviceType(getDeviceType())
    }

    const subscription = Dimensions.addEventListener('change', updateDeviceType)

    return () => subscription?.remove()
  }, [])

  return deviceType
}
