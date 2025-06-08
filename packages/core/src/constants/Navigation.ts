export interface NavigationConfig {
  name: string
  locale: string
  focusedIcon: any
  unfocusedIcon: any
}

export const NAVIGATION_CONFIG: NavigationConfig[] = [
  {
    name: 'index',
    locale: 'navigation.home',
    focusedIcon: 'home',
    unfocusedIcon: 'home-outline',
  },
  {
    name: 'setting',
    locale: 'navigation.setting',
    focusedIcon: 'cog',
    unfocusedIcon: 'cog-outline',
  },
]

export enum TAB_ROUTES_NAME {
  SuggestedScreen = 'suggested',
  TracksScreen = 'tracks',
  AlbumsScreen = 'albums',
  ArtistsScreen = 'artists',
  FoldersScreen = 'folders',
}

export const TAB_ROUTES: NavigationConfig[] = [
  {
    name: TAB_ROUTES_NAME.SuggestedScreen,
    locale: 'navigation.suggested',
    focusedIcon: 'home',
    unfocusedIcon: 'home-outline',
  },
  {
    name: TAB_ROUTES_NAME.TracksScreen,
    locale: 'navigation.tracks',
    focusedIcon: 'music-box-multiple',
    unfocusedIcon: 'music-box-multiple-outline',
  },
  {
    name: TAB_ROUTES_NAME.AlbumsScreen,
    locale: 'navigation.albums',
    focusedIcon: 'album',
    unfocusedIcon: 'album-outline',
  },
  {
    name: TAB_ROUTES_NAME.ArtistsScreen,
    locale: 'navigation.artists',
    focusedIcon: 'account-group',
    unfocusedIcon: 'account-group-outline',
  },
  {
    name: TAB_ROUTES_NAME.FoldersScreen,
    locale: 'navigation.folders',
    focusedIcon: 'folder',
    unfocusedIcon: 'folder-outline',
  },
]
