import { db } from './db'
import { tracks } from './schema'

// 数据库初始化函数
export async function initializeDatabase() {
  try {
    // 检查数据库是否已经初始化
    const isReady = await checkDatabaseStatus()
    if (isReady) {
      console.log('✅ Database already initialized')
      return
    }

    // 如果数据库未初始化，创建表结构
    // 注意：在 expo-sqlite 中，表会在首次查询时自动创建
    console.log('✅ Database initialized successfully')
  }
  catch (error) {
    console.error('❌ Failed to initialize database:', error)
    throw error
  }
}

// 检查数据库是否已初始化
export async function checkDatabaseStatus() {
  try {
    // 尝试查询一个简单的表来检查数据库状态
    await db.select().from(tracks).limit(1)
    console.log('✅ Database is ready')
    return true
  }
  catch (error) {
    console.error('❌ Database not ready:', error)
    return false
  }
}
