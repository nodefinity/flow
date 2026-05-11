import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'

interface SettingSelectorProps {
  title: string
  icon?: string
  currentValue: string
  options: Array<{ value: string, label: string }>
  onValueChange: (value: string) => void
}

export function SettingSelector({ title, currentValue, options, onValueChange }: SettingSelectorProps) {
  const colors = useColors()
  const [visible, setVisible] = useState(false)
  const currentLabel = options.find(o => o.value === currentValue)?.label ?? options[0]?.label ?? ''

  const handleSelect = (value: string) => {
    setVisible(false)
    requestAnimationFrame(() => onValueChange(value))
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.row, { borderBottomColor: colors.border }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <View style={styles.right}>
          <Text style={[styles.value, { color: colors.mutedForeground }]}>{currentLabel}</Text>
          <Text style={{ color: colors.mutedForeground }}> ›</Text>
        </View>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {options.map(opt => (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.optionText, { color: colors.foreground }]}>{opt.label}</Text>
                  {currentValue === opt.value && (
                    <Text style={{ color: colors.primary }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 15 },
  right: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 14 },
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  dialog: { width: 280, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  optionText: { fontSize: 15 },
})
