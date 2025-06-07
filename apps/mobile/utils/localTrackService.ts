import { Platform } from 'react-native'
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions'

function getMusicPermission() {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.MEDIA_LIBRARY
  }
  else if (Platform.OS === 'android') {
    // Android 13 (API 33) and above use granular media permissions
    const androidVersion
      = typeof Platform.Version === 'string'
        ? Number.parseInt(Platform.Version, 10)
        : Platform.Version

    if (androidVersion >= 33) {
      return PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
    }
    else {
      // Android 12 and below use traditional storage permissions
      return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
    }
  }
  else {
    return null
  }
}

export async function requestMusicPermission(): Promise<boolean> {
  try {
    const permission = getMusicPermission()

    if (!permission) {
      console.warn('Do not support this platform')
      return true
    }

    const result = await request(permission)
    return result === RESULTS.GRANTED
  }
  catch (error) {
    console.error('Request permission error:', error)
    return false
  }
}

/**
 * 扫描指定相册中的音频文件
 */
// export async function getMusicFromAlbum(albumId: string): Promise<Track[]> {
//   try {
//     const assets = await MediaLibrary.getAssetsAsync({
//       album: albumId,
//       mediaType: MediaLibrary.MediaType.audio,
//       first: 1000,
//     })

//     const tracks: Track[] = assets.assets.map((asset: MediaLibrary.Asset) => ({
//       id: `album-${albumId}-${asset.id}`,
//       url: asset.uri,
//       title: asset.filename.replace(/\.[^/.]+$/, ''),
//       artwork: 'https://via.placeholder.com/300x300?text=Album',
//       artist: '专辑艺术家',
//     }))

//     return tracks
//   }
//   catch (error) {
//     console.error('Get music from album error:', error)
//     return []
//   }
// }

// /**
//  * 获取所有音频相册
//  */
// export async function getMusicAlbums(): Promise<MediaLibrary.Album[]> {
//   try {
//     const albums = await MediaLibrary.getAlbumsAsync()
//     return albums
//   }
//   catch (error) {
//     console.error('Get audio albums error:', error)
//     return []
//   }
// }

// /**
//  * 使用文档选择器让用户选择音频文件
//  */
// export async function pickAudioFiles(): Promise<Track[]> {
//   try {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: 'audio/*',
//       multiple: true,
//       copyToCacheDirectory: false, // 不复制到缓存目录，直接使用原始URI
//     })

//     if (!result.canceled && result.assets) {
//       const tracks: Track[] = result.assets.map((asset, index) => ({
//         id: `picked-${Date.now()}-${index}`,
//         url: asset.uri,
//         title: asset.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
//         artwork: 'https://via.placeholder.com/300x300?text=Audio', // 默认封面
//         artist: '用户选择',
//       }))

//       return tracks
//     }

//     return []
//   }
//   catch (error) {
//     console.error('Pick audio files error:', error)
//     return []
//   }
// }
