import type { ChatMessage, Track } from '@flow/shared'
import type { MusicToolOptions } from './musicTools'
import type { TextChatRequest } from './textChat'
import { describe, expect, it, vi } from 'vitest'
import { PlaybackMode, PlayMode, usePlayerStore } from '../player/playerStore'
import { DEEPSEEK_HOST_MODEL } from './deepSeekHostPlanner'
import { createTextChatClient, TextChatErrorCode } from './textChat'

type TestFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

const request: TextChatRequest = {
  messages: [{ type: 'user-turn', text: '这首歌适合晚上听吗？', timestamp: 1 }],
  nowPlaying: { title: '夜航', artist: 'Artist', album: 'Album' },
  isPlaying: true,
  language: 'zh',
}

function sseChunk(delta: Record<string, unknown>, finishReason: string | null = null) {
  return `data: ${JSON.stringify({ id: 'test', object: 'chat.completion.chunk', created: 1, model: DEEPSEEK_HOST_MODEL, choices: [{ index: 0, delta, finish_reason: finishReason }] })}\n\n`
}

function sseResponse(deltas: Record<string, unknown>[], finishReason = 'stop') {
  return new Response(`${deltas.map(delta => sseChunk(delta)).join('')}${sseChunk({}, finishReason)}data: [DONE]\n\n`, {
    headers: { 'content-type': 'text/event-stream' },
  })
}

function completion(text: string) {
  return sseResponse([{ role: 'assistant', content: text }])
}

function toolCompletion(name: string, args: Record<string, unknown> = {}, text: string | null = null, reasoning?: string) {
  return sseResponse([
    { role: 'assistant', content: text, reasoning_content: reasoning },
    { tool_calls: [{ index: 0, id: `call-${name}`, type: 'function', function: { name, arguments: JSON.stringify(args) } }] },
  ], 'tool_calls')
}

function musicOptions(): MusicToolOptions {
  const track: Track = {
    id: 'a',
    source: 'local',
    title: 'Song A',
    artist: 'Artist',
    album: 'Album',
    artwork: '',
    url: 'file:///private/a.mp3',
    duration: 180,
    createdAt: 1,
    modifiedAt: 1,
    fileSize: 100,
  }
  const trackB = { ...track, id: 'b', url: 'file:///private/b.mp3' }
  const trackC = { ...track, id: 'c', url: 'file:///private/c.mp3' }
  usePlayerStore.setState({ playbackMode: PlaybackMode.CLASSIC, queue: [track, trackB, trackC], originalQueue: [track, trackB, trackC], currentIndex: 0, mode: PlayMode.ORDERED, isPlaying: true, programme: [], nowPlayingSegmentIndex: 0 })
  return {
    library: { search: vi.fn().mockResolvedValue([track]), getTrack: vi.fn().mockResolvedValue(track) },
    context: { tracks: [] },
    session: { actions: [] },
  }
}

