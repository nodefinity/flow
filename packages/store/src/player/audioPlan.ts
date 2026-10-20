import type { Programme, Segment, Track } from '@flow/shared'
import { PlaybackMode, PlayMode } from './playerStore'

export interface AudioPlanSnapshot {
  playbackMode: PlaybackMode
  queue: Track[]
  currentIndex: number
  mode: PlayMode
  programme: Programme
  nowPlayingSegmentIndex: number
}

export interface AudioPlanMetadata {
  title?: string
  artist?: string
  albumTitle?: string
  artworkUrl?: string
}

export interface AudioPlanSource {
  key: string
  uri: string
  metadata: AudioPlanMetadata
}

export interface LayeredAudioPlan {
  music: AudioPlanSource | null
  voice: AudioPlanSource | null
}

export enum PlaybackFinishAction {
  NONE = 'none',
  ADVANCE_CLASSIC_TRACK = 'advance-classic-track',
  ADVANCE_RADIO_SEGMENT = 'advance-radio-segment',
  REPEAT_CLASSIC_TRACK = 'repeat-classic-track',
}

const LOCK_SCREEN_ARTWORK_URL_PATTERN = /^(?:file|https?):\/\//i

function toLockScreenArtworkUrl(artwork: string): string | undefined {
  const normalizedArtwork = artwork.trim()
  return LOCK_SCREEN_ARTWORK_URL_PATTERN.test(normalizedArtwork)
    ? normalizedArtwork
    : undefined
}

function metadataFromTrack(track: Track): AudioPlanMetadata {
  return {
    title: track.title,
    artist: track.artist,
    albumTitle: track.album,
    artworkUrl: toLockScreenArtworkUrl(track.artwork),
  }
}

function metadataFromSegment(segment: Segment, index: number): AudioPlanMetadata {
  if (segment.kind === 'track')
    return metadataFromTrack(segment.track)

  return {
    title: `Interlude ${index + 1}`,
    artist: 'Flow Radio',
    albumTitle: 'Flow',
  }
}

function getClassicTrackSource(track: Track, index: number): AudioPlanSource | null {
  if (!track.url)
    return null

  return {
    key: `classic:${index}:${track.id}:${track.url}`,
    uri: track.url,
    metadata: metadataFromTrack(track),
  }
}

function getRadioSegmentSource(segment: Segment, index: number): AudioPlanSource | null {
  const uri = segment.kind === 'track' ? segment.track.url : segment.audioUrl
  if (!uri)
    return null

  return {
    key: `radio:${index}:${uri}`,
    uri,
    metadata: metadataFromSegment(segment, index),
  }
}

export function getActiveAudioSource(snapshot: AudioPlanSnapshot): AudioPlanSource | null {
  if (snapshot.playbackMode === PlaybackMode.RADIO) {
    const segment = snapshot.programme[snapshot.nowPlayingSegmentIndex]
    if (!segment)
      return null

    return getRadioSegmentSource(segment, snapshot.nowPlayingSegmentIndex)
  }

  const track = snapshot.queue[snapshot.currentIndex]
  if (!track)
    return null

  return getClassicTrackSource(track, snapshot.currentIndex)
}

export function getNextAudioSource(snapshot: AudioPlanSnapshot): AudioPlanSource | null {
  if (snapshot.playbackMode === PlaybackMode.RADIO) {
    const nextIndex = snapshot.nowPlayingSegmentIndex + 1
    const segment = snapshot.programme[nextIndex]
    if (!segment)
      return null

    return getRadioSegmentSource(segment, nextIndex)
  }

  if (snapshot.queue.length <= 1)
    return null

  if (snapshot.mode === PlayMode.SINGLE)
    return null

  const nextIndex = snapshot.currentIndex + 1 >= snapshot.queue.length ? 0 : snapshot.currentIndex + 1
  const track = snapshot.queue[nextIndex]
  if (!track)
    return null

  return getClassicTrackSource(track, nextIndex)
}

export function getLayeredAudioPlan(snapshot: AudioPlanSnapshot): LayeredAudioPlan {
  const activeSource = getActiveAudioSource(snapshot)

  if (snapshot.playbackMode !== PlaybackMode.RADIO)
    return { music: activeSource, voice: null }

  const activeSegment = snapshot.programme[snapshot.nowPlayingSegmentIndex]
  if (activeSegment?.kind !== 'interlude')
    return { music: activeSource, voice: null }

  const nextIndex = snapshot.nowPlayingSegmentIndex + 1
  const nextSegment = snapshot.programme[nextIndex]
  const music = nextSegment?.kind === 'track'
    ? getRadioSegmentSource(nextSegment, nextIndex)
    : null

  return { music, voice: activeSource }
}

export function getPlaybackFinishAction(snapshot: AudioPlanSnapshot): PlaybackFinishAction {
  if (snapshot.playbackMode === PlaybackMode.RADIO) {
    return snapshot.programme[snapshot.nowPlayingSegmentIndex]
      ? PlaybackFinishAction.ADVANCE_RADIO_SEGMENT
      : PlaybackFinishAction.NONE
  }

  const currentTrack = snapshot.queue[snapshot.currentIndex]
  if (!currentTrack?.url)
    return PlaybackFinishAction.NONE

  if (snapshot.mode === PlayMode.SINGLE || snapshot.queue.length === 1)
    return PlaybackFinishAction.REPEAT_CLASSIC_TRACK

  return PlaybackFinishAction.ADVANCE_CLASSIC_TRACK
}
