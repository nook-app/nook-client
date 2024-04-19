import { SheetType, useSheet } from '@/context/sheet'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useAuth } from '@/context/auth'
import { useCallback, useState } from 'react'
import { Pencil, Trash } from '@tamagui/lucide-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@/utils/api'
import { Nook, User } from '@/types'
import { DebouncedLink } from '../DebouncedLink'

export const NookActionSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.NookAction)
  const { nooks } = useAuth()
  const insets = useSafeAreaInsets()
  const [isPolling, setIsPolling] = useState(false)
  const queryClient = useQueryClient()
  const { session } = useAuth()

  const { mutate: mutateDelete } = useMutation({
    mutationFn: async () => {
      await makeRequest(`/groups/${sheet.initialState?.nookId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.setQueryData<Nook>(['nook', sheet.initialState?.nookId], undefined)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          nooks: prev.nooks.filter((nook) => nook.id !== sheet.initialState?.nookId),
        }
      })
      setIsPolling(false)
      closeSheet(SheetType.NookAction)
    },
  })

  const handleDelete = useCallback(async () => {
    setIsPolling(true)
    mutateDelete()
  }, [closeSheet])

  const userNook = nooks.find((nook) => nook.id === sheet.initialState?.nookId)
  const isUserNook = !!userNook
  const isDeletable = userNook?.type !== 'default'

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
          {isUserNook && (
            <DebouncedLink
              href={{
                pathname: '/nooks/[nookId]/settings',
                params: { nookId: sheet.initialState?.nookId },
              }}
              onPress={() => closeSheet(SheetType.NookAction)}
              absolute
            >
              <XStack gap="$3" alignItems="center">
                <Pencil size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Update Nook
                </Text>
              </XStack>
            </DebouncedLink>
          )}
          {isUserNook && isDeletable && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isPolling}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <XStack gap="$3" alignItems="center">
                {isPolling ? <Spinner /> : <Trash size={20} color="$red9" />}
                <Text fontSize="$5" fontWeight="500" color="$red9">
                  Delete Nook
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
