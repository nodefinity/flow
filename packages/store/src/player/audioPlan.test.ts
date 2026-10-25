import type { Programme, Track } from '@flow/shared'
import type { AudioPlanSnapshot } from './audioPlan'
import { describe, expect, it } from 'vitest'
import { getActiveAudioSource, getLayeredAudioPlan, getNextAudioSource, getPlaybackFinishAction, PlaybackFinishAction } from './audioPlan'
import { PlaybackMode, PlayMode } from './playerStore'

const trackA = createTrack('track-a')
const trackB = createTrack('track-b')
const trackWithoutUrl = createTrack('track-without-url', '')

const programme: Programme = [
  { kind: 'interlude', script: 'Opening', audioUrl: 'https://example.com/opening.mp3' },
  { kind: 'track', track: trackA },
  { kind: 'track', track: trackB },
]

function createTrack(id: string, url = `file:///${id}.mp3`): Track {
  return {
    id,
    source: 'local',
    title: id,
    artist: 'Artist',
    album: 'Album',
    artwork: '',
    url,
    duration: 180,
    createdAt: 1,
    modifiedAt: 1,
    fileSize: 100,
  }
}

function createSnapshot(overrides: Partial<AudioPlanSnapshot> = {}): AudioPlanSnapshot {
  return {
    playbackMode: PlaybackMode.CLASSIC,
    queue: [trackA, trackB],
    currentIndex: 0,
    mode: PlayMode.ORDERED,
    programme: [],
    nowPlayingSegmentIndex: 0,
    ...overrides,
  }
}

describe('audio plan', () => {
  it('selects the active classic track source', () => {
    const source = getActiveAudioSource(createSnapshot({ currentIndex: 1 }))

    expect(source).toEqual({
      key: 'classic:1:track-b:file:///track-b.mp3',
      uri: 'file:///track-b.mp3',
      metadata: {
        title: 'track-b',
        artist: 'Artist',
        albumTitle: 'Album',
        artworkUrl: undefined,
      },
    })
  })

  it('selects the active radio interlude source', () => {
    const source = getActiveAudioSource(createSnapshot({
      playbackMode: PlaybackMode.RADIO,
      programme,
      nowPlayingSegmentIndex: 0,
    }))

    expect(source).toEqual({
      key: 'radio:0:https://example.com/opening.mp3',
      uri: 'https://example.com/opening.mp3',
      metadata: {
        title: 'Interlude 1',
        artist: 'Flow Radio',
        albumTitle: 'Flow',
      },
    })
  })

  it('omits content artwork that expo-audio cannot cast to a lock-screen URL', () => {
    const source = getActiveAudioSource(createSnapshot({
      queue: [{ ...trackA, artwork: 'content://media/external/audio/albumart/1' }],
    }))

    expect(source?.metadata.artworkUrl).toBeUndefined()
    expect(source?.uri).toBe(trackA.url)
  })

  it('keeps supported lock-screen artwork URLs', () => {
    const source = getActiveAudioSource(createSnapshot({
      queue: [{ ...trackA, artwork: 'file:///data/user/0/com.nodefinity.flow/cache/cover.jpg' }],
    }))

    expect(source?.metadata.artworkUrl)
      .toBe('file:///data/user/0/com.nodefinity.flow/cache/cover.jpg')
  })

  it('preloads the next classic track and wraps at the queue end', () => {
    expect(getNextAudioSource(createSnapshot({ currentIndex: 0 }))?.key)
      .toBe('classic:1:track-b:file:///track-b.mp3')

    expect(getNextAudioSource(createSnapshot({ currentIndex: 1 }))?.key)
      .toBe('classic:0:track-a:file:///track-a.mp3')
  })

  it('does not preload a classic source when repeat handling owns the next playback', () => {
    expect(getNextAudioSource(createSnapshot({ mode: PlayMode.SINGLE }))).toBeNull()
    expect(getNextAudioSource(createSnapshot({ queue: [trackA] }))).toBeNull()
  })

  it('preloads the next radio segment', () => {
    const source = getNextAudioSource(createSnapshot({
      playbackMode: PlaybackMode.RADIO,
      programme,
      nowPlayingSegmentIndex: 0,
    }))

    expect(source?.key).toBe('radio:1:file:///track-a.mp3')
  })

  it('layers the next Track under an active Radio Interlude', () => {
    const plan = getLayeredAudioPlan(createSnapshot({
      playbackMode: PlaybackMode.RADIO,
      programme,
      nowPlayingSegmentIndex: 0,
    }))

    expect(plan.voice?.key).toBe('radio:0:https://example.com/opening.mp3')
    expect(plan.music?.key).toBe('radio:1:file:///track-a.mp3')
  })

  it('uses only the music layer for Track and Classic playback', () => {
    const radioPlan = getLayeredAudioPlan(createSnapshot({
      playbackMode: PlaybackMode.RADIO,
      programme,
      nowPlayingSegmentIndex: 1,
    }))
    const classicPlan = getLayeredAudioPlan(createSnapshot())

    expect(radioPlan.voice).toBeNull()
    expect(radioPlan.music?.key).toBe('radio:1:file:///track-a.mp3')
    expect(classicPlan.voice).toBeNull()
    expect(classicPlan.music?.key).toBe('classic:0:track-a:file:///track-a.mp3')
  })

  it('chooses finish actions for classic and radio playback', () => {
    expect(getPlaybackFinishAction(createSnapshot({
      playbackMode: PlaybackMode.RADIO,
      programme,
    }))).toBe(PlaybackFinishAction.ADVANCE_RADIO_SEGMENT)

    expect(getPlaybackFinishAction(createSnapshot()))
      .toBe(PlaybackFinishAction.ADVANCE_CLASSIC_TRACK)

    expect(getPlaybackFinishAction(createSnapshot({ mode: PlayMode.SINGLE })))
      .toBe(PlaybackFinishAction.REPEAT_CLASSIC_TRACK)

    expect(getPlaybackFinishAction(createSnapshot({ queue: [trackA] })))
      .toBe(PlaybackFinishAction.REPEAT_CLASSIC_TRACK)
  })

  it('returns no source and no finish action when there is no playable URI', () => {
    const snapshot = createSnapshot({ queue: [trackWithoutUrl] })

    expect(getActiveAudioSource(snapshot)).toBeNull()
    expect(getPlaybackFinishAction(snapshot)).toBe(PlaybackFinishAction.NONE)
  })
})
