import type { ToastConfig } from '@/context/ToastContext'
import { merge } from '@flow/shared'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ToastContext } from '@/context/ToastContext'
import { useColors } from '@/hooks/useColors'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [config, setConfig] = useState<ToastConfig>({ message: '', type: 'info', duration: 3000, position: 'bottom' })

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(0.9)).current
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const insets = useSafeAreaInsets()
  const colors = useColors()

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: config.position === 'top' ? -50 : 50, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false))

    if (timeoutRef.current)
      clearTimeout(timeoutRef.current)
  }, [opacity, translateY, scale, config.position])

  const showToast = useCallback((newConfig: ToastConfig) => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current)

    const finalConfig = merge({ duration: 3000, type: 'info', position: 'bottom', message: '' } as ToastConfig, newConfig)
    setConfig(finalConfig)
    setVisible(true)

    opacity.setValue(0)
    translateY.setValue(finalConfig.position === 'top' ? -50 : 50)
    scale.setValue(0.9)

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
    ]).start()

    if (finalConfig.duration && finalConfig.duration > 0) {
      timeoutRef.current = setTimeout(hideToast, finalConfig.duration)
    }
  }, [opacity, translateY, scale, hideToast])

  useEffect(() => () => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current)
  }, [])

  const getPositionStyle = () => {
    const base = { position: 'absolute' as const, left: 16, right: 16, zIndex: 9999 }
    if (config.position === 'top')
      return { ...base, top: insets.top + 16 }
    if (config.position === 'center')
      return { ...base, top: (screenHeight - 56) / 2 }
    return { ...base, bottom: insets.bottom + 16 }
  }

  const toastBg = config.type === 'error' ? colors.destructive : colors.card
  const toastText = config.type === 'error' ? '#fff' : colors.foreground

  const contextValue = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast])

  return (
    <ToastContext value={contextValue}>
      {children}
      {visible && (
        <Animated.View
          style={[getPositionStyle(), { opacity, transform: [{ translateY }, { scale }] }]}
          pointerEvents="none"
        >
          <View style={[styles.container, { backgroundColor: toastBg, shadowColor: '#000' }]}>
            <Text style={[styles.text, { color: toastText }]} numberOfLines={2}>
              {config.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: screenWidth - 32,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
})