describe('deepSeek text chat transport', () => {
  it('authenticates with the configured token and returns real response text without speech requests', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('  适合，听起来很放松。  '))
    const client = createTextChatClient({ apiKey: '  test-token  ', fetch: fetchMock })

    expect(await client.reply(request)).toBe('适合，听起来很放松。')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe('https://api.deepseek.com/chat/completions')
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer test-token')
    const body = JSON.parse(String(init?.body))
    expect(body.model).toBe(DEEPSEEK_HOST_MODEL)
    expect(body.stream).toBe(true)
    expect(body.thinking).toEqual({ type: 'disabled' })
    expect(body.messages).toContainEqual({ role: 'user', content: '这首歌适合晚上听吗？' })
    expect(body.messages[0].content).toContain('夜航')
    expect(body).not.toHaveProperty('tools')
    expect(body).not.toHaveProperty('response_format')
  })

  it('generates a greeting with no music or previous conversation', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('晚上好。'))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await expect(client.reply({ ...request, messages: [], nowPlaying: null })).resolves.toBe('晚上好。')
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))
    expect(body.messages.at(-1)).toMatchObject({ role: 'user' })
    expect(body.messages.at(-1).content).toContain('打个招呼')
    expect(body.messages[0].content).toContain('"track":null')
  })

  it('bounds conversation context and excludes file paths, artwork and playback events', async () => {
    const messages: ChatMessage[] = Array.from({ length: 20 }, (_, index) => ({
      type: index % 2 === 0 ? 'user-turn' : 'host-turn',
      text: `${index}: ${'a'.repeat(2500)}`,
      timestamp: index,
    }))
    const privateTrack = { ...request.nowPlaying!, url: 'file:///private/music.mp3', artwork: 'content://private/artwork' }
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('好的。'))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await client.reply({ ...request, messages, nowPlaying: privateTrack })
    const serialized = String(fetchMock.mock.calls[0]![1]?.body)
    const body = JSON.parse(serialized)
    expect(body.messages).toHaveLength(13) // One system message and twelve conversation turns.
    expect(body.messages[1].content).toMatch(/^8:/)
    expect(body.messages.slice(1).every((message: { content: string }) => message.content.length <= 2000)).toBe(true)
    expect(serialized).not.toContain('file:///')
    expect(serialized).not.toContain('content://')
  })

  it('keeps an opening over already-playing music read-only even if the caller supplies tools', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('欢迎来到 Flow。'))
    const music = musicOptions()
    await createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({
      ...request,
      hostEvent: { type: 'opening' },
      music,
    })
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))
    expect(body).not.toHaveProperty('tools')
    expect(body.messages.at(-1).content).toContain('Flow 电台主持人')
    expect(body.messages[0].content).toContain('不编造创作背景')
    expect(music.session.actions).toEqual([])
  })

  it('adds a read-only transition cue after history and sends only public previous-song metadata', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('下一首，一起听。'))
    const previousTrack = { title: '上一首', artist: 'Artist', album: 'Album', url: 'file:///private/song.mp3', artwork: 'content://private/artwork' }
    await createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({
      ...request,
      hostEvent: { type: 'track-change', previousTrack },
      music: musicOptions(),
    })
    const serialized = String(fetchMock.mock.calls[0]![1]?.body)
    const body = JSON.parse(serialized)
    expect(body.messages.at(-1).content).toContain('不是听众发言')
    expect(body.messages.at(-1).content).toContain('不要再回答上一条用户请求')
    expect(body.messages[0].content).toContain('上一首')
    expect(body.messages[0].content).toContain('夜航')
    expect(body).not.toHaveProperty('tools')
    expect(serialized).not.toContain('file:///')
    expect(serialized).not.toContain('content://')
  })

  it('lets the opening choose a real non-first local song, display its introduction, then play it', async () => {
    const music = musicOptions()
    const [first, selected] = usePlayerStore.getState().queue
    vi.mocked(music.library.search).mockResolvedValue([first!, selected!])
    vi.mocked(music.library.getTrack).mockResolvedValue(selected!)
    usePlayerStore.setState({ queue: [], originalQueue: [], isPlaying: false })
    const visible: string[] = []
    const beforeTool = vi.fn(async () => {
      expect(visible.at(-1)).toBe('欢迎，先和你分享 Artist 的 Song B。')
      expect(usePlayerStore.getState().isPlaying).toBe(false)
    })
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'b' }, '欢迎，先和你分享 Artist 的 Song B。'))
      .mockResolvedValueOnce(completion('一起听。'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({
      ...request,
      messages: [],
      nowPlaying: null,
      isPlaying: false,
      hostEvent: { type: 'opening' },
      music,
      onText: text => visible.push(text),
      beforeTool,
    })).resolves.toBe('欢迎，先和你分享 Artist 的 Song B。\n\n一起听。')
    expect(music.library.search).toHaveBeenCalledWith('')
    expect(music.library.getTrack).toHaveBeenCalledWith('b')
    expect(beforeTool).toHaveBeenCalledOnce()
    expect(music.session.actions).toHaveLength(1)
    expect(usePlayerStore.getState()).toMatchObject({ isPlaying: true, queue: [selected], currentIndex: 0 })
    const bodies = fetchMock.mock.calls.map(call => JSON.parse(String(call[1]?.body)))
    expect(bodies[0].tools.map((entry: { function: { name: string } }) => entry.function.name)).toEqual(['searchSongs'])
    expect(bodies[0].tool_choice).toEqual({ type: 'function', function: { name: 'searchSongs' } })
    expect(bodies[1].tools.map((entry: { function: { name: string } }) => entry.function.name)).toEqual(['searchSongs', 'play'])
    expect(bodies[2].tool_choice).toBe('none')
    expect(JSON.stringify(bodies)).not.toContain('file:///')
  })

  it('does not let the opening play before it has introduced the chosen song', async () => {
    const music = musicOptions()
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'a' }))
      .mockResolvedValueOnce(completion('先为你介绍 Song A。'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.OPENING_NOT_PLAYED })
    expect(music.library.getTrack).not.toHaveBeenCalled()
    expect(music.session.actions).toEqual([])
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('does not let the opening play an ID outside the actual library results', async () => {
    const music = musicOptions()
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'invented' }, '一起听这首歌。'))
      .mockResolvedValueOnce(completion('没有找到对应歌曲。'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.OPENING_NOT_PLAYED })
    expect(music.library.getTrack).not.toHaveBeenCalled()
    expect(music.session.actions).toEqual([])
  })

  it('reports an incomplete opening instead of silently succeeding when the AI only introduces a song', async () => {
    const music = musicOptions()
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(completion('欢迎，先听 Song A。'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.OPENING_NOT_PLAYED })
    expect(music.session.actions).toEqual([])
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('welcomes an empty library without playing or falling back to channel tags', async () => {
    const music = musicOptions()
    vi.mocked(music.library.search).mockResolvedValue([])
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(completion('欢迎，目前还没有可播放的本地歌曲。'))
    await createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music })
    expect(music.library.search).toHaveBeenCalledExactlyOnceWith('')
    expect(music.library.getTrack).not.toHaveBeenCalled()
    expect(music.session.actions).toEqual([])
    expect(JSON.parse(String(fetchMock.mock.calls[1]![1]?.body)).tool_choice).toBe('none')
  })

  it('issues at most one opening play even when the model sends parallel play calls', async () => {
    const music = musicOptions()
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(sseResponse([
        { role: 'assistant', content: '欢迎，先听 Song A。' },
        { tool_calls: [
          { index: 0, id: 'first-play', type: 'function', function: { name: 'play', arguments: '{"trackId":"a"}' } },
          { index: 1, id: 'duplicate-play', type: 'function', function: { name: 'play', arguments: '{"trackId":"a"}' } },
        ] },
      ], 'tool_calls'))
      .mockResolvedValueOnce(completion('继续听。'))
    await createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music })
    expect(music.session.actions).toHaveLength(1)
    expect(music.library.getTrack).toHaveBeenCalledOnce()
  })

  it('does not play again when retrying an opening whose play succeeded but final reply failed', async () => {
    const music = musicOptions()
    usePlayerStore.getState().pause()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs'))
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'a' }, '欢迎，先听 Song A。'))
      .mockRejectedValueOnce(new Error('offline'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, isPlaying: false, hostEvent: { type: 'opening' }, music }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.NETWORK })
    expect(music.session.actions).toHaveLength(1)
    const retryFetch = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'a' }, '没有重复操作。'))
      .mockResolvedValueOnce(completion('继续听。'))
    await createTextChatClient({ apiKey: 'test-token', fetch: retryFetch }).reply({ ...request, isPlaying: true, hostEvent: { type: 'opening' }, music })
    expect(music.session.actions).toHaveLength(1)
    expect(music.library.getTrack).toHaveBeenCalledOnce()
    expect(JSON.parse(String(retryFetch.mock.calls[0]![1]?.body)).tool_choice).toBe('none')
  })

  it.each([
    [401, TextChatErrorCode.AUTHENTICATION],
    [403, TextChatErrorCode.AUTHENTICATION],
    [402, TextChatErrorCode.QUOTA],
    [429, TextChatErrorCode.RATE_LIMIT],
    [503, TextChatErrorCode.UNAVAILABLE],
  ])('sanitizes HTTP %i errors and leaves retries to the user', async (status, code) => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(Response.json({ error: { message: 'private provider details' } }, { status }))
    const client = createTextChatClient({ apiKey: 'private-test-token', fetch: fetchMock })
    await expect(client.reply(request)).rejects.toMatchObject({ code, message: code })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('reports network failure without leaking the original error', async () => {
    const fetchMock = vi.fn<TestFetch>().mockRejectedValue(new TypeError('fetch failed: private-token'))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await expect(client.reply(request)).rejects.toMatchObject({ code: TextChatErrorCode.NETWORK, message: TextChatErrorCode.NETWORK })
  })

  it('does not append a blank assistant reply', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('  '))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await expect(client.reply(request)).rejects.toMatchObject({ code: TextChatErrorCode.EMPTY_RESPONSE })
  })

  it('requires a token before creating a provider', () => {
    expect(() => createTextChatClient({ apiKey: '  ' })).toThrow(TextChatErrorCode.MISSING_TOKEN)
  })

  it('cancels before any HTTP request when the session has already ended', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchMock = vi.fn<TestFetch>()
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await expect(client.reply({ ...request, signal: controller.signal })).rejects.toMatchObject({ code: TextChatErrorCode.CANCELLED })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('works without modern AbortSignal methods that React Native does not provide', async () => {
    const unsupported = () => {
      throw new Error('Unsupported React Native API')
    }
    const spies = [
      vi.spyOn(AbortSignal, 'timeout').mockImplementation(unsupported),
      vi.spyOn(AbortSignal, 'any').mockImplementation(unsupported),
      vi.spyOn(AbortSignal.prototype, 'throwIfAborted').mockImplementation(unsupported),
    ]
    try {
      const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('你好。'))
      const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
      await expect(client.reply({ ...request, signal: new AbortController().signal })).resolves.toBe('你好。')
      spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
    }
    finally {
      spies.forEach(spy => spy.mockRestore())
    }
  })

  it('aborts a stalled request after 45 seconds and reports a safe timeout', async () => {
    vi.useFakeTimers()
    try {
      const fetchMock = vi.fn<TestFetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('Request aborted')))
      }))
      const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
      const result = expect(client.reply(request)).rejects.toMatchObject({ code: TextChatErrorCode.TIMEOUT })
      await vi.advanceTimersByTimeAsync(45_000)
      await result
      expect(fetchMock).toHaveBeenCalledOnce()
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('advertises music tools even when conversation history contains a text-only refusal', async () => {
    const fetchMock = vi.fn<TestFetch>().mockResolvedValue(completion('好的。'))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await client.reply({
      ...request,
      messages: [
        { type: 'host-turn', text: '我只能交流建议，不能播放或切歌。', timestamp: 1 },
        { type: 'user-turn', text: '下一首', timestamp: 2 },
      ],
      music: musicOptions(),
    })
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))
    expect(body.tools?.map((entry: { function: { name: string } }) => entry.function.name))
      .toEqual(['searchSongs', 'play', 'pause', 'previousSong', 'nextSong'])
    expect(body.messages[0].content).not.toContain('也没有播放器工具')
    expect(body.messages[0].content).toContain('历史回复不代表当前能力')
  })

  it('performs real SDK search and play tool rounds before returning text', async () => {
    const music = musicOptions()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('searchSongs', { query: 'Song A' }))
      .mockResolvedValueOnce(toolCompletion('play', { trackId: 'a' }))
      .mockResolvedValueOnce(completion('已提交播放 Song A。'))
    const client = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
    await expect(client.reply({ ...request, music })).resolves.toBe('已提交播放 Song A。')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(music.library.search).toHaveBeenCalledWith('Song A')
    expect(music.library.getTrack).toHaveBeenCalledWith('a')
    expect(music.session.actions).toHaveLength(1)
    expect(music.session.actions[0]).toMatchObject({ action: 'play', status: 'accepted' })
    const bodies = fetchMock.mock.calls.map(call => JSON.parse(String(call[1]?.body)))
    expect(bodies[0].tools.map((entry: { function: { name: string } }) => entry.function.name))
      .toEqual(['searchSongs', 'play', 'pause', 'previousSong', 'nextSong'])
    expect(bodies[1].messages.some((message: { role: string }) => message.role === 'tool')).toBe(true)
    expect(JSON.stringify(bodies)).not.toContain('file:///private/')
  })

  it('keeps the song introduction before a tool call as well as the final reply, but not reasoning', async () => {
    const music = musicOptions()
    const introduction = '这首 Song A 来自 Artist 的 Album。把这一段陪伴留给音乐。'
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('nextSong', {}, introduction, 'PRIVATE REASONING: do not display'))
      .mockResolvedValueOnce(completion('接下来是 Song B，我们继续听。'))
    const reply = await createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, music })
    expect(reply).toBe(`${introduction}\n\n接下来是 Song B，我们继续听。`)
    expect(reply).not.toContain('PRIVATE REASONING')
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(music.session.actions).toHaveLength(1)
  })

  it('shows streamed prose before the provider finishes and waits for UI paint before switching', async () => {
    const music = musicOptions()
    let source!: ReadableStreamDefaultController<Uint8Array>
    const body = new ReadableStream<Uint8Array>({ start: controller => source = controller })
    const encoder = new TextEncoder()
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(new Response(body, { headers: { 'content-type': 'text/event-stream' } }))
      .mockResolvedValueOnce(completion('继续听 Song B。'))
    const visible: string[] = []
    let releasePaint!: () => void
    const paint = new Promise<void>(resolve => releasePaint = resolve)
    const beforeTool = vi.fn(async () => {
      expect(visible.at(-1)).toBe('先介绍 Song A。')
      expect(usePlayerStore.getState().currentIndex).toBe(0)
      await paint
    })
    let finished = false
    const result = createTextChatClient({ apiKey: 'test-token', fetch: fetchMock })
      .reply({ ...request, music, onText: text => visible.push(text), beforeTool })
      .then((text) => {
        finished = true
        return text
      })

    source.enqueue(encoder.encode(sseChunk({ role: 'assistant', reasoning_content: 'PRIVATE REASONING' })))
    source.enqueue(encoder.encode(sseChunk({ content: '先介绍 ' })))
    await vi.waitFor(() => expect(visible).toEqual(['先介绍 ']))
    expect(finished).toBe(false)
    expect(usePlayerStore.getState().currentIndex).toBe(0)

    source.enqueue(encoder.encode(sseChunk({ content: 'Song A。' })))
    source.enqueue(encoder.encode(sseChunk({ tool_calls: [{ index: 0, id: 'call-nextSong', type: 'function', function: { name: 'nextSong', arguments: '{}' } }] })))
    source.enqueue(encoder.encode(`${sseChunk({}, 'tool_calls')}data: [DONE]\n\n`))
    source.close()
    await vi.waitFor(() => expect(beforeTool).toHaveBeenCalledOnce())
    expect(usePlayerStore.getState().currentIndex).toBe(0)
    expect(music.session.actions).toEqual([])
    releasePaint()

    await expect(result).resolves.toBe('先介绍 Song A。\n\n继续听 Song B。')
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(visible.at(-1)).toBe('先介绍 Song A。\n\n继续听 Song B。')
    expect(visible.join('')).not.toContain('PRIVATE REASONING')
  })

  it('cancels a pending paint barrier without executing the song command', async () => {
    const music = musicOptions()
    const controller = new AbortController()
    const beforeTool = vi.fn((signal: AbortSignal) => new Promise<void>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('cancelled')))
    }))
    const fetchMock = vi.fn<TestFetch>().mockResolvedValueOnce(toolCompletion('nextSong', {}, '先介绍 Song A。'))
    const result = expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, music, signal: controller.signal, beforeTool }))
      .rejects
      .toThrow('cancelled')
    await vi.waitFor(() => expect(beforeTool).toHaveBeenCalledOnce())
    controller.abort()
    await result
    expect(music.session.actions).toEqual([])
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('leaves partial prose visible when a later streamed round fails and sanitizes the failure', async () => {
    const music = musicOptions()
    const visible: string[] = []
    const fetchMock = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('nextSong', {}, '这是 Song A 的介绍。'))
      .mockRejectedValueOnce(new Error('private provider details'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, music, onText: text => visible.push(text) }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.NETWORK, message: TextChatErrorCode.NETWORK })
    expect(visible).toEqual(['这是 Song A 的介绍。'])
    expect(music.session.actions).toHaveLength(1)
  })

  it('does not repeat next when retrying a reply after the command already ran', async () => {
    const music = musicOptions()
    const firstFetch = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('nextSong'))
      .mockRejectedValueOnce(new TypeError('offline'))
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: firstFetch }).reply({ ...request, music }))
      .rejects
      .toMatchObject({ code: TextChatErrorCode.NETWORK })
    expect(usePlayerStore.getState().currentIndex).toBe(1)

    // Even if the provider ignores activeTools, the execution guard blocks replay.
    const retryFetch = vi.fn<TestFetch>()
      .mockResolvedValueOnce(toolCompletion('nextSong'))
      .mockResolvedValueOnce(completion('上一条切歌操作已提交，没有重复执行。'))
    await createTextChatClient({ apiKey: 'test-token', fetch: retryFetch }).reply({ ...request, music })
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(music.session.actions).toHaveLength(1)
    const body = JSON.parse(String(retryFetch.mock.calls[0]![1]?.body))
    expect(body.tools.map((entry: { function: { name: string } }) => entry.function.name)).toEqual(['searchSongs'])
    expect(body.messages[0].content).toContain('issuedActions')
  })

  it('limits a tool loop to five requests and forces a final text-only step', async () => {
    const music = musicOptions()
    const fetchMock = vi.fn<TestFetch>().mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body))
      return body.tool_choice === 'none'
        ? completion('搜索已完成。')
        : toolCompletion('searchSongs', { query: 'Song' })
    })
    await expect(createTextChatClient({ apiKey: 'test-token', fetch: fetchMock }).reply({ ...request, music })).resolves.toBe('搜索已完成。')
    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(music.library.search).toHaveBeenCalledTimes(4)
  })
})
