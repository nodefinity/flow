import type { Channel, Programme, Track } from '@flow/shared'
import type { HostPlan, HostPlanner, ProgrammeGenerationRequest } from './contracts'
import type { InterludeAudioCache, TTSProvider } from './tts'
import { HostVoice } from '@flow/shared'
import { describe, expect, it, vi } from 'vitest'
import { ProgrammeGenerationReason } from './contracts'
import { createProgrammeHost, InvalidHostPlanError, validateHostPlan } from './hostService'

const channel: Channel = {
  id: 1,
  name: 'Flow Radio',
  descriptor: 'Local radio',
  style: { moodTags: ['focus'] },
  hostVoice: HostVoice.DEFAULT,
}

describe('programme host', () => {
  it('validates a plan, synthesizes interludes, and returns one complete Programme', async () => {
    const candidateTracks = createTracks(6)
    const planner: HostPlanner = {
      planProgramme: vi.fn(async () => createValidPlan(candidateTracks)),
    }
    const synthesize = vi.fn(async () => ({
      bytes: new Uint8Array([1, 2, 3]),
      mediaType: 'audio/mpeg',
    }))
    const materialize = vi.fn(async ({ cacheKey }) => `file:///cache/${cacheKey}.mp3`)
    const host = createProgrammeHost({
      planner,
      ttsProvider: { synthesize },
      audioCache: { materialize, remove: vi.fn(async () => {}) },
    })

    const programme = await host.generateProgramme(createRequest(candidateTracks))

    expect(programme.map(segment => segment.kind)).toEqual([
      'interlude',
      'track',
      'track',
      'track',
      'interlude',
      'track',
      'track',
      'track',
    ])
    expect(synthesize).toHaveBeenCalledTimes(2)
    expect(synthesize).toHaveBeenNthCalledWith(1, {
      script: '欢迎收听。',
      hostVoice: HostVoice.DEFAULT,
      signal: undefined,
    })
    expect(materialize).toHaveBeenCalledTimes(2)
    expect(programme[0]).toMatchObject({
      kind: 'interlude',
      audioUrl: 'file:///cache/1-0-0.mp3',
    })
  })

  it('retries an invalid model plan before accepting a valid one', async () => {
    const candidateTracks = createTracks(6)
    const planProgramme = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ kind: 'track', trackId: 'unknown' }] })
      .mockResolvedValueOnce(createValidPlan(candidateTracks))
    const host = createHost({ planProgramme })

    const programme = await host.generateProgramme(createRequest(candidateTracks))

    expect(planProgramme).toHaveBeenCalledTimes(2)
    expect(programme.filter(segment => segment.kind === 'track')).toHaveLength(6)
  })

  it('falls back to a deterministic music-only Programme after bounded planning failure', async () => {
    const candidateTracks = createTracks(10)
    const planProgramme = vi.fn(async () => {
      throw new Error('provider unavailable')
    })
    const synthesize = vi.fn<TTSProvider['synthesize']>()
    const host = createHost({ planProgramme }, synthesize)

    const programme = await host.generateProgramme(createRequest(candidateTracks))

    expect(planProgramme).toHaveBeenCalledTimes(2)
    expect(synthesize).not.toHaveBeenCalled()
    expect(trackIds(programme)).toEqual(candidateTracks.slice(0, 6).map(track => track.id))
  })

  it('omits only the failed interlude after bounded TTS failure', async () => {
    const candidateTracks = createTracks(6)
    const plan = createValidPlan(candidateTracks)
    const synthesize = vi.fn(async () => {
      if (synthesize.mock.calls.length === 1) {
        return {
          bytes: new Uint8Array([1]),
          mediaType: 'audio/mpeg',
        }
      }
      throw new Error('tts unavailable')
    })
    const host = createHost({ planProgramme: vi.fn(async () => plan) }, synthesize)

    const programme = await host.generateProgramme(createRequest(candidateTracks))

    expect(synthesize).toHaveBeenCalledTimes(3)
    expect(programme.filter(segment => segment.kind === 'interlude')).toEqual([
      expect.objectContaining({ script: '欢迎收听。' }),
    ])
    expect(trackIds(programme)).toEqual(candidateTracks.map(track => track.id))
  })

  it('removes already materialized audio when generation is aborted', async () => {
    const candidateTracks = createTracks(6)
    const controller = new AbortController()
    const synthesize = vi.fn<TTSProvider['synthesize']>(async () => {
      if (synthesize.mock.calls.length === 2) {
        controller.abort()
        const error = new Error('aborted')
        error.name = 'AbortError'
        throw error
      }

      return { bytes: new Uint8Array([1]), mediaType: 'audio/mpeg' }
    })
    const remove = vi.fn(async () => {})
    const audioCache: InterludeAudioCache = {
      materialize: vi.fn(async ({ cacheKey }) => `file:///cache/${cacheKey}.mp3`),
      remove,
    }
    const host = createProgrammeHost({
      planner: { planProgramme: vi.fn(async () => createValidPlan(candidateTracks)) },
      ttsProvider: { synthesize },
      audioCache,
    })

    await expect(host.generateProgramme(createRequest(candidateTracks, {
      signal: controller.signal,
    }))).rejects.toMatchObject({ name: 'AbortError' })
    expect(remove).toHaveBeenCalledWith('file:///cache/1-0-0.mp3')
  })

  it('rejects an opening interlude during background refill', () => {
    const candidateTracks = createTracks(6)
    const request = createRequest(candidateTracks, {
      reason: ProgrammeGenerationReason.BACKGROUND_REFILL,
    })

    expect(() => validateHostPlan(createValidPlan(candidateTracks), request))
      .toThrowError(InvalidHostPlanError)
  })

  it('requires an explicit Track Request to be the first track', () => {
    const candidateTracks = createTracks(6)
    const request = createRequest(candidateTracks, {
      reason: ProgrammeGenerationReason.INTERVENTION,
      intervention: {
        kind: 'track-request',
        text: candidateTracks[1]!.title,
        trackId: candidateTracks[1]!.id,
      },
    })

    const plan = createValidPlan(candidateTracks)
    const firstTrack = plan.items.find(item => item.kind === 'track')
    if (firstTrack?.kind === 'track')
      firstTrack.trackId = candidateTracks[0]!.id

    expect(() => validateHostPlan(plan, request))
      .toThrowError('Requested track must be the first track')
  })

  it('rejects unknown and duplicate Track IDs', () => {
    const candidateTracks = createTracks(6)
    const request = createRequest(candidateTracks)
    const unknownPlan = createValidPlan(candidateTracks)
    const firstUnknownTrack = unknownPlan.items.find(item => item.kind === 'track')
    if (firstUnknownTrack?.kind === 'track')
      firstUnknownTrack.trackId = 'unknown'

    expect(() => validateHostPlan(unknownPlan, request))
      .toThrowError('Host selected unknown track: unknown')

    const duplicatePlan = createValidPlan(candidateTracks)
    const duplicateTracks = duplicatePlan.items.filter(item => item.kind === 'track')
    if (duplicateTracks[0]?.kind === 'track' && duplicateTracks[1]?.kind === 'track')
      duplicateTracks[1].trackId = duplicateTracks[0].trackId

    expect(() => validateHostPlan(duplicatePlan, request))
      .toThrowError(`Host selected duplicate track: ${candidateTracks[0]!.id}`)
  })

  it('rejects invalid Segment ordering and excessive Interlude cadence', () => {
    const candidateTracks = createTracks(6)
    const request = createRequest(candidateTracks)
    const endingInterludePlan = createValidPlan(candidateTracks)
    endingInterludePlan.items.push({ kind: 'interlude', script: '不应出现在结尾。' })

    expect(() => validateHostPlan(endingInterludePlan, request))
      .toThrowError('Host plan cannot end with an interlude')

    const sparseInterludePlan: HostPlan = {
      items: [
        { kind: 'interlude', script: '欢迎收听。' },
        ...candidateTracks.map(track => ({ kind: 'track' as const, trackId: track.id })),
      ],
    }
    expect(() => validateHostPlan(sparseInterludePlan, request))
      .toThrowError('Host plan exceeds the interlude cadence')
  })

  it('rejects a model plan that misses an achievable duration target', () => {
    const candidateTracks = createTracks(10)
    const request = createRequest(candidateTracks)
    const shortPlan: HostPlan = {
      items: candidateTracks.slice(0, 3).map(track => ({
        kind: 'track',
        trackId: track.id,
      })),
    }

    expect(() => validateHostPlan(shortPlan, request))
      .toThrowError('Host plan is shorter than the available duration target')
  })
})

