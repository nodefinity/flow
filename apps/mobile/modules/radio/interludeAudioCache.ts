import type { InterludeAudioCache } from '@flow/store'
import { Directory, File, Paths } from 'expo-file-system'

const CACHE_DIRECTORY_NAME = 'flow-radio-interludes'

const mediaTypeExtensions: Record<string, string> = {
  'audio/aac': 'aac',
  'audio/m4a': 'm4a',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
}

export const interludeAudioCache: InterludeAudioCache = {
  async materialize({ audio, cacheKey, signal }) {
    throwIfAborted(signal)

    const extension = mediaTypeExtensions[audio.mediaType.toLocaleLowerCase()]
    if (!extension)
      throw new Error(`Unsupported TTS media type: ${audio.mediaType}`)

    const directory = new Directory(Paths.cache, CACHE_DIRECTORY_NAME)
    directory.create({ idempotent: true, intermediates: true })

    const safeCacheKey = cacheKey.replaceAll(/[^\w-]/g, '_')
    const file = new File(directory, `${safeCacheKey}.${extension}`)
    file.create({ overwrite: true, intermediates: true })
    file.write(audio.bytes)

    if (signal?.aborted) {
      file.delete()
      throwAbortError()
    }

    return file.uri
  },

  async remove(uri) {
    const file = new File(uri)
    if (file.exists)
      file.delete()
  },
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted)
    throwAbortError()
}

function throwAbortError(): never {
  const error = new Error('Interlude audio materialization was aborted')
  error.name = 'AbortError'
  throw error
}
