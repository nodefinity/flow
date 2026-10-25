import type { Channel, ChatMessage } from '@flow/shared'
import type { ComponentProps } from 'react'
import type { ListRenderItemInfo } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { formatDuration, HostVoice, useTranslation } from '@flow/shared'
import { onSegmentEnd, onSegmentStart, PlaybackMode, TextChatErrorCode, useChatTimelineStore, useDisplayTrack, usePlaybackStore, usePlayerStore } from '@flow/store'
import { DrawerActions } from '@react-navigation/native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/hooks/useColors'
import { programmeManager } from '@/modules/radio/programmeManager'
import { useRadioChat } from '@/modules/radio/use-radio-chat'

const DEFAULT_CHANNEL: Channel = {
  id: 0,
  name: 'Flow Radio',
  descriptor: '雨夜电台',
  style: {
    energyLevel: 'low',
    moodTags: ['quiet', 'night', 'rain'],
  },
  hostVoice: HostVoice.DEFAULT,
}

type AppColors = ReturnType<typeof useColors>
type IconName = ComponentProps<typeof Ionicons>['name']

function IconButton({
  accessibilityLabel,
  colors,
  disabled = false,
  icon,
  onPress,
  size = 48,
}: {
  accessibilityLabel: string
  colors: AppColors
  disabled?: boolean
  icon: IconName
  onPress: () => void
  size?: number
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          backgroundColor: colors.heroSurface,
          borderColor: colors.heroBorder,
          opacity: disabled ? 0.34 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={colors.heroForeground}
      />
    </Pressable>
  )
}

