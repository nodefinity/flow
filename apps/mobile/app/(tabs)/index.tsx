import { Feather } from '@expo/vector-icons'

import { useTranslation } from '@flow/core'
import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Text } from 'react-native-paper'
import { SceneMap } from 'react-native-tab-view'

import { TabView } from '@/components/ui/TabView'
import { ThemedView } from '@/components/ui/ThemedView'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function HomeScreen() {
  const { t } = useTranslation()
  const theme = useThemeColor()
  const [index, setIndex] = useState(0)

  const renderScene = SceneMap({
    first: () => <Text>First</Text>,
    second: () => <Text>Second</Text>,
    third: () => <Text>Third</Text>,
    fourth: () => <Text>Fourth</Text>,
    fifth: () => <Text>Fifth</Text>,
    sixth: () => <Text>Sixth</Text>,
    seventh: () => <Text>Seventh</Text>,
    eighth: () => <Text>Eighth</Text>,
    ninth: () => <Text>Ninth</Text>,
    tenth: () => <Text>Tenth</Text>,
  })

  const routes = [
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
    { key: 'third', title: 'Third' },
    { key: 'fourth', title: 'Fourth' },
    { key: 'fifth', title: 'Fifth' },
    { key: 'sixth', title: 'Sixth' },
    { key: 'seventh', title: 'Seventh' },
    { key: 'eighth', title: 'Eighth' },
    { key: 'ninth', title: 'Ninth' },
    { key: 'tenth', title: 'Tenth' },
  ]

  const SearchIcon = useMemo(() => {
    return () => <Feather name="search" size={24} color={theme.onBackground} />
  }, [theme.onBackground])

  return (
    <ThemedView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('home.title')} />
        <Appbar.Action icon={SearchIcon} onPress={() => { }} />
      </Appbar.Header>

      <View style={styles.tabView}>
        <TabView
          routes={routes}
          index={index}
          onIndexChange={setIndex}
          renderScene={renderScene}
          pagerStyle={styles.pager}
        />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabView: {
    flex: 1,
    marginHorizontal: 16,
  },
  pager: {
    marginTop: 16,
  },
})
