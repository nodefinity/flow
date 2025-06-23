/* eslint-disable import/no-mutable-exports */
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'
import { logger } from '@flow/core'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import * as SQLite from 'expo-sqlite'

import migrations from '../drizzle/migrations'
import { SQLITE_DB_NAME } from './constant'
import * as schema from './schema'

export let sqlite = SQLite.openDatabaseSync(SQLITE_DB_NAME)

export let db: ExpoSQLiteDatabase<typeof schema> & {
  $client: SQLite.SQLiteDatabase
}

export function initializeDB() {
  if (db) {
    logger.info('Database already initialized')
    return
  }
  db = drizzle(sqlite, {
    schema,
    logger: false,
  })
}

export async function migrateDB(): Promise<void> {
  try {
    await migrate(db, migrations)
  }
  catch (error) {
    logger.error('Failed to migrate database:', error)
    try {
      await sqlite.closeAsync()
    }
    catch {
      /* empty */
    }
    await SQLite.deleteDatabaseAsync(SQLITE_DB_NAME)
    sqlite = SQLite.openDatabaseSync(SQLITE_DB_NAME)
    initializeDB()
    await migrate(db, migrations)
  }
}

export async function exportDB() {}