function Artwork({
  artwork,
  colors,
  compact,
  size,
}: {
  artwork?: string
  colors: AppColors
  compact: boolean
  size: number
}) {
  return (
    <View
      style={[
        styles.artworkFrame,
        compact && styles.compactArtworkFrame,
        {
          width: size,
          height: size,
          borderColor: colors.heroBorder,
          boxShadow: `0 24px 60px ${colors.heroShadow}`,
        },
      ]}
    >
      {artwork
        ? <Image source={{ uri: artwork }} contentFit="cover" style={StyleSheet.absoluteFill} transition={250} />
        : (
            <LinearGradient
              colors={[colors.artworkStart, colors.artworkEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.artworkFallback}
            >
              <View style={[styles.artworkOrbit, { borderColor: colors.heroBorder }]} />
              <View style={[styles.artworkCore, { backgroundColor: colors.heroSurface }]}>
                <Ionicons name="radio-outline" color={colors.heroForeground} size={compact ? 26 : 38} />
              </View>
            </LinearGradient>
          )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.26)']}
        style={[StyleSheet.absoluteFill, styles.pointerEventsNone]}
      />
    </View>
  )
}

export default function RadioScreen() {
  const colors = useColors()
  const navigation = useNavigation()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { inputText, setInputText, isSending, errorCode, streamingReply, submit, retry } = useRadioChat(i18n.language)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const position = usePlaybackStore.use.position()

  const messages = useChatTimelineStore(state => state.messages)
  const appendMessage = useChatTimelineStore(state => state.appendMessage)

  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const listRef = useRef<FlatList<ChatMessage>>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    return onSegmentStart((segment, index) => {
      const playerState = usePlayerStore.getState()
      if (
        playerState.playbackMode !== PlaybackMode.RADIO
        || playerState.nowPlayingSegmentIndex !== index
        || playerState.programme[index] !== segment
      ) {
        return
      }

      if (segment.kind === 'track') {
        appendMessage({ type: 'now-playing', track: segment.track, timestamp: Date.now() })
        return
      }

      appendMessage({ type: 'interlude', script: segment.script, timestamp: Date.now() })
    })
  }, [appendMessage])

  useEffect(() => {
    return onSegmentEnd((segment, index) => programmeManager.onSegmentEnd(segment, index))
  }, [])

  const trackTitle = displayTrack?.title || '正在准备今晚的节目'
  const duration = displayTrack?.duration ?? 0
  const playbackProgress = duration > 0 ? Math.min(position / duration, 1) : 0
  const trackArtist = useMemo(() => {
    if (!displayTrack)
      return 'Host 正在从你的音乐里挑选'
    return [displayTrack.artist, displayTrack.album].filter(Boolean).join(' · ') || DEFAULT_CHANNEL.name
  }, [displayTrack])

  const handlePlayPause = useCallback(() => {
    const { pause, play } = usePlayerStore.getState()
    isPlaying ? pause() : play()
  }, [isPlaying])

  const renderMessage = useCallback(({ item }: ListRenderItemInfo<ChatMessage>) => {
    if (item.type === 'now-playing') {
      return (
        <View style={[styles.timelineTrack, { backgroundColor: colors.secondary }]}>
          <View style={[styles.timelineIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="musical-note" size={14} color={colors.primary} />
          </View>
          <View style={styles.timelineCopy}>
            <Text style={[styles.timelineTitle, { color: colors.foreground }]} numberOfLines={1}>{item.track.title}</Text>
            <Text style={[styles.timelineArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.track.artist}</Text>
          </View>
        </View>
      )
    }

    if (item.type === 'interlude') {
      return (
        <View style={styles.hostMessageRow}>
          <View style={[styles.messageAvatar, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
          </View>
          <View style={styles.messageColumn}>
            <View style={[styles.chatBubble, styles.hostBubble, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.hostMessageText, { color: colors.foreground }]}>{item.script}</Text>
            </View>
          </View>
        </View>
      )
    }

    const isUser = item.type === 'user-turn'
    return (
      <View style={[styles.turnRow, isUser && styles.userTurnRow]}>
        <View style={[styles.chatBubble, { backgroundColor: isUser ? colors.primarySoft : colors.secondary }]}>
          <Text style={[styles.turnText, { color: colors.foreground }]}>{item.text}</Text>
        </View>
      </View>
    )
  }, [colors])

  return (
    <View style={[styles.root, { backgroundColor: colors.ambientBottom }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.heroStart, colors.heroEnd, colors.ambientBridge, colors.ambientTop, colors.ambientBottom]}
        locations={[0, 0.2, 0.43, 0.68, 1]}
        style={[StyleSheet.absoluteFill, styles.pointerEventsNone]}
      />
      {displayTrack?.artwork && (
        <Image
          source={{ uri: displayTrack.artwork }}
          blurRadius={64}
          contentFit="cover"
          style={[styles.playerBackdrop, { height: Math.max(width * 1.25, 480) }]}
          transition={700}
        />
      )}
      <LinearGradient
        colors={['rgba(2, 12, 9, 0.10)', 'rgba(2, 12, 9, 0.42)', 'rgba(2, 12, 9, 0.08)', 'transparent']}
        locations={[0, 0.2, 0.46, 0.7]}
        style={[StyleSheet.absoluteFill, styles.pointerEventsNone]}
      />

      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={0}
        style={styles.screen}
      >
        <View style={styles.main}>
          <View
            style={[
              styles.playerCard,
              {
                paddingHorizontal: width < 380 ? 14 : 18,
                paddingTop: insets.top + 16,
              },
            ]}
          >
            <View style={styles.playerSummary}>
              <IconButton
                accessibilityLabel={t('navigation.openMenu')}
                colors={colors}
                icon="menu-outline"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                size={36}
              />
              <Artwork artwork={displayTrack?.artwork} colors={colors} compact size={58} />
              <View style={styles.playerCopy}>
                <Text style={[styles.nowPlayingLabel, { color: colors.primary }]}>正在播放</Text>
                <Text style={[styles.miniTrackTitle, { color: colors.heroForeground }]} numberOfLines={1}>{trackTitle}</Text>
                <Text style={[styles.miniTrackArtist, { color: colors.heroMuted }]} numberOfLines={1}>{trackArtist}</Text>
              </View>
              <IconButton
                accessibilityLabel={isPlaying ? '暂停 Channel' : '播放 Channel'}
                colors={colors}
                disabled={!displayTrack}
                icon={isPlaying ? 'pause' : 'play'}
                onPress={handlePlayPause}
                size={42}
              />
            </View>

            <View style={styles.miniProgressArea}>
              <View style={[styles.progressTrack, { backgroundColor: colors.heroSurface }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${playbackProgress * 100}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.heroMuted }]}>{formatDuration(position)}</Text>
                <Text style={[styles.timeText, { color: colors.heroMuted }]}>{duration > 0 ? formatDuration(duration) : '--:--'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.chatPanel}>
            <FlatList
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => `${item.type}-${item.timestamp}-${index}`}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={messages.length === 0 ? styles.emptyTimeline : styles.timelineContent}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              ListFooterComponent={(
                <View style={styles.chatFeedback}>
                  {streamingReply !== '' && (
                    <View style={styles.turnRow}>
                      <View style={[styles.chatBubble, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.turnText, { color: colors.foreground }]}>{streamingReply}</Text>
                      </View>
                    </View>
                  )}
                  {isSending && (
                    <View accessibilityLiveRegion="polite" style={styles.sendingRow}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={{ color: colors.mutedForeground }}>{t('home.chat.sending')}</Text>
                    </View>
                  )}
                  {errorCode && (
                    <View accessibilityLiveRegion="polite" style={styles.chatFeedback}>
                      <Text style={[styles.turnText, { color: colors.foreground }]}>{t(`home.chat.errors.${errorCode}`)}</Text>
                      <View style={styles.sendingRow}>
                        <Pressable accessibilityRole="button" onPress={() => router.navigate('/setting')} style={styles.feedbackButton}>
                          <Text style={{ color: colors.primary }}>{t('home.chat.configure')}</Text>
                        </Pressable>
                        {errorCode !== TextChatErrorCode.MISSING_TOKEN && (
                          <Pressable accessibilityRole="button" onPress={retry} style={styles.feedbackButton}>
                            <Text style={{ color: colors.primary }}>{t('home.chat.retry')}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
              onContentSizeChange={() => {
                if (messages.length > 0)
                  listRef.current?.scrollToEnd({ animated: streamingReply === '' })
              }}
            />
          </View>
        </View>

        <View
          style={[
            styles.composer,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              paddingHorizontal: width < 380 ? 12 : 16,
            },
          ]}
        >
          <View style={[styles.inputShell, { backgroundColor: colors.surfaceRaised, borderColor: isComposerFocused ? colors.primary : colors.border, boxShadow: `0 8px 24px ${colors.shadow}` }]}>
            <View style={[styles.inputIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="sparkles" size={17} color={colors.primary} />
            </View>
            <TextInput
              ref={inputRef}
              value={inputText}
              editable={!isSending}
              maxLength={2000}
              accessibilityLabel="输入你想听的内容"
              onBlur={() => setIsComposerFocused(false)}
              onChangeText={setInputText}
              onFocus={() => setIsComposerFocused(true)}
              onSubmitEditing={submit}
              placeholder="想听什么，直接说…"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="send"
              selectionColor={colors.primary}
              style={[styles.input, { color: colors.foreground }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(isSending ? 'home.chat.sending' : 'home.chat.send')}
              accessibilityState={{ disabled: isSending }}
              disabled={isSending}
              hitSlop={4}
              onPress={() => inputText.trim() ? submit() : inputRef.current?.focus()}
              style={({ pressed }) => [styles.sendButton, { backgroundColor: colors.primary, opacity: isSending ? 0.45 : pressed ? 0.72 : 1 }]}
            >
              <Ionicons name="arrow-up" size={19} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pointerEventsNone: { pointerEvents: 'none' },
  screen: { flex: 1, minHeight: 0 },
  main: { flex: 1, minHeight: 0, paddingBottom: 8 },
  playerCard: { flexShrink: 0, overflow: 'hidden', paddingBottom: 18 },
  playerBackdrop: { position: 'absolute', top: -36, left: -48, right: -48, opacity: 0.78, transform: [{ scale: 1.12 }] },
  playerSummary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playerCopy: { flex: 1, minWidth: 0 },
  artworkFrame: { overflow: 'hidden', borderWidth: 1, borderRadius: 42, borderCurve: 'continuous' },
  compactArtworkFrame: { borderRadius: 24 },
  artworkFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  artworkOrbit: { position: 'absolute', width: '72%', height: '72%', borderWidth: 1, borderRadius: 999 },
  artworkCore: { width: '40%', height: '40%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  nowPlayingLabel: { fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0.8 },
  miniTrackTitle: { marginTop: 2, fontSize: 15, lineHeight: 19, fontWeight: '700', letterSpacing: -0.2 },
  miniTrackArtist: { marginTop: 1, fontSize: 11, lineHeight: 15 },
  miniProgressArea: { marginTop: 12 },
  progressTrack: { height: 3, overflow: 'hidden', borderRadius: 999 },
  progressFill: { height: 3, borderRadius: 999 },
  timeRow: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 8, fontWeight: '600', fontVariant: ['tabular-nums'] },
  iconButton: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  chatPanel: { flex: 1, minHeight: 0, paddingHorizontal: 18, paddingTop: 10 },
  chatFeedback: { gap: 8, paddingTop: 8 },
  sendingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  timelineContent: { paddingTop: 8, paddingBottom: 18 },
  emptyTimeline: { flexGrow: 1 },
  timelineTrack: { minHeight: 48, paddingHorizontal: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  timelineIcon: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  timelineCopy: { flex: 1, minWidth: 0 },
  timelineTitle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  timelineArtist: { marginTop: 1, fontSize: 10, lineHeight: 13 },
  hostMessageRow: { maxWidth: '90%', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  messageAvatar: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  messageColumn: { flex: 1 },
  chatBubble: { maxWidth: '88%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 17, borderCurve: 'continuous' },
  hostBubble: { maxWidth: '100%', borderTopLeftRadius: 6 },
  hostMessageText: { fontSize: 13, lineHeight: 20 },
  turnRow: { maxWidth: '88%' },
  userTurnRow: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  turnText: { fontSize: 13, lineHeight: 20 },
  composer: { flexShrink: 0, paddingTop: 8, gap: 9 },
  inputShell: { height: 54, paddingLeft: 7, paddingRight: 5, borderWidth: 1, borderRadius: 20, borderCurve: 'continuous', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 52, minWidth: 0, paddingHorizontal: 11, fontSize: 14 },
  sendButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
})
