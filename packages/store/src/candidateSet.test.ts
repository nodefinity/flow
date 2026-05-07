import type { TrackMetadata } from '@flow/shared'
import { describe, expect, it } from 'vitest'
import { queryCandidateSet } from './candidateSet'

function makeTrack(overrides: Partial<TrackMetadata> = {}): TrackMetadata {
  return {
    id: 'track-1',
    source: 'local',
    title: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    artwork: '',
    url: 'file:///music/test.mp3',
    duration: 180,
    createdAt: 0,
    modifiedAt: 0,
    fileSize: 0,
    bitrate: 320,
    sampleRate: 44100,
    channels: 2,
    format: 'mp3',
    year: 2024,
    genre: 'Rock',
    track: 1,
    disc: 1,
    composer: '',
    lyricist: '',
    lyrics: '',
    albumArtist: '',
    comment: '',
    ...overrides,
  }
}

const fixtures: TrackMetadata[] = [
  makeTrack({ id: '1', genre: 'Rock', comment: '', url: 'file:///1.mp3' }),
  makeTrack({ id: '2', genre: 'Electronic', comment: 'energetic', url: 'file:///2.mp3' }),
  makeTrack({ id: '3', genre: 'Jazz', comment: 'mellow vibes', url: 'file:///3.mp3' }),
  makeTrack({ id: '4', genre: 'Hip-Hop', comment: 'chill mood', url: 'file:///4.mp3' }),
  makeTrack({ id: '5', genre: 'Pop', comment: '', url: '' }), // no URL
  makeTrack({ id: '6', source: 'remote', genre: 'Rock', comment: '', url: 'https://remote/6.mp3' }), // remote
  makeTrack({ id: '7', genre: 'Rock', comment: 'upbeat rock vibes', url: 'file:///7.mp3' }),
]

describe('queryCandidateSet', () => {
  it('returns all local tracks with URLs when style is empty', () => {
    const result = queryCandidateSet(fixtures, {})
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['1', '2', '3', '4', '7'])
    // no track-5 (no URL) and no track-6 (remote)
  })

  it('filters by genreHints (case-insensitive substring match)', () => {
    const result = queryCandidateSet(fixtures, { genreHints: ['rock'] })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['1', '7'])
  })

  it('returns multiple genres when multiple hints are given', () => {
    const result = queryCandidateSet(fixtures, { genreHints: ['Jazz', 'Electronic'] })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['2', '3'])
  })

  it('matches mood tags against the comment field', () => {
    const result = queryCandidateSet(fixtures, { moodTags: ['mellow'] })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['3'])
  })

  it('matches mood tags against the genre field', () => {
    const result = queryCandidateSet(fixtures, { moodTags: ['hip'] })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['4'])
  })

  it('mood tag matching is case-insensitive', () => {
    const result = queryCandidateSet(fixtures, { moodTags: ['CHILL'] })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['4'])
  })

  it('always excludes tracks with no URL', () => {
    const result = queryCandidateSet(fixtures, {})
    expect(result.every(t => t.url !== '')).toBe(true)
  })

  it('excludes remote tracks even when source is remote', () => {
    const result = queryCandidateSet(fixtures, {})
    expect(result.every(t => t.source === 'local')).toBe(true)
  })

  it('returns empty array when no tracks match the genre hint', () => {
    const result = queryCandidateSet(fixtures, { genreHints: ['Classical'] })
    expect(result).toEqual([])
  })

  it('returns empty array when no tracks match the mood tag', () => {
    const result = queryCandidateSet(fixtures, { moodTags: ['aggressive'] })
    expect(result).toEqual([])
  })

  it('applies both genreHints and moodTags when both are set', () => {
    // track 7: genre=Rock, comment='upbeat rock vibes' — matches Rock genre AND 'vibes' mood
    const result = queryCandidateSet(fixtures, {
      genreHints: ['Rock'],
      moodTags: ['vibes'],
    })
    const ids = result.map(t => t.id)
    expect(ids).toEqual(['7'])
  })

  it('returns empty array when given an empty track list', () => {
    const result = queryCandidateSet([], {})
    expect(result).toEqual([])
  })
})
