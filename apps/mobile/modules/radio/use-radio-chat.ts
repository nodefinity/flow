import type { TrackRow } from '@flow/database'
import type { Track } from '@flow/shared'
import type { MusicLibrary, MusicSearchContext, MusicToolSession } from '@flow/store'
import { getTrackById, sampleLocalTracks, searchLocalTracks } from '@flow/database'
import { createTextChatClient, createTextHost, PlaybackMode, TextChatError, TextChatErrorCode, useChatTimelineStore, usePlayerStore } from '@flow/store'
import { useFocusEffect } from 'expo-router'
import { fetch } from 'expo/fetch'
import { useCallback, useRef, useState } from 'react'
import { getDeepSeekApiKey } from './radioCredentials'

interface PendingTurn {
  text: string
  appended: boolean
  musicSession?: MusicToolSession
}

function toTrack(row: TrackRow): Track {
  return { ...row, artwork: row.artwork ?? '' }
}

const musicLibrary: MusicLibrary = {
  search: async query => (await (query.trim() ? searchLocalTracks(query) : sampleLocalTracks())).map(toTrack),
  getTrack: async (id) => {
    const row = await getTrackById(id)
    return row ? toTrack(row) : null
  },
}

// Give React Native a paint between streaming the introduction and changing
// playback. Abort also releases this wait when the screen closes or times out.
function waitForTextPaint(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let frame: number
    const cancel = () => {
      cancelAnimationFrame(frame)
      signal.removeEventListener('abort', cancel)
      reject(new TextChatError(TextChatErrorCode.CANCELLED))
    }
    if (signal.aborted) {
      reject(new TextChatError(TextChatErrorCode.CANCELLED))
      return
    }
    signal.addEventListener('abort', cancel)
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        signal.removeEventListener('abort', cancel)
        resolve()
      })
    })
  })
}

