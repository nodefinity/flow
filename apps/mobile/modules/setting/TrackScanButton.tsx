import { useState } from 'react'
import { List } from 'react-native-paper'
import { requestMusicPermission } from '@/utils/localTrackService'
import { TrackScanDialog } from './TrackScanDialog'

interface TrackScanButtonProps {
  title: string
  description: string
  icon: string
  type: 'scan' | 'pick'
}

export function TrackScanButton({
  title,
  description,
  icon,
  type,
}: TrackScanButtonProps) {
  const [visible, setVisible] = useState(false)

  const handlePress = async () => {
    const hasPermission = await requestMusicPermission()
    if (!hasPermission) {
      setVisible(false)
      return
    }

    setVisible(true)
  }

  return (
    <>
      <List.Item
        title={title}
        description={description}
        left={props => <List.Icon {...props} icon={icon} />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={handlePress}
      />

      {visible && (<TrackScanDialog onDismiss={() => setVisible(false)} type={type} />)}
    </>
  )
}
