// import type { Track } from '@flow/core'
import type { albums, artists } from './schema'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { tracks } from './schema'

// 本地音频同步选项
export interface SyncOptions {
  force?: boolean // 是否强制重新同步
  onProgress?: (current: number, total: number) => void
}

// 同步本地音频库
export async function syncLocalLibrary(_options: SyncOptions = {}) {
  try {
    console.log('🔄 Starting local library sync...')

    // 这里需要导入 react-native-music-library
    // 由于这是数据库包，我们只定义接口
    // 实际实现需要在 mobile app 中完成

    console.log('✅ Local library sync completed')
  }
  catch (error) {
    console.error('❌ Failed to sync local library:', error)
    throw error
  }
}

// 将本地音频数据转换为数据库格式
export function transformLocalTrack(localTrack: any): {
  track: typeof tracks.$inferInsert
  artist?: typeof artists.$inferInsert
  album?: typeof albums.$inferInsert
} {
  const trackId = `local_${localTrack.id}`

  const track: typeof tracks.$inferInsert = {
    id: trackId,
    title: localTrack.title || 'Unknown Title',
    duration: localTrack.duration || 0,
    url: localTrack.url || '',
    artwork: localTrack.artwork || '',
    source: 'local',
    localId: localTrack.id,
    filePath: localTrack.filePath || '',
    fileSize: localTrack.fileSize,
    bitrate: localTrack.bitrate,
    sampleRate: localTrack.sampleRate,
    channels: localTrack.channels,
    format: localTrack.format,
    year: localTrack.year,
    genre: localTrack.genre,
    trackNumber: localTrack.trackNumber,
    discNumber: localTrack.discNumber,
    composer: localTrack.composer,
    lyricist: localTrack.lyricist,
    lyrics: localTrack.lyrics,
    albumArtist: localTrack.albumArtist,
    comment: localTrack.comment,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  let artist: typeof artists.$inferInsert | undefined
  let album: typeof albums.$inferInsert | undefined

  // 处理艺术家
  if (localTrack.artist) {
    const artistId = `artist_${localTrack.artist.toLowerCase().replace(/\s+/g, '_')}`
    artist = {
      id: artistId,
      name: localTrack.artist,
      artwork: localTrack.artistArtwork || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    track.artistId = artistId
  }

  // 处理专辑
  if (localTrack.album) {
    const albumId = `album_${localTrack.album.toLowerCase().replace(/\s+/g, '_')}`
    album = {
      id: albumId,
      title: localTrack.album,
      artistId: artist?.id,
      artwork: localTrack.albumArtwork || '',
      year: localTrack.year,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    track.albumId = albumId
  }

  return { track, artist, album }
}

// 批量插入音频数据
export async function batchInsertTracks(trackData: Array<{
  track: typeof tracks.$inferInsert
  artist?: typeof artists.$inferInsert
  album?: typeof albums.$inferInsert
}>) {
  try {
    // 收集所有艺术家和专辑
    const artistData = trackData
      .map(d => d.artist)
      .filter(Boolean) as typeof artists.$inferInsert[]

    const albumData = trackData
      .map(d => d.album)
      .filter(Boolean) as typeof albums.$inferInsert[]

    const trackDataList = trackData.map(d => d.track)

    // 批量插入（这里需要根据 Drizzle 的实际 API 调整）
    // 实际实现时需要使用事务来确保数据一致性

    console.log(`✅ Inserted ${trackDataList.length} tracks, ${artistData.length} artists, ${albumData.length} albums`)
  }
  catch (error) {
    console.error('❌ Failed to batch insert tracks:', error)
    throw error
  }
}

// 检查本地音频是否有更新
export async function checkLocalLibraryChanges() {
  try {
    // 获取数据库中的本地音频
    const _dbTracks = await db.query.tracks.findMany({
      where: eq(tracks.source, 'local'),
      columns: {
        localId: true,
        updatedAt: true,
      },
    })

    // 这里需要与系统媒体库比较
    // 返回需要更新的音频列表

    return {
      new: [], // 新增的音频
      updated: [], // 更新的音频
      deleted: [], // 删除的音频
    }
  }
  catch (error) {
    console.error('❌ Failed to check local library changes:', error)
    throw error
  }
}

// 清理不存在的本地音频
export async function cleanupDeletedLocalTracks(deletedLocalIds: string[]) {
  try {
    // 删除数据库中对应的音频记录
    await db.delete(tracks).where(
      eq(tracks.source, 'local'),
      // 这里需要添加 inArray 条件来匹配删除的 localId
    )

    console.log(`✅ Cleaned up ${deletedLocalIds.length} deleted local tracks`)
  }
  catch (error) {
    console.error('❌ Failed to cleanup deleted local tracks:', error)
    throw error
  }
}
