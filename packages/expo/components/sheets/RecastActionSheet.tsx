import { SheetType, useSheet } from '@/context/sheet'
import { YStack, XStack, Text } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { MessageSquareQuote, Repeat2 } from '@tamagui/lucide-icons'
import { CastAction, useCastActions } from '@/hooks/useCastActions'
import { router } from 'expo-router'

export const RecastActionSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.RecastAction)
  const insets = useSafeAreaInsets()
  const { dispatch } = useCastActions(sheet.initialState?.hash || '')

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingBottom: insets.bottom,
        }}
      >
        <YStack
          paddingHorizontal="$6"
          paddingVertical="$4"
          justifyContent="center"
          gap="$5"
        >
          <TouchableOpacity
            onPress={() => {
              dispatch(CastAction.RecastCast)
              closeSheet(SheetType.RecastAction)
            }}
          >
            <XStack gap="$3" alignItems="center">
              <Repeat2 size={20} color="$mauve12" />
              <Text fontSize="$5" fontWeight="500" color="$mauve12">
                Recast
              </Text>
            </XStack>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: `/create/post`,
                params: { embedHash: sheet.initialState?.hash },
              })
              closeSheet(SheetType.RecastAction)
            }}
          >
            <XStack gap="$3" alignItems="center">
              <MessageSquareQuote size={20} color="$mauve12" />
              <Text fontSize="$5" fontWeight="500" color="$mauve12">
                Quote
              </Text>
            </XStack>
          </TouchableOpacity>
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
