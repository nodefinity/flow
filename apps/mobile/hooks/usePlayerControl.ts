/**
 * usePlayerControl
 *
 * This Hook encapsulates all playback operations, including:
 * - Play/pause
 * - Previous/next
 * - Play specified track
 * - Get current playback state
 *
 * It keeps the audio pro state in sync with the player store.
 *
 * Usage example:
 * ```tsx
 * function MyComponent() {
 *   const { currentTrack, playPause, playNext, playPrevious } = usePlayerControl()
 *
 *   return (
 *     <View>
 *       <Text>{currentTrack?.title}</Text>
 *       <Button onPress={playPause} title="Play/pause" />
 *       <Button onPress={playNext} title="Next" />
 *       <Button onPress={playPrevious} title="Previous" />
 *     </View>
 *   )
 * }
 * ```
 */

import type { Track } from '@flow/core'
import type { AudioProTrack } from 'react-native-audio-pro'
import { usePlayerStore } from '@flow/core'
import { useCallback } from 'react'
import { AudioPro, AudioProState } from 'react-native-audio-pro'

export function usePlayerControl() {
  const { queue, currentIndex, next, prev, mode, play } = usePlayerStore()

  const currentTrack = queue[currentIndex]

  const playTrack = useCallback((track: AudioProTrack, autoPlay: boolean = true) => {
    AudioPro.play(track, { autoPlay })
  }, [])

  const playList = useCallback((track: Track, list?: Track[]) => {
    play(track, list)
    playTrack(track as unknown as AudioProTrack, true)
  }, [])

  const playPause = useCallback(() => {
    const state = AudioPro.getState()
    if (state === AudioProState.PLAYING) {
      AudioPro.pause()
    }
    else if (state === AudioProState.PAUSED) {
      AudioPro.resume()
    }
  }, [])

  const playNext = useCallback((_userControl: boolean = true) => {
    console.log('playNext', queue)
    if (queue.length === 0)
      return

    // Use playerStore's next method
    next(_userControl)

    // Get the new current track and play it
    const newCurrentTrack = queue[(currentIndex + 1) % queue.length]
    if (newCurrentTrack) {
      const audioProTrack: AudioProTrack = {
        id: newCurrentTrack.id,
        title: newCurrentTrack.title,
        artist: newCurrentTrack.artist,
        artwork: newCurrentTrack.artwork,
        url: newCurrentTrack.url,
        duration: newCurrentTrack.duration,
      }
      playTrack(audioProTrack, true)
    }
  }, [queue, currentIndex, next, playTrack])

  const playPrevious = useCallback((_userControl: boolean = true) => {
    if (queue.length === 0)
      return

    // Use playerStore's prev method
    prev()

    // Get the new current track and play it
    const newCurrentTrack = queue[currentIndex > 0 ? currentIndex - 1 : queue.length - 1]
    if (newCurrentTrack) {
      const audioProTrack: AudioProTrack = {
        id: newCurrentTrack.id,
        title: newCurrentTrack.title,
        artist: newCurrentTrack.artist,
        artwork: newCurrentTrack.artwork,
        url: newCurrentTrack.url,
        duration: newCurrentTrack.duration,
      }
      playTrack(audioProTrack, true)
    }
  }, [queue, currentIndex, prev, playTrack])

  const playCurrentTrack = useCallback(() => {
    if (!currentTrack)
      return

    const audioProTrack: AudioProTrack = {
      id: currentTrack.id,
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.artwork,
      url: currentTrack.url,
      duration: currentTrack.duration,
    }
    playTrack(audioProTrack, true)
  }, [currentTrack, playTrack])

  return {
    currentTrack,
    queue,
    currentIndex,
    mode,
    playList,
    // playTrack,
    playPause,
    playNext,
    playPrevious,
    playCurrentTrack,
  }
}
