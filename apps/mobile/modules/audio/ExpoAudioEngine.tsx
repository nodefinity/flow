import type { AudioPlanSource } from '@flow/store'
import type { AudioPlayer, AudioSource } from 'expo-audio'
import {
  getLayeredAudioPlan,
  getNextAudioSource,
  getPlaybackFinishAction,
  PlaybackFinishAction,
  PlaybackMode,
  usePlaybackStore,
  usePlayerStore,
} from '@flow/store'
import { createAudioPlayer, preload, requestNotificationPermissionsAsync, setAudioModeAsync } from 'expo-audio'
import { useEffect } from 'react'
import { Platform } from 'react-native'

const PLAYER_OPTIONS = {
  updateInterval: 500,
  keepAudioSessionActive: true,
  preferredForwardBufferDuration: 15,
}

const DUCKED_MUSIC_VOLUME = 0.24

function toExpoSource(source: AudioPlanSource): AudioSource {
  return { uri: source.uri }
}

function configureAudioSession() {
  setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  }).catch((error) => {
    console.error('Failed to configure expo-audio session:', error)
  })

  if (Platform.OS === 'android') {
    requestNotificationPermissionsAsync().catch((error) => {
      console.error('Failed to request audio notification permission:', error)
    })
  }
}

export function ExpoAudioEngine() {
  useEffect(() => {
    configureAudioSession()

    const musicPlayer = createAudioPlayer(null, PLAYER_OPTIONS)
    const voicePlayer = createAudioPlayer(null, PLAYER_OPTIONS)
    let musicSourceKey: string | null = null
    let voiceSourceKey: string | null = null
    let preloadedSourceKey: string | null = null
    let preloadingSourceKey: string | null = null
    let musicFinishedDuringVoiceKey: string | null = null
    let musicWasPlaying = false
    let suppressNextPositionSeek = false
    let isHandlingMusicFinish = false
    let isHandlingVoiceFinish = false
    let disposed = false

    function syncPlaybackState() {
      if (disposed)
        return

      const playerState = usePlayerStore.getState()
      const playbackState = usePlaybackStore.getState()
      const layers = getLayeredAudioPlan(playerState)

      musicPlayer.volume = playbackState.volume * (layers.voice ? DUCKED_MUSIC_VOLUME : 1)
      voicePlayer.volume = playbackState.volume
      musicPlayer.setPlaybackRate(playbackState.playbackRate, 'medium')
      voicePlayer.setPlaybackRate(playbackState.playbackRate, 'medium')

      if (!layers.music) {
        musicSourceKey = null
        musicFinishedDuringVoiceKey = null
        musicWasPlaying = false
        musicPlayer.pause()
        musicPlayer.clearLockScreenControls()
      }
      else if (layers.music.key !== musicSourceKey) {
        musicSourceKey = layers.music.key
        musicFinishedDuringVoiceKey = null
        musicWasPlaying = false
        musicPlayer.replace(toExpoSource(layers.music))
        musicPlayer.setActiveForLockScreen(true, layers.music.metadata, {
          showSeekBackward: true,
          showSeekForward: true,
        })
        suppressNextPositionSeek = true
        usePlaybackStore.getState().setPosition(0)
        queueMicrotask(() => {
          suppressNextPositionSeek = false
        })
      }
      else {
        musicPlayer.updateLockScreenMetadata(layers.music.metadata)
      }

      if (!layers.voice) {
        voiceSourceKey = null
        voicePlayer.pause()
      }
      else if (layers.voice.key !== voiceSourceKey) {
        voiceSourceKey = layers.voice.key
        voicePlayer.replace(toExpoSource(layers.voice))
      }

      if (playerState.isPlaying) {
        if (layers.music)
          musicPlayer.play()
        if (layers.voice)
          voicePlayer.play()
      }
      else {
        musicPlayer.pause()
        voicePlayer.pause()
      }

      if (!layers.music && !layers.voice && playerState.isPlaying)
        usePlayerStore.setState({ isPlaying: false })

      const nextSource = getNextAudioSource(playerState)
      if (
        nextSource
        && nextSource.key !== musicSourceKey
        && nextSource.key !== voiceSourceKey
        && nextSource.key !== preloadedSourceKey
        && nextSource.key !== preloadingSourceKey
      ) {
        preloadingSourceKey = nextSource.key
        preload(toExpoSource(nextSource), { preferredForwardBufferDuration: 20 })
          .then(() => {
            if (!disposed && preloadingSourceKey === nextSource.key)
              preloadedSourceKey = nextSource.key
          })
          .catch((error) => {
            console.error('Failed to preload next audio source:', error)
          })
          .finally(() => {
            if (preloadingSourceKey === nextSource.key)
              preloadingSourceKey = null
          })
      }
    }

    function handlePlaybackFinished(player: AudioPlayer) {
      const state = usePlayerStore.getState()
      const action = getPlaybackFinishAction(state)

      if (action === PlaybackFinishAction.ADVANCE_RADIO_SEGMENT) {
        state.nextSegment()
        return
      }

      if (action === PlaybackFinishAction.REPEAT_CLASSIC_TRACK) {
        return player.seekTo(0).then(() => {
          if (usePlayerStore.getState().isPlaying)
            player.play()
        }).catch((error) => {
          console.error('Failed to repeat current track:', error)
        })
      }

      if (action === PlaybackFinishAction.ADVANCE_CLASSIC_TRACK) {
        state.next(false)
        return
      }

      usePlayerStore.setState({ isPlaying: false })
    }

    function handleMusicFinished() {
      const state = usePlayerStore.getState()
      const activeSegment = state.playbackMode === PlaybackMode.RADIO
        ? state.programme[state.nowPlayingSegmentIndex]
        : undefined

      if (activeSegment?.kind === 'interlude') {
        musicFinishedDuringVoiceKey = musicSourceKey
        return
      }

      return handlePlaybackFinished(musicPlayer)
    }

    function handleVoiceFinished() {
      const state = usePlayerStore.getState()
      if (state.playbackMode !== PlaybackMode.RADIO)
        return

      const finishedIndex = state.nowPlayingSegmentIndex
      const finishedSegment = state.programme[finishedIndex]
      if (finishedSegment?.kind !== 'interlude')
        return

      const programme = state.programme
      const nextIndex = finishedIndex + 1
      const nextSegment = programme[nextIndex]
      const shouldSkipFinishedMusic = Boolean(
        nextSegment?.kind === 'track'
        && musicFinishedDuringVoiceKey
        && musicFinishedDuringVoiceKey === musicSourceKey,
      )

      state.nextSegment()

      if (shouldSkipFinishedMusic) {
        musicFinishedDuringVoiceKey = null
        queueMicrotask(() => {
          const nextState = usePlayerStore.getState()
          if (
            nextState.playbackMode === PlaybackMode.RADIO
            && nextState.programme === programme
            && nextState.nowPlayingSegmentIndex === nextIndex
            && nextState.programme[nextIndex] === nextSegment
          ) {
            nextState.nextSegment()
          }
        })
      }
    }

    const musicStatusSubscription = musicPlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        if (!isHandlingMusicFinish) {
          isHandlingMusicFinish = true
          Promise.resolve(handleMusicFinished()).finally(() => {
            queueMicrotask(() => {
              isHandlingMusicFinish = false
            })
          })
        }
        return
      }

      suppressNextPositionSeek = true
      usePlaybackStore.getState().setPosition(status.currentTime)
      queueMicrotask(() => {
        suppressNextPositionSeek = false
      })

      if (!status.isLoaded)
        return

      const storePlaying = usePlayerStore.getState().isPlaying
      if (status.playing) {
        musicWasPlaying = true
        if (!storePlaying)
          usePlayerStore.setState({ isPlaying: true })
      }
      // `replace()` emits a loaded-but-paused status before the queued `play()` runs.
      // Only treat a native pause as intentional after this source has actually played.
      else if (musicWasPlaying && !status.isBuffering) {
        musicWasPlaying = false
        if (storePlaying)
          usePlayerStore.setState({ isPlaying: false })
      }
    })

    const voiceStatusSubscription = voicePlayer.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish || isHandlingVoiceFinish)
        return

      isHandlingVoiceFinish = true
      Promise.resolve(handleVoiceFinished()).finally(() => {
        queueMicrotask(() => {
          isHandlingVoiceFinish = false
        })
      })
    })

    const playerSubscription = usePlayerStore.subscribe(syncPlaybackState)
    const playbackSubscription = usePlaybackStore.subscribe((state, previousState) => {
      const layers = getLayeredAudioPlan(usePlayerStore.getState())
      musicPlayer.volume = state.volume * (layers.voice ? DUCKED_MUSIC_VOLUME : 1)
      voicePlayer.volume = state.volume
      musicPlayer.setPlaybackRate(state.playbackRate, 'medium')
      voicePlayer.setPlaybackRate(state.playbackRate, 'medium')

      if (!suppressNextPositionSeek && state.position !== previousState.position) {
        musicPlayer.seekTo(state.position).catch((error) => {
          console.error('Failed to seek music player:', error)
        })
      }
    })

    syncPlaybackState()

    return () => {
      disposed = true
      playerSubscription()
      playbackSubscription()
      musicStatusSubscription.remove()
      voiceStatusSubscription.remove()
      musicPlayer.clearLockScreenControls()
      musicPlayer.remove()
      voicePlayer.remove()
    }
  }, [])

  return null
}
