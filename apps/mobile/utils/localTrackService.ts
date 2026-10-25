import type { TrackInsert } from '@flow/database'
import { removeTracksNotIn, upsertTracks } from '@flow/database'
import { getTracksAsync } from '@nodefinity/react-native-music-library'
import { pinyin } from 'pinyin-pro'

function generateSortKey(title: string): string {
  if (!title)
    return ''
  const py = pinyin(title, { toneType: 'none', type: 'array' })
  return py.map(s => s[0] ?? '').join('').toLowerCase()
}

export interface ScanProgress {
  scanned: number
  hasMore: boolean
}

export async function scanLocalTracks(
  onProgress?: (progress: ScanProgress) => void,
): Promise<string[]> {
  let hasMore = true
  let cursor: string | undefined
  const allIds: string[] = []

  while (hasMore) {
    const result = await getTracksAsync({ first: 50, after: cursor })

    const rows: TrackInsert[] = result.items.map(item => ({
      id: item.id,
      source: 'local' as const,
      title: item.title ?? '',
      artist: item.artist ?? '',
      album: item.album ?? '',
      artwork: item.artwork ?? null,
      url: item.url,
      duration: item.duration ?? 0,
      fileSize: item.fileSize ?? 0,
      createdAt: item.createdAt ?? 0,
      modifiedAt: item.modifiedAt ?? 0,
      sortKey: generateSortKey(item.title ?? ''),
    }))

    await upsertTracks(rows)
    allIds.push(...rows.map(r => r.id))

    onProgress?.({ scanned: allIds.length, hasMore: result.hasNextPage })

    hasMore = result.hasNextPage
    cursor = result.endCursor
  }

  await removeTracksNotIn(allIds)
  return allIds
}
