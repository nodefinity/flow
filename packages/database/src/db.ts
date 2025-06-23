import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import type * as schema from './schema'

type DB
  = | BaseSQLiteDatabase<'async', any, typeof schema>
    | BaseSQLiteDatabase<'sync', any, typeof schema>

export declare const sqlite: unknown
export declare const db: DB
export declare function initializeDB(): void
export declare function migrateDB(): Promise<void>
export declare function exportDB(): Promise<Blob>
