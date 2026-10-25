import type { BottomSheetBackdropProps, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useBackHandler } from '@/hooks/useBackHandler'
import { useColors } from '@/hooks/useColors'

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
  const colors = useColors()

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

  const mergedBackgroundStyle = useMemo(
    () => [{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16 }, backgroundStyle],
    [colors.card, backgroundStyle],
  )

  const mergedHandleStyle = useMemo(
    () => [{ backgroundColor: colors.mutedForeground, opacity: 0.4 }, handleIndicatorStyle],
    [colors.mutedForeground, handleIndicatorStyle],
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
      backgroundStyle={mergedBackgroundStyle}
      handleIndicatorStyle={mergedHandleStyle}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 }}
      {...rest}
    >
      {children}
    </BottomSheetModal>
  )
}