function createTracks(count: number): Track[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `track-${index + 1}`,
    source: 'local' as const,
    title: `Track ${index + 1}`,
    artist: 'Artist',
    album: 'Album',
    artwork: '',
    url: `file:///track-${index + 1}.mp3`,
    duration: 300,
    createdAt: 1,
    modifiedAt: 1,
    fileSize: 100,
  }))
}

function createValidPlan(candidateTracks: Track[]): HostPlan {
  return {
    items: [
      { kind: 'interlude', script: '欢迎收听。' },
      ...candidateTracks.slice(0, 3).map(track => ({ kind: 'track' as const, trackId: track.id })),
      { kind: 'interlude', script: '继续听下一段。' },
      ...candidateTracks.slice(3).map(track => ({ kind: 'track' as const, trackId: track.id })),
    ],
  }
}

function createRequest(
  candidateTracks: Track[],
  overrides: Partial<ProgrammeGenerationRequest> = {},
): ProgrammeGenerationRequest {
  return {
    generationId: 1,
    reason: ProgrammeGenerationReason.CHANNEL_ENTRY,
    channel,
    candidateTracks,
    sessionContext: { recentTrackIds: [] },
    ...overrides,
  }
}

function createHost(
  planner: HostPlanner,
  synthesize: TTSProvider['synthesize'] = vi.fn(async () => ({
    bytes: new Uint8Array([1]),
    mediaType: 'audio/mpeg',
  })),
) {
  return createProgrammeHost({
    planner,
    ttsProvider: { synthesize },
    audioCache: {
      materialize: vi.fn(async ({ cacheKey }) => `file:///cache/${cacheKey}.mp3`),
      remove: vi.fn(async () => {}),
    },
  })
}

function trackIds(programme: Programme) {
  return programme
    .filter(segment => segment.kind === 'track')
    .map(segment => segment.track.id)
}
