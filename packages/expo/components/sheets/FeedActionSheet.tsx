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
import { Feed, User } from '@/types'
import { DebouncedLink } from '../DebouncedLink'

export const FeedActionSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.FeedAction)
  const { feeds } = useAuth()
  const insets = useSafeAreaInsets()
  const [isPolling, setIsPolling] = useState(false)
  const queryClient = useQueryClient()
  const { session } = useAuth()

  const { mutate: mutateDelete } = useMutation({
    mutationFn: async () => {
      await makeRequest(`/feeds/${sheet.initialState?.feedId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.setQueryData<Feed>(['feed', sheet.initialState?.feedId], undefined)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          feeds: prev.feeds.filter((feed) => feed.id !== sheet.initialState?.feedId),
        }
      })
      setIsPolling(false)
      closeSheet(SheetType.FeedAction)
    },
  })

  const handleDelete = useCallback(async () => {
    setIsPolling(true)
    mutateDelete()
  }, [closeSheet])

  const isUserFeed = !!feeds.find((feed) => feed.id === sheet.initialState?.feedId)

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
          {isUserFeed && (
            <DebouncedLink
              href={{
                pathname: '/feeds/[feedId]/settings',
                params: { feedId: sheet.initialState?.feedId },
              }}
              onPress={() => closeSheet(SheetType.FeedAction)}
              absolute
            >
              <XStack gap="$3" alignItems="center">
                <Pencil size={20} color="$mauve12" />
                <Text fontSize="$5" fontWeight="500" color="$mauve12">
                  Update Feed
                </Text>
              </XStack>
            </DebouncedLink>
          )}
          {isUserFeed && (
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
                  Delete Feed
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
