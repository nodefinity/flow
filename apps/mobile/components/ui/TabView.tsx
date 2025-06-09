import type { FC } from 'react'
import type { TabViewProps as RNTabViewProps, TabDescriptor } from 'react-native-tab-view'

import { useMemo, useState } from 'react'
import { Dimensions } from 'react-native'
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
}

export const TabView: FC<TabViewProps> = ({
  routes,
  renderScene,
  ...rest
}) => {
  const theme = useThemeColor()
  const paperTheme = useTheme()
  const [index, setIndex] = useState(0)

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex)
  }

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
        tabStyle={{ width: 'auto' }}
        activeColor={theme.primary}
        inactiveColor={theme.onSurfaceVariant}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={{ backgroundColor: theme.surface, elevation: 0 }}
        options={tabOptions}
        // tabStyle width: 'auto' cause tab bar indicator children wrong transform
        // https://github.com/react-navigation/react-navigation/issues/12393
        // TODO: custom indicator
        renderIndicator={() => null}
      />
    )
  }

  return (
    <RNTabView
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      initialLayout={{ width: Dimensions.get('window').width }}
      style={{
        backgroundColor: theme.background,
      }}
      {...rest}
    />
  )
}
