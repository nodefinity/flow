import type { ColorName, Language, Theme } from '@flow/core'
import type { Track } from '@/constants/PlayList'
import { ColorNames, useAppSetting, useTranslation } from '@flow/core'
import { ScrollView, StyleSheet } from 'react-native'
import { Appbar, List, Surface } from 'react-native-paper'
import { MusicScanButton } from '@/components/ui/MusicScanButton'
import { SettingSelector } from '@/components/ui/SettingSelector'
import { ThemedView } from '@/components/ui/ThemedView'
import { addLocalTracks } from '@/utils/musicStorage'

export default function TabTwoScreen() {
  const { t } = useTranslation()
  const { setting, updateSetting } = useAppSetting()

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

  const handleMusicLoaded = async (tracks: Track[]) => {
    console.log(`音乐扫描完成，找到 ${tracks.length} 首歌曲:`, tracks.map(t => t.title))

    // 将扫描到的音乐保存到本地存储
    try {
      await addLocalTracks(tracks)
      console.log('音乐已保存到本地存储')
    }
    catch (error) {
      console.error('保存音乐失败:', error)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('setting.title')} />
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
            <MusicScanButton
              title={t('setting.playback.scanMusic')}
              description={t('setting.playback.scanMusicDescription')}
              icon="music-box-multiple"
              type="scan"
              onMusicLoaded={handleMusicLoaded}
            />

            <MusicScanButton
              title={t('setting.playback.pickFiles')}
              description={t('setting.playback.pickFilesDescription')}
              icon="file-music"
              type="pick"
              onMusicLoaded={handleMusicLoaded}
            />

            <List.Item
              title={t('setting.playback.equalizer')}
              left={props => <List.Icon {...props} icon="equalizer" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: 实现均衡器功能
                console.log('打开均衡器')
              }}
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
  },
  surface: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
})
