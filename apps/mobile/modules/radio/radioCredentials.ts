import * as SecureStore from 'expo-secure-store'

enum RadioCredentialKey {
  DEEPSEEK_API_KEY = 'flow.radio.deepseek-api-key',
  TTS_API_KEY = 'flow.radio.tts-api-key',
}

export interface RadioCredentials {
  deepSeekApiKey: string | null
  ttsApiKey: string | null
}

export interface CompleteRadioCredentials {
  deepSeekApiKey: string
  ttsApiKey: string
}

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}

export async function getRadioCredentials(): Promise<RadioCredentials> {
  const [deepSeekApiKey, ttsApiKey] = await Promise.all([
    SecureStore.getItemAsync(RadioCredentialKey.DEEPSEEK_API_KEY, secureStoreOptions),
    SecureStore.getItemAsync(RadioCredentialKey.TTS_API_KEY, secureStoreOptions),
  ])

  return { deepSeekApiKey, ttsApiKey }
}

export async function setDeepSeekApiKey(apiKey: string): Promise<void> {
  await storeCredential(RadioCredentialKey.DEEPSEEK_API_KEY, apiKey)
}

export async function setTTSApiKey(apiKey: string): Promise<void> {
  await storeCredential(RadioCredentialKey.TTS_API_KEY, apiKey)
}

export function radioCredentialsAreComplete(
  credentials: RadioCredentials,
): credentials is CompleteRadioCredentials {
  return Boolean(credentials.deepSeekApiKey?.trim() && credentials.ttsApiKey?.trim())
}

async function storeCredential(key: RadioCredentialKey, value: string) {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    await SecureStore.deleteItemAsync(key, secureStoreOptions)
    return
  }

  await SecureStore.setItemAsync(key, normalizedValue, secureStoreOptions)
}
