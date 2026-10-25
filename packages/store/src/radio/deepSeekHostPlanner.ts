import type { DeepSeekLanguageModelOptions } from '@ai-sdk/deepseek'
import type { HostPlan, HostPlanner, ProgrammeGenerationRequest } from './contracts'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import { HOST_POLICY_V1 } from './hostPolicy'

export const DEEPSEEK_HOST_MODEL = 'deepseek-v4-flash'

const hostPlanSchema = z.object({
  items: z.array(z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('track'),
      trackId: z.string().min(1),
    }),
    z.object({
      kind: z.literal('interlude'),
      script: z.string().min(1),
    }),
  ])).min(1),
})

const SYSTEM_PROMPT = `你是 Flow Radio 的 Host，负责把候选曲目策划成一期连贯的音乐节目。

只输出符合 schema 的结构化节目计划。规则：
- 只能选择候选曲目中的 ID，同一期不得重复曲目。
- 音乐总时长以 30–45 分钟为软目标；候选曲目不足时使用可用时长。
- channel-entry 和 intervention 可以用一段 1–3 句的中文开场口播；background-refill 不得有开场口播。
- 过渡口播只能放在每 2–3 首歌之后，保持简短、自然、有温度。
- 不要在节目末尾放口播。
- track-request 必须把请求的歌曲作为第一首歌。
- 你只负责规划，不得创建候选集之外的歌曲，也不得输出播放器操作。`

export interface DeepSeekHostPlannerOptions {
  apiKey: string
  baseURL?: string
  fetch?: typeof globalThis.fetch
  onDiagnostic?: (diagnostic: HostProviderDiagnostic) => void
}

export interface HostProviderDiagnostic {
  provider: 'deepseek'
  model: string
  hostPolicyVersion: string
}

export function createDeepSeekHostPlanner(options: DeepSeekHostPlannerOptions): HostPlanner {
  const deepSeek = createDeepSeek({
    apiKey: options.apiKey,
    baseURL: options.baseURL,
    fetch: options.fetch,
  })

  return {
    async planProgramme(request): Promise<HostPlan> {
      const { output } = await generateText({
        model: deepSeek(DEEPSEEK_HOST_MODEL),
        output: Output.object({ schema: hostPlanSchema }),
        system: SYSTEM_PROMPT,
        prompt: buildUserPrompt(request),
        abortSignal: request.signal,
        maxRetries: 0,
        providerOptions: {
          deepseek: {
            thinking: { type: 'disabled' },
          } satisfies DeepSeekLanguageModelOptions,
        },
      })

      options.onDiagnostic?.({
        provider: 'deepseek',
        model: DEEPSEEK_HOST_MODEL,
        hostPolicyVersion: HOST_POLICY_V1.version,
      })
      return output
    },
  }
}

function buildUserPrompt(request: ProgrammeGenerationRequest): string {
  const candidateTracks = request.candidateTracks.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    durationSeconds: Math.max(0, Math.round(track.duration)),
  }))

  return JSON.stringify({
    generationReason: request.reason,
    hostPolicyVersion: HOST_POLICY_V1.version,
    channel: {
      name: request.channel.name,
      descriptor: request.channel.descriptor,
      style: request.channel.style,
    },
    sessionContext: request.sessionContext,
    intervention: request.intervention,
    candidateTracks,
  })
}
