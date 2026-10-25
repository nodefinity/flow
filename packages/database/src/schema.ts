import { relations } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(),
  source: text('source', { enum: ['local', 'remote'] }).notNull().default('local'),

  // basic info
  title: text('title').notNull().default(''),
  artist: text('artist').notNull().default(''),
  album: text('album').notNull().default(''),
  artwork: text('artwork'),
  url: text('url').notNull(),
  duration: real('duration').notNull().default(0),

  // file info
  fileSize: integer('file_size').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  modifiedAt: integer('modified_at').notNull().default(0),

  // metadata (from tag reading)
  bitrate: integer('bitrate'),
  sampleRate: integer('sample_rate'),
  channels: integer('channels'),
  format: text('format'),
  year: integer('year'),
  genre: text('genre'),
  track: integer('track'),
  disc: integer('disc'),
  composer: text('composer'),
  lyricist: text('lyricist'),
  lyrics: text('lyrics'),
  albumArtist: text('album_artist'),
  comment: text('comment'),

  // sorting
  sortKey: text('sort_key').notNull().default(''),
}, table => [
  index('tracks_title_idx').on(table.title),
  index('tracks_artist_idx').on(table.artist),
  index('tracks_album_idx').on(table.album),
  index('tracks_created_at_idx').on(table.createdAt),
  index('tracks_sort_key_idx').on(table.sortKey),
])

// ---------------------------------------------------------------------------
// Playlists (classic mode)
// ---------------------------------------------------------------------------

export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  artwork: text('artwork'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('playlist_name_idx').on(table.name),
])

export const playlistTracks = sqliteTable('playlist_tracks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  trackLocalId: text('track_local_id').notNull(),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('playlist_tracks_playlist_idx').on(table.playlistId),
  index('playlist_tracks_local_id_idx').on(table.trackLocalId),
  index('playlist_tracks_position_idx').on(table.position),
])

// ---------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------

export const channels = sqliteTable('channels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  descriptor: text('descriptor').notNull(),
  styleJson: text('style_json', { mode: 'json' }).notNull().$type<import('@flow/shared').ChannelStyle>(),
  isBuiltin: integer('is_builtin', { mode: 'boolean' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  channelId: integer('channel_id').notNull().references(() => channels.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('session_channel_idx').on(table.channelId),
])

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'host'] }).notNull(),
  kind: text('kind', { enum: ['text', 'voice', 'acknowledgement', 'interlude', 'announcement'] }).notNull(),
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('message_session_idx').on(table.sessionId),
])

export const playbackHistory = sqliteTable('playback_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  trackLocalId: text('track_local_id').notNull(),
  durationPlayed: integer('duration_played'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [
  index('playback_history_session_idx').on(table.sessionId),
  index('playback_history_local_id_idx').on(table.trackLocalId),
])

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const tracksRelations = relations(tracks, ({ many }) => ({
  playlistTracks: many(playlistTracks),
  playbackHistory: many(playbackHistory),
}))

export const playlistsRelations = relations(playlists, ({ many }) => ({
  playlistTracks: many(playlistTracks),
}))

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
}))

export const channelsRelations = relations(channels, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  channel: one(channels, {
    fields: [sessions.channelId],
    references: [channels.id],
  }),
  messages: many(messages),
  playbackHistory: many(playbackHistory),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}))

export const playbackHistoryRelations = relations(playbackHistory, ({ one }) => ({
  session: one(sessions, {
    fields: [playbackHistory.sessionId],
    references: [sessions.id],
  }),
}))
