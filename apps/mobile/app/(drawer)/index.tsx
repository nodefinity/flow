import type { ChannelStyle, ChatMessage } from '@flow/shared'
import { PlaybackMode, playerController, useDisplayTrack, usePlayerStore } from '@flow/player'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { useChatTimelineStore } from '@/modules/radio/chatTimelineStore'
import { generateProgramme } from '@/modules/radio/stubHost'

const DEFAULT_CHANNEL_STYLE: ChannelStyle = {}

export default function RadioScreen() {
  const colors = useColors()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const playbackMode = usePlayerStore.use.playbackMode()
  const nowPlayingSegmentIndex = usePlayerStore.use.nowPlayingSegmentIndex()
  const programme = usePlayerStore.use.programme()

  const messages = useChatTimelineStore(state => state.messages)
  const appendMessage = useChatTimelineStore(state => state.appendMessage)
  const clearTimeline = useChatTimelineStore(state => state.clearTimeline)

  const [inputText, setInputText] = useState('')
  const listRef = useRef<FlatList<ChatMessage>>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (hasStarted)
      return
    const start = async () => {
      const prog = await generateProgramme(DEFAULT_CHANNEL_STYLE)
      if (prog.length === 0)
        return
      clearTimeline()
      playerController.loadProgramme(prog)
      setHasStarted(true)
    }
    start()
  }, [hasStarted, clearTimeline])

  useEffect(() => {
    if (playbackMode !== PlaybackMode.RADIO)
      return
    const segment = programme[nowPlayingSegmentIndex]
    if (!segment || segment.kind !== 'track')
      return

    appendMessage({
      type: 'now-playing',
      track: segment.track,
      timestamp: Date.now(),
    })
  }, [playbackMode, nowPlayingSegmentIndex, programme, appendMessage])

  useEffect(() => {
    const unsub = playerController.onSegmentEnd((segment) => {
      if (segment.kind === 'interlude') {
        appendMessage({
          type: 'interlude',
          script: segment.script,
          timestamp: Date.now(),
        })
      }
    })
    return unsub
  }, [appendMessage])

  const handlePlayPause = useCallback(() => {
    isPlaying ? playerController.pause() : playerController.play()
  }, [isPlaying])

  const handleSend = useCallback(() => {
    if (!inputText.trim())
      return

    appendMessage({
      type: 'user-turn',
      text: inputText.trim(),
      timestamp: Date.now(),
    })
    setInputText('')

    // TODO: (#48): replace stub with real Host Service intervention
    setTimeout(() => {
      appendMessage({
        type: 'host-turn',
        text: '好的，我来为你调整。',
        timestamp: Date.now(),
      })
    }, 1000)
  }, [inputText, appendMessage])

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    if (item.type === 'now-playing') {
      return (
        <View style={[styles.nowPlayingCard, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.nowPlayingLabel, { color: colors.mutedForeground }]}>Now Playing</Text>
          <Text style={[styles.nowPlayingTitle, { color: colors.foreground }]}>{item.track.title}</Text>
          <Text style={[styles.nowPlayingArtist, { color: colors.mutedForeground }]}>{item.track.artist}</Text>
        </View>
      )
    }

    if (item.type === 'interlude') {
      return (
        <View style={[styles.messageBubble, styles.hostBubble]}>
          <Text style={[styles.messageText, { color: colors.foreground }]}>{item.script}</Text>
        </View>
      )
    }

    const isUser = item.type === 'user-turn'
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.hostBubble]}>
        <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.foreground }]}>
          {item.text}
        </Text>
      </View>
    )
  }, [colors])

  const keyExtractor = useCallback((_: ChatMessage, index: number) => String(index), [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top: Now Playing */}
      <View style={[styles.nowPlaying, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {displayTrack
          ? (
              <View style={styles.nowPlayingContent}>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {displayTrack.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {displayTrack.artist}
                  </Text>
                </View>
                <View style={styles.waveformPlaceholder}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>[~~~]</Text>
                </View>
                <Pressable onPress={handlePlayPause} hitSlop={8}>
                  <Text style={{ color: colors.foreground, fontSize: 24 }}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </Pressable>
              </View>
            )
          : (
              <Text style={[styles.noTrack, { color: colors.mutedForeground }]}>
                等待播放...
              </Text>
            )}
      </View>

      {/* Middle: Chat Timeline */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        ListEmptyComponent={(
          <View style={styles.emptyTimeline}>
            <Text style={{ color: colors.mutedForeground }}>
              欢迎收听 Flow Radio
            </Text>
          </View>
        )}
      />

      {/* Bottom: Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="说点什么..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.secondary }]}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} style={styles.sendBtn} hitSlop={8}>
          <Text style={{ color: colors.primary, fontSize: 18 }}>↑</Text>
        </Pressable>
        <Pressable style={styles.micBtn} hitSlop={8}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>🎙</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Now Playing
  nowPlaying: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  nowPlayingContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trackInfo: { flex: 1, marginRight: 12 },
  trackTitle: { fontSize: 16, fontWeight: '600' },
  trackArtist: { fontSize: 13, marginTop: 2 },
  noTrack: { fontSize: 14 },
  waveformPlaceholder: { marginRight: 12 },
  // Timeline
  timeline: { flex: 1 },
  timelineContent: { padding: 16, gap: 8 },
  emptyTimeline: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  nowPlayingCard: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  nowPlayingLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  nowPlayingTitle: { fontSize: 15, fontWeight: '600' },
  nowPlayingArtist: { fontSize: 13, marginTop: 2 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: 'hsl(38 92% 50%)' },
  hostBubble: { alignSelf: 'flex-start', backgroundColor: 'hsl(30 8% 18%)' },
  messageText: { fontSize: 15, lineHeight: 20 },
  // Input Bar
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  input: { flex: 1, height: 36, borderRadius: 18, paddingHorizontal: 14, fontSize: 15 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  micBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
})
