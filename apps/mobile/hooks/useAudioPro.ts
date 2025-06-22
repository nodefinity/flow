import type { AudioProEvent, AudioProTrack } from 'react-native-audio-pro'
import { PlayMode, usePlayerStore } from '@flow/store'
import { useEffect } from 'react'
import { AudioPro, AudioProContentType, AudioProEventType } from 'react-native-audio-pro'

type TrackCallback = () => {
  currentTrackId: string | null
  playList: AudioProTrack[]
  mode: PlayMode
  next: (userControl?: boolean) => void
  prev: () => void
}

let getTrackStateCallback: TrackCallback | null = null

// setup audio pro outside react native lifecycle
export function setupAudioPro(): void {
  // Configure audio settings
  AudioPro.configure({
    contentType: AudioProContentType.MUSIC,
    debug: true,
    debugIncludesProgress: false,
    progressIntervalMs: 1000,
  })

  // Set up event listeners that persist for the app's lifetime
  AudioPro.addEventListener((event: AudioProEvent) => {
    if (!getTrackStateCallback)
      return

    const trackState = getTrackStateCallback()

    switch (event.type) {
      case AudioProEventType.TRACK_ENDED:
        // Handle track ended based on play mode
        handleTrackEnded(trackState)
        break

      case AudioProEventType.REMOTE_NEXT:
        // Handle next button press from lock screen/notification
        handleNextTrack(trackState, true)
        break

      case AudioProEventType.REMOTE_PREV:
        // Handle previous button press from lock screen/notification
        handlePreviousTrack(trackState, true)
        break

      case AudioProEventType.PLAYBACK_ERROR:
        console.warn('Playback error:', event.payload?.error)
        break
    }
  })
}

function handleTrackEnded(trackState: ReturnType<TrackCallback>): void {
  const { mode, playList, currentTrackId } = trackState

  if (playList.length === 0)
    return

  const currentIndex = playList.findIndex(track => track.id === currentTrackId)

  switch (mode) {
    case PlayMode.SINGLE:
      // Single mode: re-play the current track
      if (currentIndex >= 0) {
        const currentTrack = playList[currentIndex]
        AudioPro.play(currentTrack, { autoPlay: true })
      }
      break

    case PlayMode.ORDERED:
      // Loop mode: play the next track, if at the end, go back to the first track
      handleNextTrack(trackState, false)
      break

    case PlayMode.SHUFFLE:
      // Shuffle mode: play the next track (already in random order)
      handleNextTrack(trackState, false)
      break
  }
}

function handleNextTrack(trackState: ReturnType<TrackCallback>, userControl: boolean = false): void {
  const { playList, next } = trackState

  if (playList.length === 0)
    return

  // Use playerStore's next method to handle play mode logic
  next(userControl)

  // Get the updated state and play the new track
  const updatedState = getTrackStateCallback?.()
  if (updatedState && updatedState.currentTrackId) {
    const newCurrentTrack = updatedState.playList.find(track => track.id === updatedState.currentTrackId)
    if (newCurrentTrack) {
      AudioPro.play(newCurrentTrack, { autoPlay: true })
    }
  }
}

function handlePreviousTrack(trackState: ReturnType<TrackCallback>, _userControl: boolean = false): void {
  const { playList, prev } = trackState

  if (playList.length === 0)
    return

  // Use playerStore's prev method
  prev()

  // Get the updated state and play the new track
  const updatedState = getTrackStateCallback?.()
  if (updatedState && updatedState.currentTrackId) {
    const newCurrentTrack = updatedState.playList.find(track => track.id === updatedState.currentTrackId)
    if (newCurrentTrack) {
      AudioPro.play(newCurrentTrack, { autoPlay: true })
    }
  }
}

// setup audio pro inside react native lifecycle
export function useSetupAudioPro(): void {
  const { queue, currentIndex, mode, next, prev } = usePlayerStore()

  // Update the callback function to keep the audio pro state in sync with the player store
  useEffect(() => {
    getTrackStateCallback = () => ({
      currentTrackId: queue[currentIndex]?.id ?? null,
      playList: queue.map((track) => {
        if (!track)
          return null
        return {
          ...track,
        }
      }).filter(track => track !== null) as AudioProTrack[],
      mode,
      next,
      prev,
    })
  }, [queue, currentIndex, mode, next, prev])
}

export function getProgressInterval(): number {
  return AudioPro.getProgressInterval()!
}

export function setProgressInterval(ms: number): void {
  AudioPro.setProgressInterval(ms)
}
