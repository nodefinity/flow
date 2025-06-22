import { and, asc, desc, eq, like, or } from 'drizzle-orm'
import { db } from './db'
import { albums, artists, playlists, playlistTracks, tracks } from './schema'

// 搜索选项接口
export interface SearchOptions {
  limit?: number
  offset?: number
  sortBy?: 'title' | 'artist' | 'album' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  source?: 'local' | 'remote' | 'all'
}

// 搜索音频
export async function searchTracks(query: string, options: SearchOptions = {}) {
  const {
    limit = 50,
    offset = 0,
    // sortBy = 'title',
    // sortOrder = 'asc',
    source = 'all',
  } = options

  const whereConditions = [
    or(
      like(tracks.title, `%${query}%`),
      like(tracks.artistId, `%${query}%`),
      like(tracks.albumId, `%${query}%`),
    ),
  ]

  // 如果指定了来源，添加来源过滤
  if (source !== 'all') {
    whereConditions.push(eq(tracks.source, source))
  }

  return await db.query.tracks.findMany({
    where: and(...whereConditions),
    with: {
      artist: true,
      album: true,
    },
    // orderBy: sortOrder === 'desc' ? desc(tracks[sortBy]) : asc(tracks[sortBy]),
    limit,
    offset,
  })
}

// 根据艺术家搜索音频
export async function getTracksByArtist(artistId: string) {
  return await db.query.tracks.findMany({
    where: eq(tracks.artistId, artistId),
    with: {
      artist: true,
      album: true,
    },
    orderBy: asc(tracks.title),
  })
}

// 根据专辑搜索音频
export async function getTracksByAlbum(albumId: string) {
  return await db.query.tracks.findMany({
    where: eq(tracks.albumId, albumId),
    with: {
      artist: true,
      album: true,
    },
    orderBy: asc(tracks.trackNumber),
  })
}

// 获取所有艺术家
export async function getAllArtists() {
  return await db.query.artists.findMany({
    orderBy: asc(artists.name),
  })
}

// 获取所有专辑
export async function getAllAlbums() {
  return await db.query.albums.findMany({
    with: {
      artist: true,
    },
    orderBy: asc(albums.title),
  })
}

// 获取所有播放列表
export async function getAllPlaylists() {
  return await db.query.playlists.findMany({
    orderBy: desc(playlists.updatedAt),
  })
}

// 获取播放列表中的音频
export async function getPlaylistTracks(playlistId: string) {
  return await db.query.playlistTracks.findMany({
    where: eq(playlistTracks.playlistId, playlistId),
    with: {
      track: {
        with: {
          artist: true,
          album: true,
        },
      },
    },
    orderBy: asc(playlistTracks.position),
  })
}

// 根据本地ID获取音频
export async function getTrackByLocalId(localId: string) {
  return await db.query.tracks.findFirst({
    where: eq(tracks.localId, localId),
    with: {
      artist: true,
      album: true,
    },
  })
}

// 获取所有本地音频
export async function getAllLocalTracks() {
  return await db.query.tracks.findMany({
    where: eq(tracks.source, 'local'),
    with: {
      artist: true,
      album: true,
    },
    orderBy: asc(tracks.title),
  })
}

// 获取所有远程音频
export async function getAllRemoteTracks() {
  return await db.query.tracks.findMany({
    where: eq(tracks.source, 'remote'),
    with: {
      artist: true,
      album: true,
    },
    orderBy: desc(tracks.createdAt),
  })
}

// 统计信息
export async function getStats() {
  const [localCount, remoteCount, artistCount, albumCount, playlistCount] = await Promise.all([
    db.select({ count: tracks.id }).from(tracks).where(eq(tracks.source, 'local')),
    db.select({ count: tracks.id }).from(tracks).where(eq(tracks.source, 'remote')),
    db.select({ count: artists.id }).from(artists),
    db.select({ count: albums.id }).from(albums),
    db.select({ count: playlists.id }).from(playlists),
  ])

  return {
    localTracks: localCount.length,
    remoteTracks: remoteCount.length,
    artists: artistCount.length,
    albums: albumCount.length,
    playlists: playlistCount.length,
  }
}
