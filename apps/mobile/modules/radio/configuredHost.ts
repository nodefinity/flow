import type { ProgrammeHost, TTSProvider } from '@flow/store'
import { createDeepSeekHostPlanner, createProgrammeHost } from '@flow/store'
import { interludeAudioCache } from './interludeAudioCache'
import { getRadioCredentials, radioCredentialsAreComplete } from './radioCredentials'

export type ConfiguredRadioHostResult
  = | { kind: 'ready', host: ProgrammeHost }
    | { kind: 'missing-credentials' }

export interface ConfiguredRadioHostDependencies {
  createTTSProvider: (apiKey: string) => TTSProvider
}

export async function createConfiguredRadioHost(
  dependencies: ConfiguredRadioHostDependencies,
): Promise<ConfiguredRadioHostResult> {
  const credentials = await getRadioCredentials()
  if (!radioCredentialsAreComplete(credentials))
    return { kind: 'missing-credentials' }

  return {
    kind: 'ready',
    host: createProgrammeHost({
      planner: createDeepSeekHostPlanner({ apiKey: credentials.deepSeekApiKey }),
      ttsProvider: dependencies.createTTSProvider(credentials.ttsApiKey),
      audioCache: interludeAudioCache,
    }),
  }
}
