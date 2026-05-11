import type { Language, Theme } from '@flow/shared'
import { useTranslation } from '@flow/shared'
import { useSettingStore } from '@flow/store'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { SettingSelector } from '@/modules/setting/SettingSelector'
import { TrackScanButton } from '@/modules/setting/TrackScanButton'

export default function SettingScreen() {
  const colors = useColors()
  const { t } = useTranslation()
  const theme = useSettingStore.use.theme()
  const language = useSettingStore.use.language()
  const updateSetting = useSettingStore.use.updateSetting()

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          {t('setting.appearance.title')}
        </Text>
        <SettingSelector
          title={t('setting.appearance.language.title')}
          currentValue={language}
          options={[
            { value: 'auto', label: t('setting.appearance.language.auto') },
            { value: 'zh', label: t('setting.appearance.language.chinese') },
            { value: 'en', label: t('setting.appearance.language.english') },
          ]}
          onValueChange={v => updateSetting({ language: v as Language })}
        />
        <SettingSelector
          title={t('setting.appearance.theme.title')}
          currentValue={theme}
          options={[
            { value: 'auto', label: t('setting.appearance.theme.auto') },
            { value: 'light', label: t('setting.appearance.theme.light') },
            { value: 'dark', label: t('setting.appearance.theme.dark') },
          ]}
          onValueChange={v => updateSetting({ theme: v as Theme })}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          {t('setting.playback.title')}
        </Text>
        <TrackScanButton
          title={t('setting.playback.scanTracks')}
          description={t('setting.playback.scanTracksDescription')}
          type="scan"
        />
        <TrackScanButton
          title={t('setting.playback.pickFiles')}
          description={t('setting.playback.pickFilesDescription')}
          type="pick"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  section: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
})
