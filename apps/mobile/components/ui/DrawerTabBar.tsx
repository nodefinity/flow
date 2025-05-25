import type { NavigationConfig } from '@flow/core'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { CommonActions } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'
import { Drawer } from 'react-native-paper'
import { useThemeColor } from '@/hooks/useThemeColor'

interface DrawerTabBarProps extends BottomTabBarProps {
  config: NavigationConfig[]
}

export default function DrawerTabBar({ state, descriptors, navigation, config }: DrawerTabBarProps) {
  const theme = useThemeColor()

  return (
    <View style={[styles.container, {
      backgroundColor: theme.background,
      borderRightColor: theme.outline,
    }]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!event.defaultPrevented && !isFocused) {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            })
          }
        }

        const getTitle = () => {
          if (options.tabBarLabel && typeof options.tabBarLabel === 'string') {
            return options.tabBarLabel
          }
          if (options.title) {
            return options.title
          }
          return route.name
        }

        return (
          <View key={route.key} style={styles.itemContainer}>
            <Drawer.CollapsedItem
              label={getTitle()}
              focusedIcon={config.find(item => item.name === route.name)?.focusedIcon}
              unfocusedIcon={config.find(item => item.name === route.name)?.unfocusedIcon}
              active={isFocused}
              onPress={onPress}
            />
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 92,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    marginVertical: 8,
    width: '100%',
    paddingHorizontal: 6,
  },
})
