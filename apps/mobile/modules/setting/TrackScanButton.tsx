import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { requestMusicPermission } from '@/utils/localTrackService'
import { TrackScanDialog } from './TrackScanDialog'

interface TrackScanButtonProps {
  title: string
  description: string
  icon?: string
  type: 'scan' | 'pick'
}

export function TrackScanButton({ title, description, type }: TrackScanButtonProps) {
  const colors = useColors()
  const [visible, setVisible] = useState(false)

  const handlePress = async () => {
    const hasPermission = await requestMusicPermission()
    if (!hasPermission)
      return
    setVisible(true)
  }

  return (
    <>
      <Pressable onPress={handlePress} style={[styles.row, { borderBottomColor: colors.border }]}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{description}</Text>
        </View>
        <Text style={{ color: colors.mutedForeground }}>›</Text>
      </Pressable>

      {visible && <TrackScanDialog onDismiss={() => setVisible(false)} type={type} />}
    </>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  info: { flex: 1, marginRight: 8 },
  title: { fontSize: 15 },
  desc: { fontSize: 12, marginTop: 2 },
})
