import { relations } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 艺术家表
export const artists = sqliteTable('artists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  artwork: text('artwork'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => ({
  nameIdx: index('artist_name_idx').on(table.name),
}))

// 专辑表
export const albums = sqliteTable('albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artistId: text('artist_id').references(() => artists.id),
  artwork: text('artwork'),
  year: integer('year'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => ({
  titleIdx: index('album_title_idx').on(table.title),
  artistIdx: index('album_artist_idx').on(table.artistId),
}))

// 音频表
export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artistId: text('artist_id').references(() => artists.id),
  albumId: text('album_id').references(() => albums.id),
  duration: integer('duration'), // 秒
  url: text('url').notNull(),
  artwork: text('artwork'),
  source: text('source').notNull(), // 'local' | 'remote'
  localId: text('local_id'), // 系统媒体库的原始ID
  filePath: text('file_path'), // 本地文件路径
  fileSize: integer('file_size'), // 文件大小（字节）
  bitrate: integer('bitrate'),
  sampleRate: integer('sample_rate'),
  channels: integer('channels'),
  format: text('format'),
  year: integer('year'),
  genre: text('genre'),
  trackNumber: integer('track_number'),
  discNumber: integer('disc_number'),
  composer: text('composer'),
  lyricist: text('lyricist'),
  lyrics: text('lyrics'),
  albumArtist: text('album_artist'),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => ({
  titleIdx: index('track_title_idx').on(table.title),
  artistIdx: index('track_artist_idx').on(table.artistId),
  albumIdx: index('track_album_idx').on(table.albumId),
  sourceIdx: index('track_source_idx').on(table.source),
  localIdIdx: index('track_local_id_idx').on(table.localId),
}))

// 播放列表表
export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  artwork: text('artwork'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => ({
  nameIdx: index('playlist_name_idx').on(table.name),
}))

// 播放列表-音频关联表
export const playlistTracks = sqliteTable('playlist_tracks', {
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => ({
  pk: primaryKey({ columns: [table.playlistId, table.trackId] }),
  playlistIdx: index('playlist_tracks_playlist_idx').on(table.playlistId),
  trackIdx: index('playlist_tracks_track_idx').on(table.trackId),
  positionIdx: index('playlist_tracks_position_idx').on(table.position),
}))

// 关系定义
export const artistsRelations = relations(artists, ({ many }) => ({
  tracks: many(tracks),
  albums: many(albums),
}))

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, {
    fields: [albums.artistId],
    references: [artists.id],
  }),
  tracks: many(tracks),
}))

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  artist: one(artists, {
    fields: [tracks.artistId],
    references: [artists.id],
  }),
  album: one(albums, {
    fields: [tracks.albumId],
    references: [albums.id],
  }),
  playlistTracks: many(playlistTracks),
}))

export const playlistsRelations = relations(playlists, ({ many }) => ({
  playlistTracks: many(playlistTracks),
}))

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
  track: one(tracks, {
    fields: [playlistTracks.trackId],
    references: [tracks.id],
  }),
}))
