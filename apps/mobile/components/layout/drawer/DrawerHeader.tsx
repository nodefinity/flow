import type { DrawerHeaderProps as BaseProps } from '@react-navigation/drawer'
import type { AppbarProps, SearchbarProps } from 'react-native-paper'
import { getHeaderTitle } from '@react-navigation/elements'
import { DeviceType, deviceType } from 'expo-device'
import React from 'react'
import { Appbar, Searchbar, Tooltip } from 'react-native-paper'

interface DrawerHeaderProps extends AppbarProps {
  navProps: BaseProps
  withSearchBar?: boolean
  searchBarProps?: SearchbarProps
}

export default function DrawerHeader(props: DrawerHeaderProps) {
  const [query, setQuery] = React.useState('')

  const showMenu = deviceType === DeviceType.PHONE

  React.useEffect(() => {
    if (props.searchBarProps?.onChangeText) {
      props.searchBarProps.onChangeText(query)
    }
  }, [query])

  return props.withSearchBar
    ? (
        <Appbar.Header {...props}>
          <Searchbar
            {...props.searchBarProps}
            icon="menu"
            value={query}
            onChangeText={setQuery}
            style={{ margin: 8, marginBottom: 16 }}
            onIconPress={() => props.navProps.navigation.openDrawer()}
          />
        </Appbar.Header>
      )
    : (
        <Appbar.Header {...props} mode="center-aligned">
          {showMenu && (
            <Tooltip title="Open drawer">
              <Appbar.Action
                icon="menu"
                onPress={() => props.navProps.navigation.openDrawer()}
              />
            </Tooltip>
          )}

          <Appbar.Content
            title={getHeaderTitle(
              props.navProps.options,
              props.navProps.route.name,
            )}
          />

          {props.navProps.options.headerRight
            ? props.navProps.options.headerRight({
                canGoBack: props.navProps.navigation.canGoBack(),
              })
            : undefined}
        </Appbar.Header>
      )
}
