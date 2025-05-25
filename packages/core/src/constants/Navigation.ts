export interface NavigationConfig {
  name: string
  locale: string
  focusedIcon: any
  unfocusedIcon: any
}

export const NAVIGATION_CONFIG: NavigationConfig[] = [
  {
    name: 'index',
    locale: 'home',
    focusedIcon: 'home',
    unfocusedIcon: 'home-outline',
  },
  {
    name: 'setting',
    locale: 'setting',
    focusedIcon: 'cog',
    unfocusedIcon: 'cog-outline',
  },
]