export function useRadioChat(language: string) {
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorCode, setErrorCode] = useState<TextChatErrorCode | null>(null)
  const [streamingReply, setStreamingReply] = useState('')
  const streamOwner = useRef<AbortSignal | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const pendingTurn = useRef<PendingTurn | null>(null)
  const searchContext = useRef<MusicSearchContext>({ tracks: [] })
  const textHost = useRef<ReturnType<typeof createTextHost> | null>(null)
  const openingSession = useRef<MusicToolSession>({ actions: [] })
  const clearStreaming = useCallback((signal: AbortSignal) => {
    if (streamOwner.current === signal) {
      streamOwner.current = null
      setStreamingReply('')
    }
  }, [])

  const run = useCallback(async (turn: PendingTurn) => {
    if (activeRequest.current)
      return

    const controller = new AbortController()
    activeRequest.current = controller
    pendingTurn.current = turn
    textHost.current?.beginUserTurn()
    streamOwner.current = controller.signal
    setStreamingReply('')
    turn.musicSession ??= { actions: [] }
    setIsSending(true)
    setErrorCode(null)
    let streamedText = ''

    try {
      let apiKey: string | null
      try {
        apiKey = await getDeepSeekApiKey()
      }
      catch {
        throw new TextChatError(TextChatErrorCode.STORAGE)
      }
      if (activeRequest.current !== controller)
        return
      if (!apiKey?.trim())
        throw new TextChatError(TextChatErrorCode.MISSING_TOKEN)

      if (!turn.appended) {
        useChatTimelineStore.getState().appendMessage({ type: 'user-turn', text: turn.text, timestamp: Date.now() })
        turn.appended = true
      }

      const player = usePlayerStore.getState()
      const nowPlaying = player.playbackMode === PlaybackMode.RADIO
        ? player.programme.slice(player.nowPlayingSegmentIndex).find(segment => segment.kind === 'track')?.track
        : player.queue[player.currentIndex]
      const reply = await createTextChatClient({ apiKey, fetch }).reply({
        messages: useChatTimelineStore.getState().messages,
        nowPlaying,
        isPlaying: player.isPlaying,
        language,
        signal: controller.signal,
        onText(text) {
          if (activeRequest.current === controller && !controller.signal.aborted) {
            streamedText = text
            setStreamingReply(text)
          }
        },
        beforeTool: waitForTextPaint,
        music: {
          library: musicLibrary,
          context: searchContext.current,
          session: turn.musicSession,
        },
      })
      if (activeRequest.current !== controller)
        return

      useChatTimelineStore.getState().appendMessage({ type: 'host-turn', text: reply, timestamp: Date.now() })
      setInputText(value => value.trim() === turn.text ? '' : value)
      pendingTurn.current = null
    }
    catch (error) {
      if (activeRequest.current === controller && !controller.signal.aborted) {
        // Keep already-visible prose if a later provider/tool round fails.
        if (streamedText.trim())
          useChatTimelineStore.getState().appendMessage({ type: 'host-turn', text: streamedText.trim(), timestamp: Date.now() })
        setErrorCode(turn.musicSession.actions.length > 0
          ? TextChatErrorCode.REPLY_AFTER_ACTION
          : error instanceof TextChatError ? error.code : TextChatErrorCode.NETWORK)
      }
    }
    finally {
      clearStreaming(controller.signal)
      if (activeRequest.current === controller) {
        activeRequest.current = null
        setIsSending(false)
        textHost.current?.endUserTurn(turn.musicSession.actions)
      }
    }
  }, [language, clearStreaming])

  useFocusEffect(useCallback(() => {
    const host = createTextHost({
      openingSession: openingSession.current,
      async reply(hostEvent, nowPlaying, signal, session) {
        streamOwner.current = signal
        setStreamingReply('')
        let streamedText = ''
        try {
          let apiKey: string | null
          try {
            apiKey = await getDeepSeekApiKey()
          }
          catch {
            throw new TextChatError(TextChatErrorCode.STORAGE)
          }
          if (!apiKey?.trim())
            throw new TextChatError(TextChatErrorCode.MISSING_TOKEN)
          const reply = await createTextChatClient({ apiKey, fetch }).reply({
            messages: useChatTimelineStore.getState().messages,
            nowPlaying,
            isPlaying: usePlayerStore.getState().isPlaying,
            language,
            signal,
            hostEvent,
            music: hostEvent.type === 'opening'
              ? { library: musicLibrary, context: searchContext.current, session }
              : undefined,
            beforeTool: waitForTextPaint,
            onText(text) {
              if (streamOwner.current === signal && !signal.aborted) {
                streamedText = text
                setStreamingReply(text)
              }
            },
          })
          if (!signal.aborted && hostEvent.type === 'opening')
            setErrorCode(null)
          return reply
        }
        catch (error) {
          if (!signal.aborted && hostEvent.type === 'opening' && session.actions.length > 0 && streamedText.trim())
            useChatTimelineStore.getState().appendMessage({ type: 'host-turn', text: streamedText.trim(), timestamp: Date.now() })
          throw error
        }
        finally {
          clearStreaming(signal)
        }
      },
      onOpeningError(error) {
        setErrorCode(openingSession.current.actions.length > 0
          ? TextChatErrorCode.REPLY_AFTER_ACTION
          : error instanceof TextChatError ? error.code : TextChatErrorCode.NETWORK)
      },
    })
    textHost.current = host
    if (pendingTurn.current) {
      host.beginUserTurn()
      setErrorCode(TextChatErrorCode.CANCELLED)
    }
    else {
      setErrorCode(null)
    }

    return () => {
      host.dispose()
      textHost.current = null
      const controller = activeRequest.current
      activeRequest.current = null
      controller?.abort()
      if (streamOwner.current)
        clearStreaming(streamOwner.current)
      setIsSending(false)
    }
  }, [language, clearStreaming]))

  const submit = useCallback(() => {
    const text = inputText.trim()
    if (!text || activeRequest.current)
      return

    const previousTurn = pendingTurn.current
    void run(previousTurn?.text === text ? previousTurn : { text, appended: false })
  }, [inputText, run])

  const retry = useCallback(() => {
    if (pendingTurn.current) {
      void run(pendingTurn.current)
    }
    else {
      setErrorCode(null)
      textHost.current?.retry()
    }
  }, [run])

  return { inputText, setInputText, isSending, errorCode, streamingReply, submit, retry }
}
