import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { Home } from './Home'

// eslint-disable-next-line ts/consistent-type-definitions
export type RootStackParamList = {
  Home: undefined
}

export function RootNavigator() {
  const Stack = createStackNavigator<RootStackParamList>()
  return (
    <Stack.Navigator screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
      headerShown: false,
      detachPreviousScreen: false,
    }}
    >
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  )
}
