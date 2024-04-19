import { SheetType, useSheet } from '@/context/sheet'
import { View, Text, YStack } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { Image } from 'expo-image'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button } from '../Button'

export const InfoSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.Info)
  const insets = useSafeAreaInsets()

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingTop: sheet.fullscreen ? insets.top : 0,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <YStack paddingHorizontal="$3" gap="$3.5">
          <View borderRadius="$4" overflow="hidden" width="$5">
            <Image source={require('@/assets/icon.png')} style={{ aspectRatio: 1 }} />
          </View>
          <Text fontWeight="700" fontSize="$8" color="$mauve12">
            {sheet.initialState?.title || ''}
          </Text>
          <Text color="$mauve12">{sheet.initialState?.description || ''}</Text>
          <Button
            onPress={() => {
              if (sheet.initialState?.route) router.push(sheet.initialState.route)
              closeSheet(SheetType.Info)
            }}
          >
            {sheet.initialState?.buttonText || 'Close'}
          </Button>
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
