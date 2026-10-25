import type { Channel, Programme, Track } from '@flow/shared'
import type { ProgrammeGenerationRequest, ProgrammeHost } from './contracts'
import type { ProgrammePlayer, ProgrammePlayerSnapshot } from './programmeManager'
import { HostVoice } from '@flow/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlaybackMode } from '../player/playerStore'
import { ProgrammeGenerationReason } from './contracts'
import { ProgrammeManager } from './programmeManager'

const trackA = createTrack('track-a')
const trackB = createTrack('track-b')
const trackC = createTrack('track-c')
const trackD = createTrack('track-d')

const channel: Channel = {
  id: 1,
  name: 'Flow Radio',
  descriptor: 'Local radio',
  style: { moodTags: ['focus'] },
  hostVoice: HostVoice.DEFAULT,
}

function createTrack(id: string): Track {
  return {
    id,
    source: 'local',
    title: id,
    artist: 'Artist',
    album: 'Album',
    artwork: '',
    url: `file:///${id}.mp3`,
    duration: 180,
    createdAt: 1,
    modifiedAt: 1,
    fileSize: 100,
  }
}

function toProgramme(tracks: Track[]): Programme {
  return tracks.map(track => ({ kind: 'track', track }))
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

class FakeProgrammePlayer implements ProgrammePlayer {
  loadedProgrammes: Programme[] = []
  snapshot: ProgrammePlayerSnapshot = {
    playbackMode: PlaybackMode.CLASSIC,
    isPlaying: false,
    programme: [],
    nowPlayingSegmentIndex: 0,
  }

  getSnapshot = () => this.snapshot

  loadProgramme = (programme: Programme) => {
    this.loadedProgrammes.push(programme)
    this.snapshot = {
      playbackMode: PlaybackMode.RADIO,
      isPlaying: true,
      programme,
      nowPlayingSegmentIndex: 0,
    }
  }

  setRadioPosition(programme: Programme, nowPlayingSegmentIndex: number, isPlaying: boolean) {
    this.snapshot = {
      playbackMode: PlaybackMode.RADIO,
      isPlaying,
      programme,
      nowPlayingSegmentIndex,
    }
  }
}

describe('programme manager', () => {
  let player: FakeProgrammePlayer

  beforeEach(() => {
    player = new FakeProgrammePlayer()
  })

  it('loads a channel with an explicit channel-entry generation request', async () => {
    const programme = toProgramme([trackA, trackB])
    const generateProgramme = vi.fn<(request: ProgrammeGenerationRequest) => Promise<Programme>>(async () => programme)
    const loadCandidateTracks = vi.fn(async () => [trackA, trackB])
    const manager = createManager({ generateProgramme }, loadCandidateTracks)

    await manager.loadChannel(channel)

    expect(loadCandidateTracks).toHaveBeenCalledWith(channel)
    expect(generateProgramme).toHaveBeenCalledTimes(1)
    expect(generateProgramme.mock.calls[0]?.[0]).toMatchObject({
      generationId: 1,
      reason: ProgrammeGenerationReason.CHANNEL_ENTRY,
      channel,
      candidateTracks: [trackA, trackB],
      sessionContext: { recentTrackIds: [] },
    })
    expect(player.loadedProgrammes).toEqual([programme])
  })

  it('drops stale channel loads when a newer channel load finishes first', async () => {
    const firstCandidates = createDeferred<Track[]>()
    const loadCandidateTracks = vi
      .fn<(channel: Channel) => Promise<Track[]>>()
      .mockReturnValueOnce(firstCandidates.promise)
      .mockResolvedValueOnce([trackB])
    const generateProgramme = vi.fn(async (request: ProgrammeGenerationRequest) => {
      return toProgramme(request.candidateTracks)
    })
    const manager = createManager({ generateProgramme }, loadCandidateTracks)

    const firstLoad = manager.loadChannel(channel)
    const secondChannel = { ...channel, id: 2, name: 'Second Radio' }
    await manager.loadChannel(secondChannel)
    firstCandidates.resolve([trackA])
    await firstLoad

    expect(player.loadedProgrammes).toEqual([toProgramme([trackB])])
    expect(generateProgramme).toHaveBeenCalledTimes(1)
  })

  it('defers an intervention programme until the current segment ends', async () => {
    const initialProgramme = toProgramme([trackA, trackB])
    const interventionProgramme = toProgramme([trackC])
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockResolvedValueOnce(interventionProgramme)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC])

    await manager.loadChannel(channel)
    await manager.handleIntervention({ kind: 'free-instruction', text: 'more energy' })

    expect(generateProgramme.mock.calls[1]?.[0]).toMatchObject({
      reason: ProgrammeGenerationReason.INTERVENTION,
      intervention: { kind: 'free-instruction', text: 'more energy' },
    })
    expect(player.loadedProgrammes).toEqual([initialProgramme])

    manager.onSegmentEnd(initialProgramme[0]!, 0)

    expect(player.loadedProgrammes).toEqual([initialProgramme, interventionProgramme])
  })

  it('loads an intervention as soon as generation finishes if the current segment already ended', async () => {
    const initialProgramme = toProgramme([trackA, trackB])
    const interventionProgramme = toProgramme([trackC])
    const pendingIntervention = createDeferred<Programme>()
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockReturnValueOnce(pendingIntervention.promise)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC])

    await manager.loadChannel(channel)
    const intervention = manager.handleIntervention({ kind: 'free-instruction', text: 'switch' })
    manager.onSegmentEnd(initialProgramme[0]!, 0)

    pendingIntervention.resolve(interventionProgramme)
    await intervention

    expect(player.loadedProgrammes).toEqual([initialProgramme, interventionProgramme])
  })

  it('prepares a background refill with recency context and withheld current tracks', async () => {
    const initialProgramme = toProgramme([trackA, trackB, trackC])
    const nextProgramme = toProgramme([trackD])
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockResolvedValueOnce(nextProgramme)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC, trackD])

    await manager.loadChannel(channel)
    manager.onSegmentEnd(initialProgramme[0]!, 0)
    await flushMicrotasks()

    const refillRequest = generateProgramme.mock.calls[1]?.[0] as ProgrammeGenerationRequest
    expect(refillRequest.reason).toBe(ProgrammeGenerationReason.BACKGROUND_REFILL)
    expect(refillRequest.sessionContext.recentTrackIds).toEqual([trackA.id])
    expect(refillRequest.candidateTracks.map(track => track.id)).toEqual([
      trackD.id,
      trackA.id,
      trackB.id,
      trackC.id,
    ])
    expect(player.loadedProgrammes).toEqual([initialProgramme])

    player.setRadioPosition(initialProgramme, 2, false)
    manager.onSegmentEnd(initialProgramme[2]!, 2)

    expect(player.loadedProgrammes).toEqual([initialProgramme, nextProgramme])
  })

  it('loads the next programme after final segment end if preparation is still in flight', async () => {
    const initialProgramme = toProgramme([trackA, trackB, trackC])
    const nextProgramme = toProgramme([trackD])
    const pendingNextProgramme = createDeferred<Programme>()
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockReturnValueOnce(pendingNextProgramme.promise)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC, trackD])

    await manager.loadChannel(channel)
    manager.onSegmentEnd(initialProgramme[0]!, 0)

    player.setRadioPosition(initialProgramme, 2, false)
    manager.onSegmentEnd(initialProgramme[2]!, 2)

    expect(player.loadedProgrammes).toEqual([initialProgramme])

    pendingNextProgramme.resolve(nextProgramme)
    await flushMicrotasks()

    expect(player.loadedProgrammes).toEqual([initialProgramme, nextProgramme])
  })

  it('aborts an in-flight refill when an intervention becomes the latest generation', async () => {
    const initialProgramme = toProgramme([trackA, trackB, trackC])
    const pendingRefill = createDeferred<Programme>()
    const interventionProgramme = toProgramme([trackD])
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockReturnValueOnce(pendingRefill.promise)
      .mockResolvedValueOnce(interventionProgramme)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC, trackD])

    await manager.loadChannel(channel)
    manager.onSegmentEnd(initialProgramme[0]!, 0)
    await flushMicrotasks()

    const refillRequest = generateProgramme.mock.calls[1]?.[0] as ProgrammeGenerationRequest
    await manager.handleIntervention({ kind: 'free-instruction', text: 'more energy' })

    expect(refillRequest.signal?.aborted).toBe(true)

    pendingRefill.resolve(toProgramme([trackB]))
    await flushMicrotasks()
    manager.onSegmentEnd(initialProgramme[1]!, 1)

    expect(player.loadedProgrammes).toEqual([initialProgramme, interventionProgramme])
  })

  it('puts an explicitly requested track first even when it was withheld', async () => {
    const initialProgramme = toProgramme([trackA, trackB])
    const requestedProgramme = toProgramme([trackA, trackC])
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockResolvedValueOnce(requestedProgramme)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC])

    await manager.loadChannel(channel)
    await manager.handleIntervention({
      kind: 'track-request',
      text: trackA.title,
      trackId: trackA.id,
    })

    const request = generateProgramme.mock.calls.at(-1)?.[0] as ProgrammeGenerationRequest
    expect(request.candidateTracks[0]).toBe(trackA)
  })

  it('ignores stale segment-end events from an old programme', async () => {
    const initialProgramme = toProgramme([trackA, trackB])
    const interventionProgramme = toProgramme([trackC])
    const newerProgramme = toProgramme([trackD])
    const generateProgramme = vi
      .fn()
      .mockResolvedValueOnce(initialProgramme)
      .mockResolvedValueOnce(interventionProgramme)
    const manager = createManager({ generateProgramme }, async () => [trackA, trackB, trackC])

    await manager.loadChannel(channel)
    await manager.handleIntervention({ kind: 'free-instruction', text: 'switch' })
    player.setRadioPosition(newerProgramme, 0, true)

    manager.onSegmentEnd(initialProgramme[0]!, 0)

    expect(player.loadedProgrammes).toEqual([initialProgramme])
  })

  function createManager(
    host: ProgrammeHost,
    loadCandidateTracks: (channel: Channel) => Promise<Track[]>,
  ) {
    return new ProgrammeManager({
      host,
      player,
      loadCandidateTracks,
    })
  }
})
