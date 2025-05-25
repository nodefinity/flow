import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Dialog, List, Portal, RadioButton, Text } from 'react-native-paper'
import Animated from 'react-native-reanimated'

interface SettingSelectorProps {
  title: string
  icon: string
  currentValue: string
  options: Array<{ value: string, label: string }>
  onValueChange: (value: string) => void
  cancelText?: string
}

export function SettingSelector({
  title,
  icon,
  currentValue,
  options,
  onValueChange,
  cancelText = '取消',
}: SettingSelectorProps) {
  const [visibleDialog, setVisibleDialog] = useState(false)

  const currentOption = options.find(opt => opt.value === currentValue)
  const currentLabel = currentOption?.label || options[0]?.label || ''

  const handlePress = () => {
    setVisibleDialog(true)
  }

  const handleOptionChange = (value: string) => {
    onValueChange(value)
    setVisibleDialog(false)
  }

  const renderOptions = () => {
    return options.map(option => (
      <RadioButton.Item
        key={option.value}
        label={option.label}
        value={option.value}
        status={currentValue === option.value ? 'checked' : 'unchecked'}
        onPress={() => handleOptionChange(option.value)}
        labelStyle={styles.radioLabel}
      />
    ))
  }

  return (
    <>
      <List.Item
        title={title}
        left={props => (
          <List.Icon
            {...props}
            icon={({ size, color }) => (
              <MaterialCommunityIcons
                name={icon as any}
                size={size}
                color={color}
              />
            )}
          />
        )}
        right={props => (
          <View style={styles.rightContainer}>
            <Text style={styles.settingText}>
              {currentLabel}
            </Text>
            <List.Icon {...props} icon="chevron-right" />
          </View>
        )}
        onPress={handlePress}
        style={styles.listItem}
      />

      <Portal>
        <Dialog visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Dialog.ScrollArea style={styles.radioContainer}>
              <Animated.ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                <RadioButton.Group
                  value={currentValue}
                  onValueChange={handleOptionChange}
                >
                  {renderOptions()}
                </RadioButton.Group>
              </Animated.ScrollView>
            </Dialog.ScrollArea>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleDialog(false)}>
              {cancelText}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  )
}

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    minHeight: 56,
  },
  settingText: {
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  radioLabel: {
    fontSize: 16,
  },
})
