import { SheetType, useSheet } from '@/context/sheet'
import { YStack, View, Text, XStack } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Check } from '@tamagui/lucide-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useEffect, useState } from 'react'

export const OptionSelectorSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.OptionSelector)
  const [selected, setSelected] = useState<string | undefined>(sheet.initialState?.value)

  useEffect(() => {
    if (sheet.isOpen) {
      setSelected(sheet.initialState?.value)
    }
  }, [sheet.isOpen])

  const handleSelect = (value: string) => {
    sheet.initialState?.onSelect(value)
    setSelected(value)
    closeSheet(SheetType.OptionSelector)
  }

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetScrollView>
        <YStack padding="$4" paddingBottom="$10">
          {sheet.initialState?.options.map((option) => {
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
              >
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical="$3"
                >
                  <Text color="$mauve12">{option.label(selected === option.value)}</Text>
                  {selected === option.value && (
                    <View backgroundColor="$color8" borderRadius="$12" padding="$1.5">
                      <Check size={12} strokeWidth={4} color="white" />
                    </View>
                  )}
                </XStack>
              </TouchableOpacity>
            )
          })}
        </YStack>
      </BottomSheetScrollView>
    </BaseSheet>
  )
}
