/* eslint-disable import/no-mutable-exports */
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'
import { logger } from '@flow/shared'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import * as SQLite from 'expo-sqlite'

import migrations from '../drizzle/migrations'
import { SQLITE_DB_NAME } from './constant'
import * as schema from './schema'

type Database = ExpoSQLiteDatabase<typeof schema> & {
  $client: SQLite.SQLiteDatabase
}

export let sqlite = SQLite.openDatabaseSync(SQLITE_DB_NAME)

export let db: Database | undefined

let migrationPromise: Promise<void> | undefined

export function initializeDB() {
  if (db) {
    logger.info('Database already initialized')
    return db
  }
  db = drizzle(sqlite, {
    schema,
    logger: false,
  })
  return db
}

async function runMigrations(): Promise<void> {
  let database = initializeDB()

  try {
    await migrate(database, migrations)
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
    db = undefined
    database = initializeDB()
    await migrate(database, migrations)
  }
}

export function migrateDB(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigrations().catch((error) => {
      migrationPromise = undefined
      throw error
    })
  }

  return migrationPromise
}

export async function exportDB() {}
