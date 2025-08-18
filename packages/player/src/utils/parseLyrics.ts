import { parseLyricTime } from '@flow/shared'

export interface LyricLine {
  time: string
  originalText: string
  translation?: string
}

export function parseLyrics(lyrics: string): LyricLine[] {
  if (!lyrics.trim()) {
    return []
  }

  const lines = lyrics.split('\n').filter(line => line.trim() !== '')
  const timeRegex = /^\[(\d{2}:\d{2}\.\d{3})\]/

  // find start of translation
  const translationStartIndex = lines.findIndex(line =>
    line.includes('[by:') || line.includes('[offset:') || line.includes('[ar:') || line.includes('[ti:'),
  )

  let originalLines: string[]
  let translatedLines: string[] = []

  if (translationStartIndex !== -1) {
    // found translation marker, separate original and translation
    originalLines = lines.slice(0, translationStartIndex)

    // skip marker line, get translation content
    const afterMarker = lines.slice(translationStartIndex + 1)
    translatedLines = afterMarker.filter(line => timeRegex.test(line))
  }
  else {
    // no translation marker, only original lyrics
    originalLines = lines.filter(line => timeRegex.test(line))
  }

  // parse original lyrics
  const originalMap = new Map<string, string>()
  for (const line of originalLines) {
    const match = line.match(timeRegex)
    if (match && match[1]) {
      const time = match[1]
      const text = line.slice(match[0].length).trim()
      if (text) {
        originalMap.set(time, text)
      }
    }
  }

  // parse translation lyrics
  const translationMap = new Map<string, string>()
  for (const line of translatedLines) {
    const match = line.match(timeRegex)
    if (match && match[1]) {
      const time = match[1]
      const text = line.slice(match[0].length).trim()
      if (text) {
        translationMap.set(time, text)
      }
    }
  }

  // merge original and translation, sort by time
  const result: LyricLine[] = []
  const allTimes = Array.from(new Set([...originalMap.keys(), ...translationMap.keys()]))
    .sort((a, b) => parseLyricTime(a) - parseLyricTime(b))

  for (const time of allTimes) {
    const originalText = originalMap.get(time)
    const translation = translationMap.get(time)

    if (originalText || translation) {
      result.push({
        time,
        originalText: originalText || '',
        translation: translation || undefined,
      })
    }
  }

  return result
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
