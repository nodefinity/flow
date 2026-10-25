import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import type * as schema from './schema'

export type DB
  = | BaseSQLiteDatabase<'async', any, typeof schema>
    | BaseSQLiteDatabase<'sync', any, typeof schema>

export declare const sqlite: unknown
export declare const db: DB | undefined
export declare function initializeDB(): DB
export declare function migrateDB(): Promise<void>
export declare function exportDB(): Promise<Blob>
