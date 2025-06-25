import type { Track } from '@flow/core'
import type { PlayerStoreActions } from './playerStore'
import TrackPlayer, { RepeatMode } from 'react-native-track-player'
import { PlayMode, usePlayerStore } from './playerStore'

export const playerController: PlayerStoreActions = {
  // #region queue management
  async addToQueue(track: Track) {
    const addToQueue = usePlayerStore.use.addToQueue()
    await TrackPlayer.add([track])
    addToQueue(track)
  },

  async insertNext(track: Track) {
    const insertNext = usePlayerStore.use.insertNext()
    const currentIndex = usePlayerStore.getState().currentIndex
    await TrackPlayer.add([track], currentIndex)
    insertNext(track)
  },

  async removeFromQueue(trackId: string) {
    const removeFromQueue = usePlayerStore.use.removeFromQueue()
    const index = usePlayerStore.getState().queue.findIndex(t => t.id === trackId)
    await TrackPlayer.remove(index)
    removeFromQueue(trackId)
  },

  async clearQueue() {
    const clearQueue = usePlayerStore.use.clearQueue()
    await TrackPlayer.reset()
    clearQueue()
  },
  // #endregion

  // #region play control
  async play() {
    const play = usePlayerStore.use.play()
    await TrackPlayer.play()
    play()
  },

  async pause() {
    const pause = usePlayerStore.use.pause()
    await TrackPlayer.pause()
    pause()
  },

  async next() {
    const next = usePlayerStore.use.next()
    await TrackPlayer.skipToNext()
    next()
  },

  async prev() {
    const prev = usePlayerStore.use.prev()
    await TrackPlayer.skipToPrevious()
    prev()
  },

  async playQueue(tracks: Track[], startTrack?: Track) {
    const playQueue = usePlayerStore.use.playQueue()

    playQueue(tracks, startTrack)
    const processedQueue = usePlayerStore.getState().queue
    const currentIndex = usePlayerStore.getState().currentIndex

    await TrackPlayer.reset()
    await TrackPlayer.add(processedQueue)

    // if provide startTrack, load it and then play
    if (currentIndex >= 0) {
      await TrackPlayer.skip(currentIndex)
    }
  },

  async playTrack(track: Track) {
    const playTrack = usePlayerStore.use.playTrack()
    const queue = usePlayerStore.getState().queue
    playTrack(track)

    if (queue.findIndex(t => t.id === track.id) === -1) {
      await TrackPlayer.add([track])
    }
    else {
      await TrackPlayer.load(track)
      TrackPlayer.play()
    }
  },
  // #endregion

  // #region play mode
  async setMode(mode: PlayMode) {
    const setMode = usePlayerStore.use.setMode()
    await TrackPlayer.setRepeatMode(mode === PlayMode.SINGLE ? RepeatMode.Track : RepeatMode.Queue)

    setMode(mode)

    const updatedQueue = usePlayerStore.getState().queue
    const currentIndex = usePlayerStore.getState().currentIndex

    await TrackPlayer.reset()
    await TrackPlayer.add(updatedQueue)

    if (updatedQueue.length > 0 && currentIndex >= 0) {
      await TrackPlayer.skip(currentIndex)
    }
  },
  // #endregion
}
