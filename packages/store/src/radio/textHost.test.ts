import type { Track } from '@flow/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatTimelineStore } from '../chatTimelineStore'
import { PlaybackMode, PlayMode, usePlayerStore } from '../player/playerStore'
import { createMusicTools, MusicAction } from './musicTools'
import { createTextHost } from './textHost'

const trackA: Track = { id: 'a', title: 'Song A', artist: 'Artist', album: 'Album', source: 'local', url: 'file:///a.mp3', artwork: '', duration: 180, createdAt: 1, modifiedAt: 1, fileSize: 100 }
const trackB: Track = { ...trackA, id: 'b', title: 'Song B', url: 'file:///b.mp3' }
const trackC: Track = { ...trackA, id: 'c', title: 'Song C', url: 'file:///c.mp3' }

describe('text host playback lifecycle', () => {
  let host: ReturnType<typeof createTextHost> | undefined
  const reply = vi.fn<Parameters<typeof createTextHost>[0]['reply']>()
  const onOpeningError = vi.fn()

  function start(withConversation = true) {
    if (withConversation)
      useChatTimelineStore.getState().appendMessage({ type: 'host-turn', text: '欢迎。', timestamp: 1 })
    host = createTextHost({ reply, onOpeningError })
    return host
  }

  beforeEach(() => {
    vi.useFakeTimers()
    reply.mockReset().mockResolvedValue('一起听下一首。')
    onOpeningError.mockReset()
    useChatTimelineStore.getState().clearTimeline()
    usePlayerStore.setState({ playbackMode: PlaybackMode.CLASSIC, isPlaying: true, queue: [trackA, trackB, trackC], originalQueue: [trackA, trackB, trackC], currentIndex: 0, mode: PlayMode.ORDERED, programme: [], nowPlayingSegmentIndex: 0 })
  })

  afterEach(() => {
    host?.dispose()
    host = undefined
    vi.useRealTimers()
  })

  it('opens once with the first available song, without changing playback', async () => {
    usePlayerStore.setState({ queue: [] })
    start(false)
    usePlayerStore.getState().playQueue([trackA, trackB])
    const before = usePlayerStore.getState()
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledExactlyOnceWith({ type: 'opening' }, trackA, expect.any(AbortSignal), { actions: [] })
    expect(usePlayerStore.getState()).toBe(before)
    expect(useChatTimelineStore.getState().messages).toHaveLength(1)
    host!.dispose()
    host = createTextHost({ reply, onOpeningError })
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
  })

  it('can welcome listeners with an empty library', async () => {
    usePlayerStore.setState({ queue: [], isPlaying: false })
    start(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledWith({ type: 'opening' }, undefined, expect.any(AbortSignal), { actions: [] })
  })

  it('signals readiness only after the opening is visible, so music can start afterwards', async () => {
    let finish!: (value: string) => void
    reply.mockImplementationOnce(() => new Promise(resolve => finish = resolve))
    usePlayerStore.getState().pause()
    const onOpeningReady = vi.fn(() => {
      expect(useChatTimelineStore.getState().messages).toContainEqual(expect.objectContaining({ type: 'host-turn', text: '欢迎，一起听音乐。' }))
      usePlayerStore.getState().play()
    })
    host = createTextHost({ reply, onOpeningError, onOpeningReady })
    await vi.advanceTimersByTimeAsync(800)
    expect(onOpeningReady).not.toHaveBeenCalled()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    finish('欢迎，一起听音乐。')
    await vi.advanceTimersByTimeAsync(0)
    expect(onOpeningReady).toHaveBeenCalledOnce()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
  })

  it('coalesces fast skips to the latest song', async () => {
    start()
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(400)
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledExactlyOnceWith({ type: 'track-change', previousTrack: trackB }, trackC, expect.any(AbortSignal), { actions: [] })
    expect(useChatTimelineStore.getState().messages).toHaveLength(2)
  })

  it('keeps the opening alive through its own play tool and does not narrate the selection twice', async () => {
    usePlayerStore.setState({ queue: [], originalQueue: [], isPlaying: false })
    reply.mockImplementationOnce(async (_event, _track, signal, session) => {
      const music = createMusicTools({
        library: { search: async () => [trackB], getTrack: async () => trackB },
        context: { tracks: [] },
        session,
      }, signal)
      try {
        await music.tools.play.execute!({ trackId: 'b' }, { toolCallId: 'opening-play', messages: [], context: {} })
        await Promise.resolve()
        expect(signal.aborted).toBe(false)
        return '欢迎，一起听 Song B。'
      }
      finally {
        music.dispose()
      }
    })
    start(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(usePlayerStore.getState()).toMatchObject({ isPlaying: true, queue: [trackB] })
    expect(useChatTimelineStore.getState().messages).toEqual([expect.objectContaining({ type: 'host-turn', text: '欢迎，一起听 Song B。' })])
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
    expect(onOpeningError).not.toHaveBeenCalled()
  })

  it('does not undo a pause before the opening request has started', async () => {
    start(false)
    usePlayerStore.getState().pause()
    await vi.advanceTimersByTimeAsync(1600)
    expect(reply).not.toHaveBeenCalled()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('lets manual playback cancel an in-progress opening instead of automatically selecting again', async () => {
    usePlayerStore.getState().pause()
    let finish!: (value: string) => void
    reply.mockImplementationOnce(() => new Promise(resolve => finish = resolve))
    start(false)
    await vi.advanceTimersByTimeAsync(800)
    const signal = reply.mock.calls[0]![2]
    usePlayerStore.getState().playTrack(trackC)
    await vi.advanceTimersByTimeAsync(0)
    expect(signal.aborted).toBe(true)
    finish('过期的开场。')
    await vi.advanceTimersByTimeAsync(1600)
    expect(reply).toHaveBeenCalledOnce()
    expect(useChatTimelineStore.getState().messages).toEqual([])
    expect(usePlayerStore.getState()).toMatchObject({ currentIndex: 2, isPlaying: true })
  })

  it('retains opening action receipts across a failed final reply and a screen reopen', async () => {
    usePlayerStore.getState().pause()
    reply.mockImplementationOnce(async (_event, _track, signal, session) => {
      const music = createMusicTools({ library: { search: async () => [trackB], getTrack: async () => trackB }, context: { tracks: [] }, session }, signal)
      try {
        await music.tools.play.execute!({ trackId: 'b' }, { toolCallId: 'opening-play', messages: [], context: {} })
        throw new Error('offline')
      }
      finally {
        music.dispose()
      }
    })
    start(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(onOpeningError).toHaveBeenCalledOnce()
    const session = reply.mock.calls[0]![3]
    expect(session.actions).toHaveLength(1)
    host!.dispose()
    host = createTextHost({ reply, onOpeningError, openingSession: session })
    await vi.advanceTimersByTimeAsync(800)
    expect(reply.mock.calls[1]![3]).toBe(session)
    expect(session.actions).toHaveLength(1)
    expect(usePlayerStore.getState()).toMatchObject({ currentIndex: 1, isPlaying: true })
  })

  it('drops an old reply even if its provider ignores cancellation', async () => {
    let finish!: (value: string) => void
    reply.mockImplementationOnce(() => new Promise(resolve => finish = resolve))
    start()
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    const oldSignal = reply.mock.calls[0]![2]
    usePlayerStore.getState().next(true)
    expect(oldSignal.aborted).toBe(true)
    finish('过期的 Song B 旁白。')
    await vi.advanceTimersByTimeAsync(800)
    expect(useChatTimelineStore.getState().messages.map(message => message.type === 'host-turn' ? message.text : '')).toEqual(['欢迎。', '一起听下一首。'])
  })

  it('does not narrate pause/resume or queue edits, and waits for a paused selection to resume', async () => {
    start()
    usePlayerStore.getState().pause()
    usePlayerStore.getState().play()
    usePlayerStore.getState().addToQueue(trackA)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).not.toHaveBeenCalled()
    usePlayerStore.getState().pause()
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).not.toHaveBeenCalled()
    usePlayerStore.getState().play()
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
  })

  it('observes automatic radio advances without duplicating the interlude-to-track boundary', async () => {
    usePlayerStore.getState().loadProgramme([
      { kind: 'interlude', script: 'Opening', audioUrl: '' },
      { kind: 'track', track: trackA },
      { kind: 'track', track: trackB },
    ])
    start()
    usePlayerStore.getState().nextSegment()
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).not.toHaveBeenCalled()
    usePlayerStore.getState().nextSegment()
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledExactlyOnceWith({ type: 'track-change', previousTrack: trackA }, trackB, expect.any(AbortSignal), { actions: [] })
  })

  it('lets user messages interrupt hosting and avoids a duplicate after tool-driven skips', async () => {
    reply.mockImplementationOnce(() => new Promise(() => {}))
    const active = start(false)
    await vi.advanceTimersByTimeAsync(800)
    active.beginUserTurn()
    expect(reply.mock.calls[0]![2].aborted).toBe(true)
    useChatTimelineStore.getState().appendMessage({ type: 'user-turn', text: '下一首', timestamp: 2 })
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
    active.endUserTurn([{ action: MusicAction.NEXT, status: 'accepted', track: trackB, requestedPlaying: true }])
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
  })

  it('defers an unrelated automatic song transition until the user reply finishes', async () => {
    const active = start()
    active.beginUserTurn()
    usePlayerStore.getState().next(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).not.toHaveBeenCalled()
    active.endUserTurn([])
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
  })

  it('allows opening retry and keeps transition failures silent without stopping music', async () => {
    const error = new Error('offline')
    reply.mockRejectedValueOnce(error)
    const active = start(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(onOpeningError).toHaveBeenCalledExactlyOnceWith(error)
    active.retry()
    await vi.advanceTimersByTimeAsync(800)
    expect(useChatTimelineStore.getState().messages).toHaveLength(1)
    reply.mockRejectedValueOnce(error)
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(onOpeningError).toHaveBeenCalledOnce()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('cancels on leaving the screen and ignores late replies and later player changes', async () => {
    let finish!: (value: string) => void
    reply.mockImplementationOnce(() => new Promise(resolve => finish = resolve))
    const active = start(false)
    await vi.advanceTimersByTimeAsync(800)
    active.dispose()
    expect(reply.mock.calls[0]![2].aborted).toBe(true)
    finish('不该出现的旁白。')
    usePlayerStore.getState().next(true)
    await vi.advanceTimersByTimeAsync(800)
    expect(reply).toHaveBeenCalledOnce()
    expect(useChatTimelineStore.getState().messages).toEqual([])
  })
})
