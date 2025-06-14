import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from '@flow/core'
import { DeviceType, deviceType } from 'expo-device'
import { Drawer } from 'expo-router/drawer'
import { Animated, StyleSheet, useWindowDimensions } from 'react-native'
import { Appbar } from 'react-native-paper'
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import DrawerContent from '@/components/ui/DrawerContent'
import DrawerHeader from '@/components/ui/DrawerHeader'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function DrawerLayout() {
  const colors = useThemeColor()
  const { t } = useTranslation()

  const layout = useWindowDimensions()
  const active = useSharedValue(false)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active.value ? withTiming(1) : withTiming(0.8) }],
  }))

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Drawer
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          drawerType: deviceType === DeviceType.PHONE ? 'slide' : 'permanent',
          drawerStyle: {
            backgroundColor: colors.background,
            borderRightColor: colors.outlineVariant,
          },
          header: props => <DrawerHeader navProps={props} children={undefined} />,
          swipeEdgeWidth: layout.width,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: t(`navigation.home`),
            drawerIcon: ({ focused, color, size }) => {
              const icon = (focused ? 'home' : 'home-outline')
              return <MaterialCommunityIcons size={size} name={icon} color={color} />
            },
            headerRight: () => <Appbar.Action icon="magnify" onPress={() => { }} />,
          }}
        />

        <Drawer.Screen
          name="setting"
          options={{
            title: t(`navigation.setting`),
            drawerIcon: ({ focused, color, size }) => {
              const icon = (focused ? 'cog' : 'cog-outline')
              return <MaterialCommunityIcons size={size} name={icon} color={color} />
            },
          }}
        />
      </Drawer>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
