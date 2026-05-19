import { playerController, useDisplayTrack, usePlayerStore } from '@flow/player'
import { useCallback, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useColors } from '@/hooks/useColors'

interface ChatMessage {
  id: string
  role: 'user' | 'host'
  text: string
  kind: string
  timestamp: number
}

export default function RadioScreen() {
  const colors = useColors()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const listRef = useRef<FlatList<ChatMessage>>(null)

  const handlePlayPause = useCallback(() => {
    isPlaying ? playerController.pause() : playerController.play()
  }, [isPlaying])

  const handleSend = useCallback(() => {
    if (!inputText.trim())
      return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      kind: 'text',
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')

    // Stub: host acknowledgement
    setTimeout(() => {
      const hostMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'host',
        text: '好的，我来为你调整。',
        kind: 'acknowledgement',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, hostMsg])
    }, 1000)
  }, [inputText])

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user'
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.hostBubble]}>
        <Text style={[styles.messageText, { color: isUser ? '#fff' : colors.foreground }]}>
          {item.text}
        </Text>
      </View>
    )
  }, [colors.foreground])

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
        keyExtractor={item => item.id}
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
  // Timeline
  timeline: { flex: 1 },
  timelineContent: { padding: 16, gap: 8 },
  emptyTimeline: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
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
