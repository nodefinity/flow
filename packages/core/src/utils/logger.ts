import { formatTime } from './time'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LoggerOptions {
  level?: LogLevel
  enableTimestamp?: boolean
  enableColors?: boolean
  prefix?: string
}

export class Logger {
  private level: LogLevel
  private enableTimestamp: boolean
  private enableColors: boolean
  private prefix: string

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.enableTimestamp = options.enableTimestamp ?? true
    this.enableColors = options.enableColors ?? true
    this.prefix = options.prefix ?? ''
  }

  private getTimestamp(): string {
    if (!this.enableTimestamp)
      return ''
    return `[${formatTime(new Date(), 'HH:mm:ss.SSS')}] `
  }

  private getPrefix(): string {
    return this.prefix ? `[${this.prefix}] ` : ''
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = this.getTimestamp()
    const prefix = this.getPrefix()
    const formattedArgs = args.length > 0
      ? ` ${args.map((arg) => {
        if (arg instanceof Error) {
          // handle Error object
          const error = arg as Error
          let errorStr = `${error.name}: ${error.message}`
          if (error.stack) {
            // only show first 5 lines of stack trace, avoid too long log
            const stackLines = error.stack.split('\n').slice(0, 5)
            errorStr += `\n${stackLines.join('\n')}`
          }
          return errorStr
        }
        else if (typeof arg === 'object' && arg !== null) {
          // handle normal object
          try {
            return JSON.stringify(arg, null, 2)
          }
          catch {
            // if JSON.stringify failed, use toString
            return String(arg)
          }
        }
        else {
          // handle basic type
          return String(arg)
        }
      }).join(' ')}`
      : ''

    return `${timestamp}${prefix}${level} ${message}${formattedArgs}`
  }

  private log(level: LogLevel, levelName: string, color: string, message: string, ...args: any[]): void {
    if (this.level > level)
      return

    const formattedMessage = this.formatMessage(levelName, message, ...args)

    if (this.enableColors) {
      // check if in browser environment
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // browser environment: use CSS color
        console.log(`%c${formattedMessage}`, `color: ${color}`)
      }
      else {
        // Node.js environment: use ANSI color code
        const ansiColor = this.getAnsiColor(color)
        console.log(`${ansiColor}${formattedMessage}\x1B[0m`)
      }
    }
    else {
      console.log(formattedMessage)
    }
  }

  private getAnsiColor(cssColor: string): string {
    // convert CSS color to ANSI color code
    const colorMap: Record<string, string> = {
      '#6c757d': '\x1B[90m', // gray (DEBUG)
      '#007bff': '\x1B[34m', // blue (INFO)
      '#ffc107': '\x1B[33m', // yellow (WARN)
      '#dc3545': '\x1B[31m', // red (ERROR)
    }
    return colorMap[cssColor] || ''
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', '#6c757d', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, 'INFO', '#007bff', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, 'WARN', '#ffc107', message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, 'ERROR', '#dc3545', message, ...args)
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix
  }

  enableTimestamps(enable: boolean): void {
    this.enableTimestamp = enable
  }

  enableColorOutput(enable: boolean): void {
    this.enableColors = enable
  }
}

// create default logger instance
export const logger = new Logger({ prefix: 'Flow' })

// convenient functions
export const Debug = (message: string, ...args: any[]) => logger.debug(message, ...args)
export const Info = (message: string, ...args: any[]) => logger.info(message, ...args)
export const Warn = (message: string, ...args: any[]) => logger.warn(message, ...args)
export const Error = (message: string, ...args: any[]) => logger.error(message, ...args)
