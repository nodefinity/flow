import type { Track } from '@flow/core'
import type { PlayerController } from './playerController'
import { logger } from '@flow/core'
import TrackPlayer, { RepeatMode } from 'react-native-track-player'
import { PlayMode, usePlayerStore } from './playerStore'

export const playerController: PlayerController = {
  // #region queue management
  async addToQueue(track: Track) {
    try {
      const addToQueue = usePlayerStore.getState().addToQueue
      await TrackPlayer.add([track])
      addToQueue(track)
    }
    catch (error) {
      logger.error('addToQueue error:', error)
    }
  },

  async insertNext(track: Track) {
    try {
      const insertNext = usePlayerStore.getState().insertNext
      const currentIndex = usePlayerStore.getState().currentIndex
      await TrackPlayer.add([track], currentIndex + 1)
      insertNext(track)
    }
    catch (error) {
      logger.error('insertNext error:', error)
    }
  },

  async removeFromQueue(trackId: string) {
    try {
      const removeFromQueue = usePlayerStore.getState().removeFromQueue
      const queue = usePlayerStore.getState().queue
      const index = queue.findIndex((t: Track) => t.id === trackId)
      if (index >= 0) {
        await TrackPlayer.remove(index)
        removeFromQueue(trackId)
      }
    }
    catch (error) {
      logger.error('removeFromQueue error:', error)
    }
  },

  async clearQueue() {
    try {
      const clearQueue = usePlayerStore.use.clearQueue()
      await TrackPlayer.reset()
      clearQueue()
    }
    catch (error) {
      logger.error('clearQueue error:', error)
    }
  },
  // #endregion

  // #region play control
  async play() {
    try {
      const play = usePlayerStore.getState().play
      await TrackPlayer.play()
      play()
    }
    catch (error) {
      logger.error('play error:', error)
    }
  },

  async pause() {
    try {
      const pause = usePlayerStore.getState().pause
      await TrackPlayer.pause()
      pause()
    }
    catch (error) {
      logger.error('pause error:', error)
    }
  },

  async next() {
    try {
      const next = usePlayerStore.getState().next
      await TrackPlayer.skipToNext()
      next()
    }
    catch (error) {
      logger.error('next error:', error)
    }
  },

  async prev() {
    try {
      const prev = usePlayerStore.getState().prev
      await TrackPlayer.skipToPrevious()
      prev()
    }
    catch (error) {
      logger.error('prev error:', error)
    }
  },

  async playQueue(tracks: Track[], startTrack?: Track) {
    try {
      // 先更新 store 状态
      const playQueue = usePlayerStore.getState().playQueue
      playQueue(tracks, startTrack)

      // 获取更新后的状态
      const { queue: processedQueue, currentIndex } = usePlayerStore.getState()

      // 更新 TrackPlayer
      await TrackPlayer.reset()
      if (processedQueue.length > 0) {
        await TrackPlayer.add(processedQueue)
      }

      // 跳转到指定位置
      if (currentIndex >= 0 && currentIndex < processedQueue.length) {
        await TrackPlayer.skip(currentIndex)
        await TrackPlayer.play()
      }
    }
    catch (error) {
      console.log('playQueue error:', error, typeof error)
      logger.error('playQueue error:', error)
    }
  },

  async playTrack(track: Track) {
    try {
      const playTrack = usePlayerStore.getState().playTrack
      const queue = usePlayerStore.getState().queue
      playTrack(track)

      const trackIndex = queue.findIndex((t: Track) => t.id === track.id)
      if (trackIndex === -1) {
        // 如果歌曲不在队列中，添加到队列并播放
        await TrackPlayer.add([track])
        await TrackPlayer.skip(0)
      }
      else {
        // 如果歌曲在队列中，直接跳转到该歌曲
        await TrackPlayer.skip(trackIndex)
      }
    }
    catch (error) {
      logger.error('playTrack error:', error)
    }
  },
  // #endregion

  // #region play mode
  async setMode(mode: PlayMode) {
    try {
      const setMode = usePlayerStore.getState().setMode
      await TrackPlayer.setRepeatMode(mode === PlayMode.SINGLE ? RepeatMode.Track : RepeatMode.Queue)

      setMode(mode)

      const updatedQueue = usePlayerStore.getState().queue
      const currentIndex = usePlayerStore.getState().currentIndex

      await TrackPlayer.reset()
      if (updatedQueue.length > 0) {
        await TrackPlayer.add(updatedQueue)
      }

      if (updatedQueue.length > 0 && currentIndex >= 0) {
        await TrackPlayer.skip(currentIndex)
      }
    }
    catch (error) {
      logger.error('setMode error:', error)
    }
  },
  // #endregion

  // #region sync
  async syncCurrentIndex(index: number) {
    try {
      const { queue } = usePlayerStore.getState()

      if (index >= 0 && index < queue.length) {
        const setCurrentIndex = usePlayerStore.getState().setCurrentIndex
        setCurrentIndex(index)
        logger.info(`Synced current index to: ${index}`)
      }
    }
    catch (error) {
      logger.error('syncCurrentIndex error:', error)
    }
  },
  // #endregion
}
