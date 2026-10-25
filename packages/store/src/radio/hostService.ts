import type { Programme, Track } from '@flow/shared'
import type { HostPlan, HostPlanItem, HostPlanner, ProgrammeGenerationRequest, ProgrammeHost } from './contracts'
import type { InterludeAudioCache, TTSProvider } from './tts'
import { ProgrammeGenerationReason } from './contracts'
import { HOST_POLICY_V1 } from './hostPolicy'

const DEFAULT_PLANNING_ATTEMPTS = 2
const DEFAULT_SYNTHESIS_ATTEMPTS = 2

export interface ProgrammeHostOptions {
  planner: HostPlanner
  ttsProvider: TTSProvider
  audioCache: InterludeAudioCache
  planningAttempts?: number
  synthesisAttempts?: number
}

export class InvalidHostPlanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidHostPlanError'
  }
}

export function createProgrammeHost(options: ProgrammeHostOptions): ProgrammeHost {
  const planningAttempts = normalizeAttempts(options.planningAttempts, DEFAULT_PLANNING_ATTEMPTS)
  const synthesisAttempts = normalizeAttempts(options.synthesisAttempts, DEFAULT_SYNTHESIS_ATTEMPTS)

  return {
    async generateProgramme(request) {
      throwIfAborted(request.signal)

      const plan = await planWithFallback(request, options.planner, planningAttempts)
      return assembleProgramme(request, plan, options.ttsProvider, options.audioCache, synthesisAttempts)
    },
  }
}

export function validateHostPlan(plan: HostPlan, request: ProgrammeGenerationRequest): void {
  if (plan.items.length === 0)
    throw new InvalidHostPlanError('Host plan is empty')

  const candidateTrackIds = new Set(request.candidateTracks.map(track => track.id))
  const selectedTrackIds = new Set<string>()
  const selectedTracks: Track[] = []
  let tracksSinceInterlude = 0
  let hasTrack = false

  for (const [index, item] of plan.items.entries()) {
    if (item.kind === 'track') {
      if (!candidateTrackIds.has(item.trackId))
        throw new InvalidHostPlanError(`Host selected unknown track: ${item.trackId}`)
      if (selectedTrackIds.has(item.trackId))
        throw new InvalidHostPlanError(`Host selected duplicate track: ${item.trackId}`)

      const track = request.candidateTracks.find(candidate => candidate.id === item.trackId)
      if (!track)
        throw new InvalidHostPlanError(`Host selected unavailable track: ${item.trackId}`)

      selectedTrackIds.add(item.trackId)
      selectedTracks.push(track)
      tracksSinceInterlude += 1
      hasTrack = true
      continue
    }

    if (!item.script.trim())
      throw new InvalidHostPlanError('Host interlude script is empty')
    if (index === plan.items.length - 1)
      throw new InvalidHostPlanError('Host plan cannot end with an interlude')

    const isOpeningInterlude = index === 0
    if (isOpeningInterlude) {
      if (request.reason === ProgrammeGenerationReason.BACKGROUND_REFILL)
        throw new InvalidHostPlanError('Background refill cannot contain an opening interlude')
      tracksSinceInterlude = 0
      continue
    }

    if (
      tracksSinceInterlude < HOST_POLICY_V1.minimumTracksBetweenInterludes
      || tracksSinceInterlude > HOST_POLICY_V1.maximumTracksBetweenInterludes
    ) {
      throw new InvalidHostPlanError('Transition interludes must follow 2–3 tracks')
    }
    tracksSinceInterlude = 0
  }

  if (!hasTrack)
    throw new InvalidHostPlanError('Host plan contains no tracks')
  if (tracksSinceInterlude > HOST_POLICY_V1.maximumTracksBetweenInterludes)
    throw new InvalidHostPlanError('Host plan exceeds the interlude cadence')

  validateRequestedTrack(plan.items, request)
  validateProgrammeDuration(selectedTracks, request.candidateTracks)
}

async function planWithFallback(
  request: ProgrammeGenerationRequest,
  planner: HostPlanner,
  attempts: number,
): Promise<HostPlan> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const plan = await planner.planProgramme(request)
      throwIfAborted(request.signal)
      validateHostPlan(plan, request)
      return plan
    }
    catch (error) {
      if (isAbortError(error, request.signal))
        throw error
    }
  }

  return createMusicOnlyFallbackPlan(request)
}

