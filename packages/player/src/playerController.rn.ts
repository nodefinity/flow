import type { Track } from '@flow/shared'
import type { PlayerController } from './playerController'
import type { PlayMode } from './playerStore'
import { usePlayerStore } from './playerStore'

export const playerController: PlayerController = {
  async addToQueue(track: Track) {
    usePlayerStore.getState().addToQueue(track)
  },

  async insertNext(track: Track) {
    usePlayerStore.getState().insertNext(track)
  },

  async removeFromQueue(trackId: string) {
    usePlayerStore.getState().removeFromQueue(trackId)
  },

  async clearQueue() {
    usePlayerStore.use.clearQueue()()
  },

  async play() {
    usePlayerStore.getState().play()
  },

  async pause() {
    usePlayerStore.getState().pause()
  },

  async next() {
    usePlayerStore.getState().next()
  },

  async prev() {
    usePlayerStore.getState().prev()
  },

  async playQueue(tracks: Track[], startTrack?: Track) {
    usePlayerStore.getState().playQueue(tracks, startTrack)
  },

  async playTrack(track: Track) {
    usePlayerStore.getState().playTrack(track)
  },

  async setMode(mode: PlayMode) {
    usePlayerStore.getState().setMode(mode)
  },

  async syncCurrentIndex(index: number) {
    usePlayerStore.getState().setCurrentIndex(index)
  },

  async seekTo(_position: number) {},
}
