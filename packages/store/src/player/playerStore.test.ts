import type { Programme, Track } from '@flow/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { onSegmentEnd, onSegmentStart, PlaybackMode, PlayMode, usePlayerStore } from './playerStore'

const trackA: Track = {
  id: 'track-a',
  source: 'local',
  title: 'Track A',
  artist: 'Artist A',
  album: 'Album A',
  artwork: '',
  url: 'file:///track-a.mp3',
  duration: 180,
  createdAt: 1,
  modifiedAt: 1,
  fileSize: 100,
}

const trackB: Track = {
  ...trackA,
  id: 'track-b',
  title: 'Track B',
  url: 'file:///track-b.mp3',
}

const programme: Programme = [
  { kind: 'interlude', script: 'Opening', audioUrl: 'https://example.com/opening.mp3' },
  { kind: 'track', track: trackA },
  { kind: 'track', track: trackB },
]

function resetPlayerStore() {
  usePlayerStore.setState({
    playbackMode: PlaybackMode.CLASSIC,
    isPlaying: false,
    queue: [],
    originalQueue: [],
    currentIndex: 0,
    mode: PlayMode.ORDERED,
    programme: [],
    nowPlayingSegmentIndex: 0,
  })
}

async function flushMicrotasks() {
  await Promise.resolve()
}

describe('playerStore radio mode', () => {
  beforeEach(() => {
    resetPlayerStore()
  })

  it('loads a Programme and switches to Radio mode', async () => {
    const listener = vi.fn()
    const unsubscribe = onSegmentStart(listener)
    usePlayerStore.getState().playQueue([trackA, trackB], trackB)

    usePlayerStore.getState().loadProgramme(programme)
    await flushMicrotasks()

    const state = usePlayerStore.getState()
    expect(state.playbackMode).toBe(PlaybackMode.RADIO)
    expect(state.programme).toEqual(programme)
    expect(state.nowPlayingSegmentIndex).toBe(0)
    expect(state.isPlaying).toBe(true)
    expect(listener).toHaveBeenCalledWith(programme[0], 0)

    unsubscribe()
  })

  it('switches back to Classic mode when playing a track manually', () => {
    usePlayerStore.getState().loadProgramme(programme)

    usePlayerStore.getState().playTrack(trackA)

    const state = usePlayerStore.getState()
    expect(state.playbackMode).toBe(PlaybackMode.CLASSIC)
    expect(state.programme).toEqual([])
    expect(state.nowPlayingSegmentIndex).toBe(0)
    expect(state.queue).toEqual([trackA])
    expect(state.currentIndex).toBe(0)
    expect(state.isPlaying).toBe(true)
  })

  it('switches back to Classic mode when playing a queue', () => {
    usePlayerStore.getState().loadProgramme(programme)

    usePlayerStore.getState().playQueue([trackA, trackB], trackB)

    const state = usePlayerStore.getState()
    expect(state.playbackMode).toBe(PlaybackMode.CLASSIC)
    expect(state.programme).toEqual([])
    expect(state.queue).toEqual([trackA, trackB])
    expect(state.currentIndex).toBe(1)
    expect(state.isPlaying).toBe(true)
  })

  it('emits segment-end events as Radio mode advances', async () => {
    const endListener = vi.fn()
    const startListener = vi.fn()
    const unsubscribeEnd = onSegmentEnd(endListener)
    const unsubscribeStart = onSegmentStart(startListener)
    usePlayerStore.getState().loadProgramme(programme)
    await flushMicrotasks()

    usePlayerStore.getState().nextSegment()
    await flushMicrotasks()

    expect(usePlayerStore.getState().nowPlayingSegmentIndex).toBe(1)
    expect(endListener).toHaveBeenCalledWith(programme[0], 0)
    expect(startListener).toHaveBeenCalledWith(programme[0], 0)
    expect(startListener).toHaveBeenCalledWith(programme[1], 1)

    unsubscribeEnd()
    unsubscribeStart()
  })

  it('stops playback after the final Segment ends', async () => {
    const listener = vi.fn()
    const unsubscribe = onSegmentEnd(listener)
    usePlayerStore.getState().loadProgramme(programme)
    usePlayerStore.setState({ nowPlayingSegmentIndex: programme.length - 1 })

    usePlayerStore.getState().nextSegment()
    await flushMicrotasks()

    const state = usePlayerStore.getState()
    expect(state.nowPlayingSegmentIndex).toBe(programme.length - 1)
    expect(state.isPlaying).toBe(false)
    expect(listener).toHaveBeenCalledWith(programme[programme.length - 1], programme.length - 1)

    unsubscribe()
  })
})
