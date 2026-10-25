import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from '@flow/shared'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { getDeepSeekApiKey, setDeepSeekApiKey } from '@/modules/radio/radioCredentials'

export function AiTokenSetting() {
  const colors = useColors()
  const { t } = useTranslation()
  const [apiKey, setApiKey] = useState('')
  const [hasSavedKey, setHasSavedKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reloadIndex, setReloadIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const mutationPending = useRef(false)
  const busy = isLoading || isSaving

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setLoadFailed(false)
    setError(null)

    getDeepSeekApiKey()
      .then((savedKey) => {
        if (active)
          setHasSavedKey(Boolean(savedKey?.trim()))
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true)
          setError(t('setting.ai.loadError'))
        }
      })
      .finally(() => {
        if (active)
          setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadIndex, t])

  useFocusEffect(useCallback(() => {
    return () => {
      setApiKey('')
      setIsVisible(false)
      setFeedback(null)
    }
  }, []))

  const saveKey = async (value: string) => {
    if (busy || loadFailed || mutationPending.current)
      return

    mutationPending.current = true
    setIsSaving(true)
    setError(null)
    setFeedback(null)

    try {
      await setDeepSeekApiKey(value)
      setHasSavedKey(Boolean(value.trim()))
      setApiKey('')
      setIsVisible(false)
      setFeedback(t(value.trim() ? 'setting.ai.saved' : 'setting.ai.cleared'))
    }
    catch {
      // Preserve the draft so a failed secure-storage write can be retried.
      setError(t('setting.ai.saveError'))
    }
    finally {
      mutationPending.current = false
      setIsSaving(false)
    }
  }

  const confirmClear = () => {
    Alert.alert(t('setting.ai.clearTitle'), t('setting.ai.clearDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('setting.ai.clear'), style: 'destructive', onPress: () => void saveKey('') },
    ])
  }

  return (
    <View style={styles.content}>
      <View style={styles.providerRow}>
        <Text style={[styles.label, { color: colors.foreground }]}>DeepSeek</Text>
        {isLoading
          ? <ActivityIndicator size="small" color={colors.primary} />
          : (
              <Text style={[styles.status, { color: hasSavedKey ? colors.primary : colors.mutedForeground }]}>
                {t(loadFailed ? 'setting.ai.unavailable' : hasSavedKey ? 'setting.ai.configured' : 'setting.ai.notConfigured')}
              </Text>
            )}
      </View>
      <Text style={[styles.label, { color: colors.foreground }]}>{t('setting.ai.token')}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          accessibilityLabel={t('setting.ai.token')}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          editable={!busy && !loadFailed}
          importantForAutofill="no"
          onChangeText={(value) => {
            setApiKey(value)
            setError(null)
            setFeedback(null)
          }}
          onSubmitEditing={() => {
            if (apiKey.trim())
              void saveKey(apiKey)
          }}
          placeholder={t(hasSavedKey ? 'setting.ai.replacePlaceholder' : 'setting.ai.placeholder')}
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="done"
          secureTextEntry={!isVisible}
          selectionColor={colors.primary}
          spellCheck={false}
          style={[styles.input, { color: colors.foreground }]}
          textContentType="none"
          value={apiKey}
        />
        <Pressable
          accessibilityLabel={t(isVisible ? 'setting.ai.hideToken' : 'setting.ai.showToken')}
          accessibilityRole="button"
          disabled={busy || loadFailed}
          onPress={() => setIsVisible(value => !value)}
          style={styles.visibilityButton}
        >
          <Ionicons name={isVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{t('setting.ai.description')}</Text>
      {(error || feedback) && (
        <Text accessibilityLiveRegion="polite" style={[styles.description, { color: error ? colors.destructive : colors.primary }]}>
          {error || feedback}
        </Text>
      )}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy || loadFailed || !apiKey.trim() }}
          disabled={busy || loadFailed || !apiKey.trim()}
          onPress={() => void saveKey(apiKey)}
          style={[styles.button, { backgroundColor: colors.primary, opacity: busy || loadFailed || !apiKey.trim() ? 0.45 : 1 }]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{t(isSaving ? 'setting.ai.saving' : 'common.save')}</Text>
        </Pressable>
        {hasSavedKey && !loadFailed && (
          <Pressable accessibilityRole="button" disabled={busy} onPress={confirmClear} style={styles.button}>
            <Text style={[styles.buttonText, { color: colors.destructive, opacity: busy ? 0.45 : 1 }]}>{t('setting.ai.clear')}</Text>
          </Pressable>
        )}
        {loadFailed && (
          <Pressable accessibilityRole="button" onPress={() => setReloadIndex(value => value + 1)} style={styles.button}>
            <Text style={[styles.buttonText, { color: colors.primary }]}>{t('setting.ai.retry')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  providerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 15 },
  status: { fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: 10 },
  input: { flex: 1, minWidth: 0, paddingHorizontal: 12, height: 48, fontSize: 14 },
  visibilityButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  button: { minHeight: 44, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '600' },
})
