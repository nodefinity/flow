import type { Channel, Intervention, Programme, Segment, Track } from '@flow/shared'
import type { ProgrammeGenerationRequest, ProgrammeHost } from './contracts'
import { PlaybackMode } from '../player/playerStore'
import { ProgrammeGenerationReason } from './contracts'

const TARGET_CANDIDATE_DURATION_SECONDS = 45 * 60
const MAX_RECENT_TRACKS = 50

export interface ProgrammePlayerSnapshot {
  playbackMode: PlaybackMode
  isPlaying: boolean
  programme: Programme
  nowPlayingSegmentIndex: number
}

export interface ProgrammePlayer {
  getSnapshot: () => ProgrammePlayerSnapshot
  loadProgramme: (programme: Programme) => void
}

export interface ProgrammeManagerOptions {
  host: ProgrammeHost
  player: ProgrammePlayer
  loadCandidateTracks: (channel: Channel) => Promise<Track[]>
}

interface ActiveGeneration {
  id: number
  reason: ProgrammeGenerationReason
  controller: AbortController
}

export class ProgrammeManager {
  private activeChannel: Channel | null = null
  private candidateTracks: Track[] = []
  private nextProgramme: Programme | null = null
  private pendingInterventionProgramme: Programme | null = null
  private shouldLoadNextProgrammeWhenReady = false
  private shouldLoadInterventionWhenReady = false
  private recentTrackIds: string[] = []
  private generationId = 0
  private activeGeneration: ActiveGeneration | null = null

  constructor(private readonly options: ProgrammeManagerOptions) {}

  async loadChannel(channel: Channel) {
    const generation = this.beginGeneration(ProgrammeGenerationReason.CHANNEL_ENTRY)
    this.activeChannel = channel
    this.candidateTracks = []
    this.nextProgramme = null
    this.pendingInterventionProgramme = null
    this.shouldLoadNextProgrammeWhenReady = false
    this.shouldLoadInterventionWhenReady = false
    this.recentTrackIds = []

    try {
      const candidateTracks = await this.options.loadCandidateTracks(channel)
      if (!this.isLatestGeneration(generation.id))
        return

      this.candidateTracks = candidateTracks
      const programme = await this.options.host.generateProgramme(
        this.createGenerationRequest(generation, candidateTracks),
      )
      if (!this.isLatestGeneration(generation.id))
        return

      if (programme.length > 0)
        this.options.player.loadProgramme(programme)
    }
    catch (error) {
      if (!isAbortError(error, generation.controller.signal))
        throw error
    }
    finally {
      this.finishGeneration(generation.id)
    }
  }

  async handleIntervention(intervention: Intervention) {
    if (!this.activeChannel || this.candidateTracks.length === 0)
      return

    const generation = this.beginGeneration(ProgrammeGenerationReason.INTERVENTION)
    this.nextProgramme = null
    this.pendingInterventionProgramme = null
    this.shouldLoadNextProgrammeWhenReady = false
    this.shouldLoadInterventionWhenReady = false

    try {
      const candidateTracks = this.selectGenerationCandidates(intervention)
      const programme = await this.options.host.generateProgramme(
        this.createGenerationRequest(generation, candidateTracks, intervention),
      )
      if (!this.isLatestGeneration(generation.id) || programme.length === 0)
        return

      const state = this.options.player.getSnapshot()
      const currentSegment = state.programme[state.nowPlayingSegmentIndex]

      if (
        this.shouldLoadInterventionWhenReady
        || state.playbackMode !== PlaybackMode.RADIO
        || !currentSegment
        || !state.isPlaying
      ) {
        this.shouldLoadInterventionWhenReady = false
        this.options.player.loadProgramme(programme)
        return
      }

      this.pendingInterventionProgramme = programme
    }
    catch (error) {
      if (!isAbortError(error, generation.controller.signal))
        throw error
    }
    finally {
      this.finishGeneration(generation.id)
    }
  }

  onSegmentEnd(segment: Segment, index: number) {
    const state = this.options.player.getSnapshot()
    if (
      state.playbackMode !== PlaybackMode.RADIO
      || state.programme[index] !== segment
    ) {
      return
    }

    if (segment.kind === 'track')
      this.recordRecentTrack(segment.track.id)

    if (this.activeGeneration?.reason === ProgrammeGenerationReason.INTERVENTION) {
      this.shouldLoadInterventionWhenReady = true
      return
    }

    if (this.pendingInterventionProgramme) {
      const programme = this.pendingInterventionProgramme
      this.pendingInterventionProgramme = null
      this.nextProgramme = null
      this.options.player.loadProgramme(programme)
      return
    }

    const remainingAfterFinished = state.programme.length - index - 1
    if (remainingAfterFinished <= 0) {
      if (this.nextProgramme) {
        this.loadPreparedProgramme()
      }
      else {
        void this.prepareNextProgramme(true)
      }
      return
    }

    if (remainingAfterFinished <= 2)
      void this.prepareNextProgramme(false)
  }

