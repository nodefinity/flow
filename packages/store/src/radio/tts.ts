import type { HostVoice } from '@flow/shared'

export interface SynthesizedAudio {
  bytes: Uint8Array
  mediaType: string
}

export interface TTSRequest {
  script: string
  hostVoice: HostVoice
  signal?: AbortSignal
}

export interface TTSProvider {
  synthesize: (request: TTSRequest) => Promise<SynthesizedAudio>
}

export interface InterludeAudioCacheRequest {
  audio: SynthesizedAudio
  cacheKey: string
  signal?: AbortSignal
}

export interface InterludeAudioCache {
  materialize: (request: InterludeAudioCacheRequest) => Promise<string>
  remove: (uri: string) => Promise<void>
}
