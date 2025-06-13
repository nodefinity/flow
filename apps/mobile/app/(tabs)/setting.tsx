import type { ColorName, Language, Theme } from '@flow/core'
import { ColorNames, useSettingStore, useTranslation } from '@flow/core'
import { ScrollView, StyleSheet } from 'react-native'
import { Appbar, List, Surface } from 'react-native-paper'
import { SettingSelector } from '@/components/ui/SettingSelector'
import { ThemedView } from '@/components/ui/ThemedView'
import { TrackScanButton } from '@/components/ui/TrackScanButton'

export default function SettingScreen() {
  const { t } = useTranslation()
  const { setting, updateSetting } = useSettingStore()

  const languageOptions = [
    { value: 'auto', label: t('setting.appearance.language.auto') },
    { value: 'zh', label: t('setting.appearance.language.chinese') },
    { value: 'en', label: t('setting.appearance.language.english') },
  ]

  const themeOptions = [
    { value: 'auto', label: t('setting.appearance.theme.auto') },
    { value: 'light', label: t('setting.appearance.theme.light') },
    { value: 'dark', label: t('setting.appearance.theme.dark') },
  ]

  const colorOptions = ColorNames.map(color => ({
    value: color,
    label: t(`setting.appearance.color.${color}`),
  }))

  const handleLanguageChange = (value: string) => {
    updateSetting({ language: value as Language })
  }

  const handleThemeChange = (value: string) => {
    updateSetting({ theme: value as Theme })
  }

  const handleColorChange = (value: string) => {
    updateSetting({ color: value as ColorName })
  }

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('navigation.setting')} titleStyle={{ fontFamily: 'UrbanistSemiBold' }} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface} mode="flat">
          <List.Section title={t('setting.appearance.title')} style={styles.listSection}>
            <SettingSelector
              title={t('setting.appearance.language.title')}
              icon="translate"
              currentValue={setting.language}
              options={languageOptions}
              onValueChange={handleLanguageChange}
            />

            <SettingSelector
              title={t('setting.appearance.theme.title')}
              icon="theme-light-dark"
              currentValue={setting.theme}
              options={themeOptions}
              onValueChange={handleThemeChange}
            />

            <SettingSelector
              title={t('setting.appearance.color.title')}
              icon="palette"
              currentValue={setting.color}
              options={colorOptions}
              onValueChange={handleColorChange}
            />
          </List.Section>
        </Surface>

        <Surface style={styles.surface} mode="flat">
          <List.Section title={t('setting.playback.title')} style={styles.listSection}>
            <TrackScanButton
              title={t('setting.playback.scanTracks')}
              description={t('setting.playback.scanTracksDescription')}
              icon="music-box-multiple"
              type="scan"
            />

            <TrackScanButton
              title={t('setting.playback.pickFiles')}
              description={t('setting.playback.pickFilesDescription')}
              icon="file-music"
              type="pick"
            />
          </List.Section>
        </Surface>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  listSection: {
    marginVertical: 0,
    paddingHorizontal: 0,
  },
  surface: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
})
