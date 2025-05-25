import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import type { DrawerSectionProps } from 'react-native-paper'
import { NAVIGATION_CONFIG, useTranslation } from '@flow/core'
import { View } from 'react-native'
import { Drawer } from 'react-native-paper'

interface DrawerContentProps extends DrawerSectionProps {
  navProps: DrawerContentComponentProps
}

function DrawerContent(props: DrawerContentProps) {
  const { t } = useTranslation()
  const currentIndex = props.navProps.state.index

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {NAVIGATION_CONFIG.map((config, index) => (
        <Drawer.CollapsedItem
          key={config.name}
          label={t(`${config.locale}.title`)}
          focusedIcon={config.focusedIcon}
          unfocusedIcon={config.unfocusedIcon}
          active={currentIndex === index}
          onPress={() => {
            props.navProps.navigation.navigate(config.name)
          }}
        />
      ))}
    </View>
  )
}

export default DrawerContent
