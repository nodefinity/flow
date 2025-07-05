import type { Track } from '@flow/core'
import type { PlayMode } from './playerStore'

export interface PlayerController {
  addToQueue: (track: Track) => void
  insertNext: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void

  play: () => void
  pause: () => void
  next: () => void
  prev: () => void

  playQueue: (tracks: Track[], startTrack?: Track) => void
  playTrack: (track: Track) => void

  setMode: (mode: PlayMode) => void

  syncCurrentIndex: (index: number) => void
}

export declare const playerController: PlayerController
