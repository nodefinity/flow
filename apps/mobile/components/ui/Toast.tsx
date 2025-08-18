import type { ToastConfig } from '@/context/ToastContext'
import { merge } from '@flow/shared'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ToastContext } from '@/context/ToastContext'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [config, setConfig] = useState<ToastConfig>({
    message: '',
    type: 'info',
    duration: 3000,
    position: 'bottom',
  })

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current
  const scale = useRef(new Animated.Value(0.9)).current
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const insets = useSafeAreaInsets()
  const theme = useTheme()

  const hideToast = useCallback(() => {
    // 执行退出动画
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: config.position === 'top' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false)
    })

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [opacity, translateY, scale, config.position])

  const showToast = useCallback((newConfig: ToastConfig) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const defaultConfig: ToastConfig = {
      duration: 3000,
      type: 'info',
      position: 'bottom',
      message: '',
    }

    const finalConfig = merge(defaultConfig, newConfig)

    setConfig(finalConfig)
    setVisible(true)

    // 重置动画值
    opacity.setValue(0)
    translateY.setValue(finalConfig.position === 'top' ? -50 : 50)
    scale.setValue(0.9)

    // 执行进入动画
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // 设置自动隐藏
    if (finalConfig.duration && finalConfig.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideToast()
      }, finalConfig.duration)
    }
  }, [opacity, translateY, scale, hideToast])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getToastStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      zIndex: 9999,
    }

    switch (config.position) {
      case 'top':
        return {
          ...baseStyle,
          top: insets.top + 16,
        }
      case 'center':
        return {
          ...baseStyle,
          top: (screenHeight - 56) / 2, // 56 是大概的 toast 高度
        }
      case 'bottom':
      default:
        return {
          ...baseStyle,
          bottom: insets.bottom + 16,
        }
    }
  }

  const getToastColors = () => {
    const { colors } = theme

    switch (config.type) {
      case 'success':
        return {
          background: colors.primaryContainer,
          text: colors.onPrimaryContainer,
        }
      case 'error':
        return {
          background: colors.errorContainer,
          text: colors.onErrorContainer,
        }
      case 'warning':
        return {
          background: colors.secondaryContainer,
          text: colors.onSecondaryContainer,
        }
      case 'info':
      default:
        return {
          background: colors.tertiaryContainer,
          text: colors.onTertiaryContainer,
        }
    }
  }

  const toastColors = getToastColors()
  const contextValue = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast])

  return (
    <ToastContext value={contextValue}>
      {children}
      {visible && (
        <Animated.View
          style={[
            getToastStyle(),
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.toastContainer,
              {
                backgroundColor: toastColors.background,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <Text
              style={[
                styles.toastText,
                {
                  color: toastColors.text,
                },
              ]}
              numberOfLines={2}
            >
              {config.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext>
  )
}

const styles = StyleSheet.create({
  toastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: screenWidth - 32,
    alignSelf: 'center',
    // Material Design 阴影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
})
