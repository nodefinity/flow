import type { ChannelStyle, Intervention, Programme, Track } from '@flow/shared'
import type { TTSProvider } from './tts'
import Anthropic from '@anthropic-ai/sdk'

type HostItem
  = | { kind: 'track', trackId: string }
    | { kind: 'interlude', script: string }

const SYSTEM_PROMPT = `你是 Flow Radio 的AI主播。你的任务是为听众策划一期精心编排的音乐节目。

你需要：
1. 从候选曲目中挑选 5-8 首歌曲，并按照最佳聆听体验来排序
2. 在第一首歌之前写一段开场白（1-3句话，中文）
3. 每隔 2-3 首歌之间插入一段过渡语（1-3句话，中文）

过渡语应该：
- 简短、自然、有温度
- 可以评价刚播完的歌或预告下一首
- 符合频道风格和当前氛围

请严格按照以下 JSON 格式输出，不要添加任何其他文字：
[
  { "kind": "interlude", "script": "开场白文字" },
  { "kind": "track", "trackId": "歌曲ID" },
  { "kind": "track", "trackId": "歌曲ID" },
  { "kind": "interlude", "script": "过渡语文字" },
  ...
]`

function buildUserPrompt(
  candidateTracks: Track[],
  channelStyle: ChannelStyle,
  intervention?: Intervention,
): string {
  const trackList = candidateTracks.map(t =>
    `- ID: ${t.id} | 标题: ${t.title} | 艺术家: ${t.artist} | 专辑: ${t.album} | 时长: ${Math.round(t.duration)}s`,
  ).join('\n')

  let prompt = `## 候选曲目\n${trackList}\n\n## 频道风格\n`

  if (channelStyle.genreHints?.length)
    prompt += `流派偏好: ${channelStyle.genreHints.join(', ')}\n`
  if (channelStyle.moodTags?.length)
    prompt += `氛围标签: ${channelStyle.moodTags.join(', ')}\n`
  if (channelStyle.energyLevel)
    prompt += `能量等级: ${channelStyle.energyLevel}\n`
  if (channelStyle.tempoRange)
    prompt += `节奏范围: ${channelStyle.tempoRange.min}-${channelStyle.tempoRange.max} BPM\n`

  if (!channelStyle.genreHints?.length && !channelStyle.moodTags?.length && !channelStyle.energyLevel)
    prompt += `自由风格，综合编排\n`

  if (intervention) {
    prompt += `\n## 听众指令\n`
    prompt += `类型: ${intervention.kind}\n`
    prompt += `内容: ${intervention.text}\n`
    prompt += `请在编排中响应这个指令。\n`
  }

  prompt += `\n请编排节目。`
  return prompt
}

function parseHostResponse(text: string, candidateTracks: Track[]): HostItem[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch)
    throw new Error('Failed to parse host response: no JSON array found')

  const items = JSON.parse(jsonMatch[0]) as HostItem[]
  const trackIds = new Set(candidateTracks.map(t => t.id))

  for (const item of items) {
    if (item.kind === 'track' && !trackIds.has(item.trackId))
      throw new Error(`Host selected unknown track: ${item.trackId}`)
  }

  return items
}

export async function generateProgramme(
  channelStyle: ChannelStyle,
  candidateTracks: Track[],
  ttsProvider: TTSProvider,
  intervention?: Intervention,
): Promise<Programme> {
  const client = new Anthropic()

  const trackListBlock = candidateTracks.map(t =>
    `${t.id}|${t.title}|${t.artist}`,
  ).join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: `## 候选曲目缓存\n${trackListBlock}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(candidateTracks, channelStyle, intervention),
      },
    ],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text')
    throw new Error('No text response from Claude')

  const items = parseHostResponse(textBlock.text, candidateTracks)
  const trackMap = new Map(candidateTracks.map(t => [t.id, t]))

  const programme: Programme = []
  for (const item of items) {
    if (item.kind === 'track') {
      const track = trackMap.get(item.trackId)
      if (track) {
        programme.push({ kind: 'track', track })
      }
    }
    else {
      const audioUrl = await ttsProvider.synthesize(item.script)
      programme.push({ kind: 'interlude', script: item.script, audioUrl })
    }
  }

  return programme
}
