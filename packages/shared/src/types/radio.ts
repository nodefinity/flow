import type { Track } from './track'

export type SegmentKind = 'track' | 'interlude'

export interface TrackSegment {
  kind: 'track'
  track: Track
}

export interface InterlSegment {
  kind: 'interlude'
  script: string
  audioUrl: string
}

export type Segment = TrackSegment | InterlSegment

export type Programme = Segment[]

export type ChatMessage
  = | { type: 'interlude', script: string, timestamp: number }
    | { type: 'now-playing', track: Track, timestamp: number }
    | { type: 'user-turn', text: string, timestamp: number }
    | { type: 'host-turn', text: string, timestamp: number }

export interface ChannelStyle {
  genreHints?: string[]
  energyLevel?: 'low' | 'medium' | 'high'
  tempoRange?: { min: number, max: number }
  moodTags?: string[]
}

export interface Channel {
  id: number
  name: string
  descriptor: string
  style: ChannelStyle
}

export type InterventionKind = 'track-request' | 'mood-change' | 'free-instruction'

export interface Intervention {
  kind: InterventionKind
  text: string
}
