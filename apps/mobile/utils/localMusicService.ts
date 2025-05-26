import type { Track } from '@/constants/PlayList'
import * as DocumentPicker from 'expo-document-picker'
import * as MediaLibrary from 'expo-media-library'

/**
 * 请求访问媒体库的权限
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * 从设备音乐库获取本地音频文件
 */
export async function getLocalMusicTracks(): Promise<Track[]> {
  try {
    // 检查权限
    const hasPermission = await requestMediaLibraryPermissions()
    if (!hasPermission) {
      console.warn('没有访问媒体库的权限')
      return []
    }

    // 获取音频文件
    const assets = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 100, // 限制获取数量
      sortBy: [MediaLibrary.SortBy.modificationTime], // 按修改时间排序
    })

    // 转换为 Track 格式
    const tracks: Track[] = assets.assets.map((asset: MediaLibrary.Asset) => ({
      id: `local-${asset.id}`,
      url: asset.uri, // 本地文件 URI
      title: asset.filename.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
      artwork: 'https://via.placeholder.com/300x300?text=Music', // 默认封面，实际项目中可以提取专辑封面
      artist: '未知艺术家', // MediaLibrary API 可能不包含艺术家信息
    }))

    return tracks
  }
  catch (error) {
    console.error('获取本地音乐时出错:', error)
    return []
  }
}

/**
 * 获取音频文件的详细信息（包括元数据）
 */
export async function getAudioFileInfo(assetId: string): Promise<MediaLibrary.AssetInfo | null> {
  try {
    const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId)
    return assetInfo
  }
  catch (error) {
    console.error('获取音频文件信息时出错:', error)
    return null
  }
}

/**
 * 扫描指定相册中的音频文件
 */
export async function getMusicFromAlbum(albumId: string): Promise<Track[]> {
  try {
    const assets = await MediaLibrary.getAssetsAsync({
      album: albumId,
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    })

    const tracks: Track[] = assets.assets.map((asset: MediaLibrary.Asset) => ({
      id: `album-${albumId}-${asset.id}`,
      url: asset.uri,
      title: asset.filename.replace(/\.[^/.]+$/, ''),
      artwork: 'https://via.placeholder.com/300x300?text=Album',
      artist: '专辑艺术家',
    }))

    return tracks
  }
  catch (error) {
    console.error('从相册获取音乐时出错:', error)
    return []
  }
}

/**
 * 获取所有音频相册
 */
export async function getMusicAlbums(): Promise<MediaLibrary.Album[]> {
  try {
    const albums = await MediaLibrary.getAlbumsAsync()
    return albums
  }
  catch (error) {
    console.error('获取音频相册时出错:', error)
    return []
  }
}

/**
 * 使用文档选择器让用户选择音频文件
 */
export async function pickAudioFiles(): Promise<Track[]> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      multiple: true,
      copyToCacheDirectory: false, // 不复制到缓存目录，直接使用原始URI
    })

    if (!result.canceled && result.assets) {
      const tracks: Track[] = result.assets.map((asset, index) => ({
        id: `picked-${Date.now()}-${index}`,
        url: asset.uri,
        title: asset.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
        artwork: 'https://via.placeholder.com/300x300?text=Audio', // 默认封面
        artist: '用户选择',
      }))

      return tracks
    }

    return []
  }
  catch (error) {
    console.error('选择音频文件时出错:', error)
    return []
  }
}
