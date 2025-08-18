import { logger } from './logger'
import { formatTime } from './time'

export interface DebugOptions {
  enableLogging?: boolean
  enablePerformance?: boolean
  enableMemory?: boolean
  enableStackTrace?: boolean
}

export class Debugger {
  private options: DebugOptions
  private performanceMarks: Map<string, number> = new Map()
  private memorySnapshots: Map<string, number> = new Map()

  constructor(options: DebugOptions = {}) {
    this.options = {
      enableLogging: true,
      enablePerformance: true,
      enableMemory: false,
      enableStackTrace: false,
      ...options,
    }
  }

  /**
   * measure function run time
   */
  async debugRunTime<T>(fn: () => Promise<T> | T, name?: string): Promise<T> {
    const functionName = name || fn.name || 'anonymous'
    const start = performance.now()

    try {
      const result = await fn()
      const end = performance.now()
      const duration = end - start

      if (this.options.enableLogging) {
        logger.info(`${functionName} 执行完成，耗时 ${duration.toFixed(2)}ms`)
      }

      return result
    }
    catch (error) {
      const end = performance.now()
      const duration = end - start

      if (this.options.enableLogging) {
        logger.error(`${functionName} 执行失败，耗时 ${duration.toFixed(2)}ms`, error)
      }

      throw error
    }
  }

  /**
   * performance mark
   */
  mark(name: string): void {
    if (!this.options.enablePerformance)
      return

    const timestamp = performance.now()
    this.performanceMarks.set(name, timestamp)

    if (this.options.enableLogging) {
      logger.debug(`性能标记: ${name}`, formatTime(new Date(), 'HH:mm:ss.SSS'))
    }
  }

  /**
   * measure time between two marks
   */
  measure(startMark: string, endMark: string, name?: string): number | null {
    if (!this.options.enablePerformance)
      return null

    const startTime = this.performanceMarks.get(startMark)
    const endTime = this.performanceMarks.get(endMark)

    if (!startTime || !endTime) {
      logger.warn(`性能标记未找到: ${startMark} 或 ${endMark}`)
      return null
    }

    const duration = endTime - startTime
    const measureName = name || `${startMark} -> ${endMark}`

    if (this.options.enableLogging) {
      logger.info(`${measureName} 耗时: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * memory snapshot
   */
  takeMemorySnapshot(name: string): void {
    if (!this.options.enableMemory || typeof (performance as any)?.memory === 'undefined')
      return

    const memory = (performance as any).memory
    const used = memory.usedJSHeapSize / 1024 / 1024 // MB
    const total = memory.totalJSHeapSize / 1024 / 1024 // MB
    const limit = memory.jsHeapSizeLimit / 1024 / 1024 // MB

    this.memorySnapshots.set(name, used)

    if (this.options.enableLogging) {
      logger.info(`内存快照 [${name}]: 已使用 ${used.toFixed(2)}MB / ${total.toFixed(2)}MB (限制: ${limit.toFixed(2)}MB)`)
    }
  }

  /**
   * compare memory snapshots
   */
  compareMemorySnapshots(snapshot1: string, snapshot2: string): number | null {
    if (!this.options.enableMemory)
      return null

    const mem1 = this.memorySnapshots.get(snapshot1)
    const mem2 = this.memorySnapshots.get(snapshot2)

    if (mem1 === undefined || mem2 === undefined) {
      logger.warn(`内存快照未找到: ${snapshot1} 或 ${snapshot2}`)
      return null
    }

    const diff = mem2 - mem1

    if (this.options.enableLogging) {
      const change = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)
      logger.info(`内存变化 [${snapshot1} -> ${snapshot2}]: ${change}MB`)
    }

    return diff
  }

  /**
   * get call stack
   */
  getStackTrace(): string[] {
    if (!this.options.enableStackTrace)
      return []

    const stack = new Error('Stack trace').stack
    if (!stack)
      return []

    return stack
      .split('\n')
      .slice(2) // 跳过 Error 和 getStackTrace 调用
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }

  /**
   * debug function call
   */
  debugFunctionCall<T extends (...args: any[]) => any>(
    fn: T,
    name?: string,
  ): T {
    const functionName = name || fn.name || 'anonymous'

    return ((...args: any[]) => {
      if (this.options.enableLogging) {
        logger.debug(`调用函数: ${functionName}`, { args })
      }

      if (this.options.enableStackTrace) {
        const stack = this.getStackTrace()
        logger.debug(`调用栈:`, stack)
      }

      const start = performance.now()

      try {
        const result = fn(...args)

        if (result instanceof Promise) {
          return result.then((value) => {
            const end = performance.now()
            const duration = end - start

            if (this.options.enableLogging) {
              logger.debug(`异步函数 ${functionName} 完成，耗时 ${duration.toFixed(2)}ms`, { result: value })
            }

            return value
          }).catch((error) => {
            const end = performance.now()
            const duration = end - start

            if (this.options.enableLogging) {
              logger.error(`异步函数 ${functionName} 失败，耗时 ${duration.toFixed(2)}ms`, error)
            }

            throw error
          })
        }
        else {
          const end = performance.now()
          const duration = end - start

          if (this.options.enableLogging) {
            logger.debug(`同步函数 ${functionName} 完成，耗时 ${duration.toFixed(2)}ms`, { result })
          }

          return result
        }
      }
      catch (error) {
        const end = performance.now()
        const duration = end - start

        if (this.options.enableLogging) {
          logger.error(`同步函数 ${functionName} 失败，耗时 ${duration.toFixed(2)}ms`, error)
        }

        throw error
      }
    }) as T
  }

  /**
   * set debug options
   */
  setOptions(options: Partial<DebugOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * clear all performance marks and memory snapshots
   */
  clear(): void {
    this.performanceMarks.clear()
    this.memorySnapshots.clear()

    if (this.options.enableLogging) {
      logger.debug('调试器数据已清除')
    }
  }
}

// create default debugger instance
export const debuggerInstance = new Debugger()

// convenient functions
export function debugRunTime<T>(fn: () => Promise<T> | T, name?: string) {
  return debuggerInstance.debugRunTime(fn, name)
}

export const mark = (name: string) => debuggerInstance.mark(name)
export function measure(startMark: string, endMark: string, name?: string) {
  return debuggerInstance.measure(startMark, endMark, name)
}

export const takeMemorySnapshot = (name: string) => debuggerInstance.takeMemorySnapshot(name)
export function compareMemorySnapshots(snapshot1: string, snapshot2: string) {
  return debuggerInstance.compareMemorySnapshots(snapshot1, snapshot2)
}

export function debugFunctionCall<T extends (...args: any[]) => any>(fn: T, name?: string) {
  return debuggerInstance.debugFunctionCall(fn, name)
}
