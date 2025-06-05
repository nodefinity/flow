import type { FC } from 'react'
import type { TabViewProps as RNTabViewProps, TabDescriptor } from 'react-native-tab-view'

import { useCallback, useMemo } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { TabView as RNTabView, TabBar } from 'react-native-tab-view'
import { useThemeColor } from '@/hooks/useThemeColor'

export interface TabRoute {
  key: string
  title: string
  icon?: string
}

interface TabViewProps extends Omit<RNTabViewProps<TabRoute>, 'navigationState' | 'onIndexChange'> {
  routes: TabRoute[]
  index: number
  onIndexChange: (index: number) => void
  tabBarPosition?: 'top' | 'bottom'
}

export const TabView: FC<TabViewProps> = ({
  routes,
  renderScene,
  index = 0,
  onIndexChange,
  ...rest
}) => {
  const theme = useThemeColor()
  const paperTheme = useTheme()

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      onIndexChange?.(newIndex)
    },
    [onIndexChange],
  )

  const tabOptions = useMemo(() => {
    const options: Record<string, TabDescriptor<TabRoute>> = {}

    routes.forEach((route) => {
      options[route.key] = {
        labelStyle: {
          fontFamily: paperTheme.fonts.labelLarge.fontFamily || 'Urbanist',
          fontSize: paperTheme.fonts.labelLarge.fontSize || 14,
          fontWeight: '700',
          letterSpacing: paperTheme.fonts.labelLarge.letterSpacing || 0,
        },
      }
    })

    return options
  }, [routes, paperTheme.fonts.labelLarge])

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        scrollEnabled
        activeColor={theme.primary}
        inactiveColor={theme.onSurfaceVariant}
        tabStyle={{ width: 'auto' }}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={{ backgroundColor: theme.surface }}
        options={tabOptions}
      />
    )
  }

  return (
    <View style={styles.container}>
      <RNTabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        renderTabBar={renderTabBar}
        initialLayout={{ width: Dimensions.get('window').width }}
        style={{
          backgroundColor: theme.background,
        }}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 48,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    minHeight: 40,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
})
