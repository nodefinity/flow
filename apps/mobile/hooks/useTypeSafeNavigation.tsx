import type { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParamList } from '@/navigators/RootNavigator'
import { useNavigation } from '@react-navigation/native'

type NavigationProp = StackNavigationProp<RootStackParamList>

function useTypeSafeNavigation() {
  const navigation = useNavigation<NavigationProp>()

  return navigation
}

export default useTypeSafeNavigation
