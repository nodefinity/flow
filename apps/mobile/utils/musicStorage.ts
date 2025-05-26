import type { Track } from '@/constants/PlayList'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOCAL_TRACKS_KEY = 'localTracks'

/**
 * 保存本地音乐到存储
 */
export async function saveLocalTracks(tracks: Track[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(tracks))
    console.log(`已保存 ${tracks.length} 首本地音乐`)
  }
  catch (error) {
    console.error('保存本地音乐失败:', error)
  }
}

/**
 * 从存储中读取本地音乐
 */
export async function loadLocalTracks(): Promise<Track[]> {
  try {
    const tracksJson = await AsyncStorage.getItem(LOCAL_TRACKS_KEY)
    if (tracksJson) {
      const tracks = JSON.parse(tracksJson) as Track[]
      console.log(`已加载 ${tracks.length} 首本地音乐`)
      return tracks
    }
    return []
  }
  catch (error) {
    console.error('加载本地音乐失败:', error)
    return []
  }
}

/**
 * 添加新的本地音乐到现有列表
 */
export async function addLocalTracks(newTracks: Track[]): Promise<Track[]> {
  try {
    const existingTracks = await loadLocalTracks()

    // 去重：基于 ID 或 URL 去重
    const existingIds = new Set(existingTracks.map(track => track.id))
    const uniqueNewTracks = newTracks.filter(track => !existingIds.has(track.id))

    const combinedTracks = [...existingTracks, ...uniqueNewTracks]
    await saveLocalTracks(combinedTracks)

    console.log(`添加了 ${uniqueNewTracks.length} 首新音乐，总计 ${combinedTracks.length} 首`)
    return combinedTracks
  }
  catch (error) {
    console.error('添加本地音乐失败:', error)
    return []
  }
}

/**
 * 清除所有本地音乐
 */
export async function clearLocalTracks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_TRACKS_KEY)
    console.log('已清除所有本地音乐')
  }
  catch (error) {
    console.error('清除本地音乐失败:', error)
  }
}

/**
 * 获取本地音乐数量
 */
export async function getLocalTracksCount(): Promise<number> {
  try {
    const tracks = await loadLocalTracks()
    return tracks.length
  }
  catch (error) {
    console.error('获取本地音乐数量失败:', error)
    return 0
  }
}
