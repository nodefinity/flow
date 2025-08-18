import type { BottomSheetBackdropProps, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useBackHandler } from '@/hooks/useBackHandler'

interface ThemedBottomSheetModalProps extends BottomSheetModalProps {
  children: React.ReactNode
  enablePanDownToClose?: boolean
  enableDynamicSizing?: boolean
  backgroundStyle?: object
  handleIndicatorStyle?: object
  visible?: boolean
  onDismiss?: () => void
}

export function ThemedBottomSheetModal({
  children,
  enablePanDownToClose = true,
  enableDynamicSizing = false,
  snapPoints: customSnapPoints,
  backgroundStyle,
  handleIndicatorStyle,
  visible = false,
  onDismiss,
  ...rest
}: ThemedBottomSheetModalProps) {
  const ref = useRef<BottomSheetModal>(null)
  const { colors } = useTheme()

  useEffect(() => {
    if (visible) {
      ref.current?.present()
    }
    else {
      ref.current?.dismiss()
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  )

  const materialBackgroundStyle = useMemo(
    () => [
      {
        backgroundColor: colors.surfaceVariant,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      backgroundStyle,
    ],
    [colors.surfaceVariant, backgroundStyle],
  )

  const materialHandleIndicatorStyle = useMemo(
    () => [
      {
        backgroundColor: colors.onSurfaceVariant,
        opacity: 0.4,
      },
      handleIndicatorStyle,
    ],
    [colors.onSurfaceVariant, handleIndicatorStyle],
  )

  const handleDismiss = useCallback(() => {
    onDismiss?.()
    ref.current?.dismiss()
  }, [onDismiss])

  useBackHandler(visible, handleDismiss)

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={customSnapPoints ?? ['50%', '90%']}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      backgroundStyle={materialBackgroundStyle}
      handleIndicatorStyle={materialHandleIndicatorStyle}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      style={styles.bottomSheet}
      {...rest}
    >
      {children}
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
})
