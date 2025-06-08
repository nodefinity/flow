import { Feather } from '@expo/vector-icons'

import { TAB_ROUTES, TAB_ROUTES_NAME, useTranslation } from '@flow/core'
import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Appbar } from 'react-native-paper'
import { SceneMap } from 'react-native-tab-view'

import {
  AlbumsScreen,
  ArtistsScreen,
  FoldersScreen,
  SongsScreen,
  SuggestedScreen,
} from '@/components/screens'
import { TabView } from '@/components/ui/TabView'
import { ThemedView } from '@/components/ui/ThemedView'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function HomeScreen() {
  const { t } = useTranslation()
  const theme = useThemeColor()

  const renderScene = useMemo(() => SceneMap({
    [TAB_ROUTES_NAME.SuggestedScreen]: SuggestedScreen,
    [TAB_ROUTES_NAME.SongsScreen]: SongsScreen,
    [TAB_ROUTES_NAME.AlbumsScreen]: AlbumsScreen,
    [TAB_ROUTES_NAME.ArtistsScreen]: ArtistsScreen,
    [TAB_ROUTES_NAME.FoldersScreen]: FoldersScreen,
  }), [])

  const routes = useMemo(() => TAB_ROUTES.map(route => ({
    key: route.name,
    title: t(route.locale),
    icon: route.focusedIcon,
  })), [t])

  const SearchIcon = useMemo(() => {
    return () => <Feather name="search" size={24} color={theme.onBackground} />
  }, [theme.onBackground])

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('home.title')} titleStyle={{ fontWeight: '700' }} />
        <Appbar.Action icon={SearchIcon} onPress={() => { }} />
      </Appbar.Header>

      <TabView routes={routes} renderScene={renderScene} lazy lazyPreloadDistance={1} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