function createMusicOnlyFallbackPlan(request: ProgrammeGenerationRequest): HostPlan {
  const requestedTrackId = getRequestedTrackId(request)
  const orderedTracks = requestedTrackId
    ? [
        ...request.candidateTracks.filter(track => track.id === requestedTrackId),
        ...request.candidateTracks.filter(track => track.id !== requestedTrackId),
      ]
    : request.candidateTracks

  const selectedTracks: Track[] = []
  let duration = 0

  for (const track of orderedTracks) {
    if (selectedTracks.some(selected => selected.id === track.id))
      continue
    if (duration >= HOST_POLICY_V1.minimumProgrammeDurationSeconds)
      break
    if (
      duration > 0
      && duration + track.duration > HOST_POLICY_V1.maximumProgrammeDurationSeconds
      && duration >= HOST_POLICY_V1.minimumProgrammeDurationSeconds
    ) {
      break
    }

    selectedTracks.push(track)
    duration += Math.max(0, track.duration)
  }

  if (selectedTracks.length === 0 && orderedTracks[0])
    selectedTracks.push(orderedTracks[0])

  return {
    items: selectedTracks.map(track => ({ kind: 'track', trackId: track.id })),
  }
}

async function assembleProgramme(
  request: ProgrammeGenerationRequest,
  plan: HostPlan,
  ttsProvider: TTSProvider,
  audioCache: InterludeAudioCache,
  synthesisAttempts: number,
): Promise<Programme> {
  const trackMap = new Map(request.candidateTracks.map(track => [track.id, track]))
  const programme: Programme = []
  const materializedUris: string[] = []

  try {
    for (const [index, item] of plan.items.entries()) {
      throwIfAborted(request.signal)

      if (item.kind === 'track') {
        const track = trackMap.get(item.trackId)
        if (track)
          programme.push({ kind: 'track', track })
        continue
      }

      const audioUrl = await synthesizeInterlude(
        request,
        item.script,
        index,
        ttsProvider,
        audioCache,
        synthesisAttempts,
      )
      if (!audioUrl)
        continue

      materializedUris.push(audioUrl)
      programme.push({ kind: 'interlude', script: item.script, audioUrl })
    }

    throwIfAborted(request.signal)
    return programme
  }
  catch (error) {
    await Promise.allSettled(materializedUris.map(uri => audioCache.remove(uri)))
    throw error
  }
}

async function synthesizeInterlude(
  request: ProgrammeGenerationRequest,
  script: string,
  index: number,
  ttsProvider: TTSProvider,
  audioCache: InterludeAudioCache,
  attempts: number,
): Promise<string | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      throwIfAborted(request.signal)
      const audio = await ttsProvider.synthesize({
        script,
        hostVoice: request.channel.hostVoice,
        signal: request.signal,
      })
      throwIfAborted(request.signal)

      return await audioCache.materialize({
        audio,
        cacheKey: `${request.generationId}-${index}-${attempt}`,
        signal: request.signal,
      })
    }
    catch (error) {
      if (isAbortError(error, request.signal))
        throw error
    }
  }

  return null
}

function validateRequestedTrack(items: HostPlanItem[], request: ProgrammeGenerationRequest) {
  const requestedTrackId = getRequestedTrackId(request)
  if (!requestedTrackId)
    return

  const firstTrack = items.find(item => item.kind === 'track')
  if (!firstTrack || firstTrack.kind !== 'track' || firstTrack.trackId !== requestedTrackId)
    throw new InvalidHostPlanError('Requested track must be the first track')
}

function getRequestedTrackId(request: ProgrammeGenerationRequest): string | undefined {
  if (request.intervention?.kind !== 'track-request')
    return undefined

  if (request.intervention.trackId)
    return request.intervention.trackId

  const normalizedRequest = request.intervention.text.trim().toLocaleLowerCase()
  return request.candidateTracks.find((track) => {
    return track.id === request.intervention?.text
      || track.title.trim().toLocaleLowerCase() === normalizedRequest
  })?.id
}

function validateProgrammeDuration(selectedTracks: Track[], candidateTracks: Track[]) {
  const selectedDuration = totalDuration(selectedTracks)
  const availableDuration = totalDuration(candidateTracks)
  const minimumDuration = Math.min(HOST_POLICY_V1.minimumProgrammeDurationSeconds, availableDuration)

  if (selectedDuration < minimumDuration)
    throw new InvalidHostPlanError('Host plan is shorter than the available duration target')

  if (selectedDuration <= HOST_POLICY_V1.maximumProgrammeDurationSeconds)
    return

  const lastTrack = selectedTracks.at(-1)
  if (
    lastTrack
    && selectedDuration - Math.max(0, lastTrack.duration) >= HOST_POLICY_V1.minimumProgrammeDurationSeconds
  ) {
    throw new InvalidHostPlanError('Host plan is longer than the duration target')
  }
}

function totalDuration(tracks: Track[]) {
  return tracks.reduce((duration, track) => duration + Math.max(0, track.duration), 0)
}

function normalizeAttempts(value: number | undefined, fallback: number) {
  return value === undefined ? fallback : Math.max(1, Math.floor(value))
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted)
    return

  const error = new Error('Programme generation was aborted')
  error.name = 'AbortError'
  throw error
}

function isAbortError(error: unknown, signal?: AbortSignal) {
  return signal?.aborted || (error instanceof Error && error.name === 'AbortError')
}
