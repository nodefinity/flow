// import { MaterialCommunityIcons } from '@expo/vector-icons'
// import { useTranslation } from '@flow/core'
// import { DeviceType, deviceType } from 'expo-device'
import { Slot } from 'expo-router'
import { StyleSheet } from 'react-native'
// import { Appbar } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import Drawer from '@/components/ui/Drawer'
// import DrawerContent from '@/components/ui/DrawerContent'
// import DrawerHeader from '@/components/ui/DrawerHeader'
import Header from '@/components/ui/Header'
import Overlay from '@/components/ui/Overlay'
// import { useThemeColor } from '@/hooks/useThemeColor'

export default function DrawerLayout() {
  // const colors = useThemeColor()
  // const { t } = useTranslation()

  // const layout = useWindowDimensions()
  const active = useSharedValue(false)
  const progress = useDerivedValue(() => {
    return withTiming(active.value ? 1 : 0)
  })
  const animatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      progress.value,
      [0, 1],
      [0, -15],
      Extrapolation.CLAMP,
    )
    return {
      transform: [
        // {perspective: 1000},r
        { scale: active.value ? withTiming(0.8) : withTiming(1) },
        { translateX: active.value ? withSpring(240) : withTiming(0) },
        {
          rotateY: `${rotateY}deg`,
        },
      ],
      borderRadius: active.value ? withTiming(28) : withTiming(0),
    }
  })

  return (
    <Animated.View style={{ flex: 1 }}>
      {/* <Drawer
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
      </Drawer> */}
      <Animated.View style={[styles.container, animatedStyle]}>
        <Header active={active} />
        <Slot />
        <Overlay active={active} />
      </Animated.View>
      <Drawer active={active} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d2733',
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
  },
})
