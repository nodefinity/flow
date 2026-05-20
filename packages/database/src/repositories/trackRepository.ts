import type { ChannelStyle } from '@flow/shared'
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import type * as schema from '../schema'
import { asc, eq, inArray, sql } from 'drizzle-orm'
import { db as _db } from '../db'
import { tracks } from '../schema'

const db = _db as BaseSQLiteDatabase<'async', any, typeof schema>

export type TrackRow = typeof tracks.$inferSelect
export type TrackInsert = typeof tracks.$inferInsert

export async function getAllTracks(orderBy: 'sortKey' | 'createdAt' = 'sortKey') {
  const column = orderBy === 'sortKey' ? tracks.sortKey : tracks.createdAt
  return db.select().from(tracks).orderBy(asc(column))
}

export async function getTrackById(id: string) {
  const [row] = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1)
  return row ?? null
}

export async function getTracksByIds(ids: string[]) {
  if (ids.length === 0)
    return []
  return db.select().from(tracks).where(inArray(tracks.id, ids))
}

export async function upsertTracks(rows: TrackInsert[]) {
  if (rows.length === 0)
    return
  await db.insert(tracks).values(rows).onConflictDoUpdate({
    target: tracks.id,
    set: {
      title: sql`excluded.title`,
      artist: sql`excluded.artist`,
      album: sql`excluded.album`,
      artwork: sql`excluded.artwork`,
      url: sql`excluded.url`,
      duration: sql`excluded.duration`,
      fileSize: sql`excluded.file_size`,
      createdAt: sql`excluded.created_at`,
      modifiedAt: sql`excluded.modified_at`,
      sortKey: sql`excluded.sort_key`,
    },
  })
}

export async function updateTrackMetadata(id: string, metadata: Partial<TrackInsert>) {
  await db.update(tracks).set(metadata).where(eq(tracks.id, id))
}

export async function deleteTracksByIds(ids: string[]) {
  if (ids.length === 0)
    return
  for (const id of ids) {
    await db.delete(tracks).where(eq(tracks.id, id))
  }
}

export async function removeTracksNotIn(idsToKeep: string[]) {
  if (idsToKeep.length === 0) {
    await db.delete(tracks).where(eq(tracks.source, 'local'))
    return
  }
  const keepSet = new Set(idsToKeep)
  const allLocal = await db.select({ id: tracks.id }).from(tracks).where(eq(tracks.source, 'local'))
  const toDelete = allLocal.filter(row => !keepSet.has(row.id)).map(row => row.id)
  await deleteTracksByIds(toDelete)
}

export async function queryCandidateSetFromDB(style: ChannelStyle = {}) {
  const rows = await db.select().from(tracks).where(eq(tracks.source, 'local'))

  const { genreHints, moodTags } = style
  const hasGenreHints = Array.isArray(genreHints) && genreHints.length > 0
  const hasMoodTags = Array.isArray(moodTags) && moodTags.length > 0

  if (!hasGenreHints && !hasMoodTags) {
    return rows.filter(t => t.url)
  }

  return rows.filter((track) => {
    if (!track.url)
      return false

    if (hasGenreHints) {
      const matchesGenre = genreHints!.some(hint =>
        track.genre?.toLowerCase().includes(hint.toLowerCase()),
      )
      if (!matchesGenre)
        return false
    }

    if (hasMoodTags) {
      const matchesMood = moodTags!.some(tag =>
        track.genre?.toLowerCase().includes(tag.toLowerCase())
        || track.comment?.toLowerCase().includes(tag.toLowerCase()),
      )
      if (!matchesMood)
        return false
    }

    return true
  })
}
