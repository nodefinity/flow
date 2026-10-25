import type { Channel, Intervention, Programme, Track } from '@flow/shared'

export enum ProgrammeGenerationReason {
  CHANNEL_ENTRY = 'channel-entry',
  BACKGROUND_REFILL = 'background-refill',
  INTERVENTION = 'intervention',
}

export interface RadioSessionContext {
  recentTrackIds: string[]
}

export interface ProgrammeGenerationRequest {
  generationId: number
  reason: ProgrammeGenerationReason
  channel: Channel
  candidateTracks: Track[]
  sessionContext: RadioSessionContext
  intervention?: Intervention
  signal?: AbortSignal
}

export interface ProgrammeHost {
  generateProgramme: (request: ProgrammeGenerationRequest) => Promise<Programme>
}

export type HostPlanItem
  = | { kind: 'track', trackId: string }
    | { kind: 'interlude', script: string }

export interface HostPlan {
  items: HostPlanItem[]
}

export interface HostPlanner {
  planProgramme: (request: ProgrammeGenerationRequest) => Promise<HostPlan>
}
