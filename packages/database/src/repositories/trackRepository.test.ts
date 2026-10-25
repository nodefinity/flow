import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleLocalTracks, searchLocalTracks, upsertTracks } from './trackRepository'

const databaseState = vi.hoisted(() => ({ current: undefined as unknown }))

vi.mock('../db', () => ({
  get db() {
    return databaseState.current
  },
}))

describe('trackRepository database lifecycle', () => {
  beforeEach(() => {
    databaseState.current = undefined
  })

  it('uses the database instance initialized after the repository module loads', async () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined)
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate })
    const insert = vi.fn().mockReturnValue({ values })
    databaseState.current = { insert }

    await upsertTracks([{ id: 'track-1', url: 'file:///track-1.mp3' }])

    expect(insert).toHaveBeenCalledOnce()
    expect(values).toHaveBeenCalledWith([{ id: 'track-1', url: 'file:///track-1.mp3' }])
    expect(onConflictDoUpdate).toHaveBeenCalledOnce()
  })

  it('does not query the database for a blank search', async () => {
    await expect(searchLocalTracks('   ')).resolves.toEqual([])
  })

  it('binds title, artist and album terms literally and bounds local playable results', async () => {
    const limit = vi.fn().mockResolvedValue([])
    const orderBy = vi.fn().mockReturnValue({ limit })
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    databaseState.current = { select: vi.fn().mockReturnValue({ from }) }
    await searchLocalTracks(' 周杰伦 晴天%_ ')
    const query = new SQLiteSyncDialect().sqlToQuery(where.mock.calls[0]![0])
    expect(query.params).toEqual(['local', '周杰伦', '周杰伦', '周杰伦', '晴天%_', '晴天%_', '晴天%_'])
    expect(query.sql).toContain('length(trim(')
    expect(query.sql).toContain('instr(lower(')
    expect(query.sql).not.toContain('周杰伦')
    expect(orderBy).toHaveBeenCalledOnce()
    expect(limit).toHaveBeenCalledWith(10)
  })

  it('samples local playable songs without channel labels or a fixed first row', async () => {
    const limit = vi.fn().mockResolvedValue([])
    const orderBy = vi.fn().mockReturnValue({ limit })
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    databaseState.current = { select: vi.fn().mockReturnValue({ from }) }
    await sampleLocalTracks()
    const dialect = new SQLiteSyncDialect()
    const query = dialect.sqlToQuery(where.mock.calls[0]![0])
    expect(query.params).toEqual(['local'])
    expect(query.sql).toContain('length(trim(')
    expect(query.sql).not.toMatch(/genre|comment/)
    expect(dialect.sqlToQuery(orderBy.mock.calls[0]![0]).sql).toBe('random()')
    expect(limit).toHaveBeenCalledWith(10)
  })
})
