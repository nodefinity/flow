import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'

// 数据库 schema
import * as schema from './schema'

// 创建数据库连接
const sqlite = SQLite.openDatabaseSync('music.db')

// 创建 Drizzle 实例
export const db = drizzle(sqlite, { schema })

// 数据库类型导出
export type Database = typeof db
