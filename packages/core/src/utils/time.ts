/**
 * format duration to mm:ss
 * @param duration seconds
 * @returns mm:ss
 */
export function formatDuration(duration: number) {
  const totalSeconds = Math.floor(duration)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format a Date object to a string based on the given format.
 * Supported tokens:
 * YYYY - full year
 * MM   - month (01-12)
 * DD   - day of month (01-31)
 * HH   - hours (00-23)
 * mm   - minutes (00-59)
 * ss   - seconds (00-59)
 * SSS  - milliseconds (000-999)
 */
export function formatTime(date: Date | null, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date)
    return ''

  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    SSS: String(date.getMilliseconds()).padStart(3, '0'),
  }

  return Object.entries(map).reduce(
    (str, [token, value]) => str.replace(new RegExp(token, 'g'), value),
    format,
  )
}

/**
 * Parse a lyric time string to seconds
 * @param time mm:ss.ms (e.g., "01:23.45")
 * @returns seconds as float number
 */
export function parseLyricTime(time: string): number {
  const [minutes, secondsStr] = time.split(':')
  const seconds = Number.parseFloat(secondsStr ?? '0')
  return Number.parseInt(minutes ?? '0') * 60 + seconds
}
