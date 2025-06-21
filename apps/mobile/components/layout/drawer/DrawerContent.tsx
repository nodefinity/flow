import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { CommonActions } from '@react-navigation/native'
import { View } from 'react-native'
import { Appbar, Drawer, useTheme } from 'react-native-paper'

export default function DrawerTabBar({ state, descriptors, navigation }: DrawerContentComponentProps) {
  const { colors } = useTheme()

  return (
    <View style={[{
      backgroundColor: colors.background,
      borderRightColor: colors.outline,
    }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Flow" />
      </Appbar.Header>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'drawerItemPress',
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
          if (options.drawerLabel && typeof options.drawerLabel === 'string') {
            return options.drawerLabel
          }
          if (options.title) {
            return options.title
          }
          return route.name
        }

        const getIcon = () => {
          if (options.drawerIcon) {
            const iconElement = options.drawerIcon({ focused: true, color: '', size: 24 })
            const unfocusedIconElement = options.drawerIcon({ focused: false, color: '', size: 24 })

            return isFocused ? (iconElement as any)?.props?.name : (unfocusedIconElement as any)?.props?.name
          }
          return undefined
        }

        return (
          <Drawer.Item
            key={route.key}
            icon={getIcon()}
            label={getTitle()}
            active={isFocused}
            onPress={onPress}
          />
        )
      })}
    </View>
  )
}