  private async prepareNextProgramme(loadWhenReady: boolean) {
    if (!this.activeChannel || this.candidateTracks.length === 0)
      return

    if (loadWhenReady)
      this.shouldLoadNextProgrammeWhenReady = true

    if (this.nextProgramme || this.activeGeneration)
      return

    const generation = this.beginGeneration(ProgrammeGenerationReason.BACKGROUND_REFILL)
    try {
      const candidateTracks = this.selectGenerationCandidates()
      const programme = await this.options.host.generateProgramme(
        this.createGenerationRequest(generation, candidateTracks),
      )
      if (!this.isLatestGeneration(generation.id))
        return

      if (programme.length > 0)
        this.nextProgramme = programme
      if (this.shouldLoadNextProgrammeWhenReady && this.isAtProgrammeEnd())
        this.loadPreparedProgramme()
    }
    catch (error) {
      if (!isAbortError(error, generation.controller.signal))
        throw error
    }
    finally {
      this.finishGeneration(generation.id)
    }
  }

  private createGenerationRequest(
    generation: ActiveGeneration,
    candidateTracks: Track[],
    intervention?: Intervention,
  ): ProgrammeGenerationRequest {
    if (!this.activeChannel)
      throw new Error('Cannot generate a Programme without an active Channel')

    return {
      generationId: generation.id,
      reason: generation.reason,
      channel: this.activeChannel,
      candidateTracks,
      sessionContext: {
        recentTrackIds: [...this.recentTrackIds],
      },
      intervention,
      signal: generation.controller.signal,
    }
  }

  private selectGenerationCandidates(intervention?: Intervention): Track[] {
    const state = this.options.player.getSnapshot()
    const currentProgrammeTrackIds = state.playbackMode === PlaybackMode.RADIO
      ? state.programme
          .filter(segment => segment.kind === 'track')
          .map(segment => segment.track.id)
      : []
    const withheldTrackIds = new Set([...this.recentTrackIds, ...currentProgrammeTrackIds])
    const requestedTrackId = intervention?.kind === 'track-request'
      ? intervention.trackId ?? this.findTrackId(intervention.text)
      : undefined
    const selected: Track[] = []

    if (requestedTrackId) {
      const requestedTrack = this.candidateTracks.find(track => track.id === requestedTrackId)
      if (requestedTrack)
        selected.push(requestedTrack)
    }

    for (const track of this.candidateTracks) {
      if (!withheldTrackIds.has(track.id) && track.id !== requestedTrackId)
        selected.push(track)
    }

    let selectedDuration = totalDuration(selected)
    const leastRecentTrackIds = [
      ...this.recentTrackIds,
      ...currentProgrammeTrackIds.filter(trackId => !this.recentTrackIds.includes(trackId)),
    ]

    for (const trackId of leastRecentTrackIds) {
      if (selectedDuration >= TARGET_CANDIDATE_DURATION_SECONDS)
        break
      if (trackId === requestedTrackId || selected.some(track => track.id === trackId))
        continue

      const track = this.candidateTracks.find(candidate => candidate.id === trackId)
      if (!track)
        continue

      selected.push(track)
      selectedDuration += Math.max(0, track.duration)
    }

    return selected
  }

  private findTrackId(text: string) {
    const normalizedText = text.trim().toLocaleLowerCase()
    return this.candidateTracks.find((track) => {
      return track.id === text || track.title.trim().toLocaleLowerCase() === normalizedText
    })?.id
  }

  private recordRecentTrack(trackId: string) {
    this.recentTrackIds = this.recentTrackIds.filter(id => id !== trackId)
    this.recentTrackIds.push(trackId)
    if (this.recentTrackIds.length > MAX_RECENT_TRACKS)
      this.recentTrackIds.splice(0, this.recentTrackIds.length - MAX_RECENT_TRACKS)
  }

  private beginGeneration(reason: ProgrammeGenerationReason): ActiveGeneration {
    this.activeGeneration?.controller.abort()
    const generation = {
      id: ++this.generationId,
      reason,
      controller: new AbortController(),
    }
    this.activeGeneration = generation
    return generation
  }

  private isLatestGeneration(generationId: number) {
    return this.activeGeneration?.id === generationId
  }

  private finishGeneration(generationId: number) {
    if (this.activeGeneration?.id === generationId)
      this.activeGeneration = null
  }

  private loadPreparedProgramme() {
    if (!this.nextProgramme)
      return

    const programme = this.nextProgramme
    this.nextProgramme = null
    this.shouldLoadNextProgrammeWhenReady = false
    this.options.player.loadProgramme(programme)
  }

  private isAtProgrammeEnd() {
    const state = this.options.player.getSnapshot()
    return state.playbackMode === PlaybackMode.RADIO
      && state.programme.length > 0
      && state.nowPlayingSegmentIndex >= state.programme.length - 1
      && !state.isPlaying
  }
}

function totalDuration(tracks: Track[]) {
  return tracks.reduce((duration, track) => duration + Math.max(0, track.duration), 0)
}

function isAbortError(error: unknown, signal: AbortSignal) {
  return signal.aborted || (error instanceof Error && error.name === 'AbortError')
}
