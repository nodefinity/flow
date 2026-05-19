import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
