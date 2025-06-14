import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { Home } from './Home'

export interface RootStackParamList {
  Home: undefined
  [key: string]: undefined
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
