import type { Programme, Segment, Track } from '@flow/shared'
import type { PlayMode } from './playerStore'

export interface PlayerController {
  // classic queue
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

  seekTo: (position: number) => void

  // radio mode
  loadProgramme: (programme: Programme) => void
  nextSegment: () => void
  onSegmentEnd: (listener: (segment: Segment, index: number) => void) => () => void
}

export declare const playerController: PlayerController
