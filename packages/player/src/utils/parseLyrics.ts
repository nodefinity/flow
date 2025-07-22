import { parseLyricTime } from '@flow/core'

export interface LyricLine {
  time: string
  text: string
}

export function parseLyrics(lyrics: string): LyricLine[] {
  return lyrics.split('\n').filter(line => line.trim() !== '').map((line) => {
    const [time, text] = line.split(']')
    if (time && text) {
      return { time: time.slice(1).trim(), text: text.trim() }
    }
    return { time: '', text: '' }
  }).filter(line => line.time !== '')
}

/**
 * Find the lyric line at the given time(seconds)
 * @param lyrics - The lyrics to search through
 * @param time - The time to find the lyric line at (seconds)
 * @returns The index of the lyric line at the given time, or null if no line is found
 */
export function findLyricLine(lyrics: LyricLine[], time: number): number | null {
  // return the last line that is before the given time
  for (let i = lyrics.length - 1; i >= 0; i--) {
    const line = lyrics[i]
    if (line && parseLyricTime(line.time) <= time) {
      return i
    }
  }
  return null
}
