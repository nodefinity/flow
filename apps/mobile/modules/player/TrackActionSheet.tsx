import type { Track } from '@flow/core'
import { useTrackStore } from '@flow/store'
import BottomSheet, { BottomSheetBackdrop, BottomSheetFooter, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { Easing, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { useTrackActionSheet } from '@/hooks/useTrackActionSheet'

const actionItems = [
  { icon: 'skip-next', label: '下一首播放', action: 'next' },
  { icon: 'playlist-plus', label: '加入歌单', action: 'addToPlaylist' },
  { icon: 'heart-outline', label: '收藏', action: 'favorite' },
  { icon: 'share', label: '分享', action: 'share' },
  { icon: 'account-music', label: '查看歌手', action: 'viewArtist' },
  { icon: 'album', label: '查看专辑', action: 'viewAlbum' },
  { icon: 'information', label: '歌曲信息', action: 'info' },
  { icon: 'delete', label: '删除', action: 'delete' },
]

export default function TrackActionSheet() {
  const { colors } = useTheme()
  const localTracks = useTrackStore.use.localTracks()
  const remoteTracks = useTrackStore.use.remoteTracks()
  const tracks = [...localTracks, ...remoteTracks]
  const { visible, currentTrack, hide } = useTrackActionSheet()

  const bottomSheetRef = useRef<BottomSheet>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // 设置 snapPoints：50% 和 90%
  const snapPoints = useMemo(() => ['50%', '95%'], [])

  // 动画配置
  const animationConfigs = useMemo(
    () => ({
      duration: 350,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // 更自然的贝塞尔曲线
    }),
    [],
  )

  // 动画状态
  const animatedIndex = useSharedValue(-1)

  React.useEffect(() => {
    if (visible) {
      // 重置展开状态
      setIsExpanded(false)
      // 使用 withSpring 创建弹性动画
      animatedIndex.value = withSpring(0, {
        damping: 18,
        stiffness: 250,
        mass: 0.9,
      })
      // 初始展开到第一个 snapPoint (50%)
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0)
      }, 50)
    }
    else {
      // 使用 withTiming 创建平滑的关闭动画
      animatedIndex.value = withTiming(-1, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      })
      bottomSheetRef.current?.close()
    }
  }, [visible])

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      hide()
    }
    else if (index === 1) {
      // 当用户手动拖拽到 90% 时，更新状态
      setIsExpanded(true)
    }
    else if (index === 0) {
      // 当用户手动拖拽回 50% 时，更新状态
      setIsExpanded(false)
    }
  }, [hide])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        onPress={hide}
        enableTouchThrough={false}
        style={[
          props.style,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        ]}
      />
    ),
    [hide],
  )

  const handleAction = (action: string) => {
    console.log('Action:', action)
    // TODO: 实现具体的操作逻辑
    hide()
  }

  // 处理滚动事件，当用户向下滚动时自动展开
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent
    console.log('滚动位置:', contentOffset.y, '是否已展开:', isExpanded)

    // 当用户向下滚动超过 50px 且当前是 50% 高度时，自动展开到 90%
    if (contentOffset.y > 50 && !isExpanded) {
      console.log('触发自动展开到 90%')
      setIsExpanded(true)
      bottomSheetRef.current?.snapToIndex(1) // 展开到第二个 snapPoint (90%)
    }
  }, [isExpanded])

  const renderQueueItem = ({ item }: { item: Track }) => (
    <View style={styles.queueItem}>
      <Image source={{ uri: item.artwork }} style={styles.queueItemImage} />
      <View style={styles.queueItemInfo}>
        <Text numberOfLines={1} style={[styles.queueItemTitle, { color: colors.onSurface }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[styles.queueItemArtist, { color: colors.onSurfaceVariant }]}>
          {item.artist}
        </Text>
      </View>
      {currentTrack?.id === item.id && (
        <IconButton icon="volume-high" size={16} />
      )}
    </View>
  )

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <View style={[styles.actionsContainer]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsContent}
          >
            {actionItems.map(item => (
              <View key={item.icon} style={styles.actionItem}>
                <IconButton
                  icon={item.icon}
                  size={24}
                  onPress={() => handleAction(item.action)}
                  style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
                />
                <Text style={[styles.actionLabel, { color: colors.onSurface }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </BottomSheetFooter>
    ),
    [],
  )

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      maxDynamicContentSize={Dimensions.get('window').height * 0.95}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.onSurfaceVariant,
        width: 40,
        height: 4,
      }}
      animationConfigs={animationConfigs}
      animateOnMount={true}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      footerComponent={renderFooter}
    >
      <BottomSheetView style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>正在播放</Text>
      </BottomSheetView>
      <BottomSheetScrollView style={[styles.queueContainer]}>
        <FlashList
          data={tracks}
          renderItem={renderQueueItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={60}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.queueContainer}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    height: 40,
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 14,
  },
  queueContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 120,
    marginTop: 40,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  queueItemImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 12,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  queueItemArtist: {
    fontSize: 14,
  },
  actionsContainer: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    backgroundColor: 'white',
  },
  actionsContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  actionItem: {
    alignItems: 'center',
    width: 80,
  },
  actionButton: {
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  tabContainer: {
    flex: 1,
  },
})
