import { Dimensions } from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export const MINI_HEIGHT = 75
export const SNAP_MINI = SCREEN_HEIGHT - MINI_HEIGHT
export const SNAP_FULL = 0
export const SNAP_QUEUE = -SCREEN_HEIGHT
