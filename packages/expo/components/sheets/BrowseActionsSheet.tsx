import { SheetState, SheetType, useSheet, useSheets } from '@/context/sheet'
import { YStack, XStack, View, Text, useDebounceValue, Spinner } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useEffect, useState } from 'react'
import { FetchActionsResponse, searchActions } from '@/utils/api'
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { SearchInput } from '../SearchInput'
import { Keyboard, KeyboardAvoidingView, Linking } from 'react-native'
import { Octicons } from '@expo/vector-icons'
import { useActions } from '@/context/actions'
import { haptics } from '@/utils/haptics'
import { stringToColor } from '@/utils'
import { Plus, X } from '@tamagui/lucide-icons'
import { CastActionRequest } from '@/types'
import { useUser } from '@/hooks/useUser'
import { UserAvatar } from '../UserAvatar'
import { PowerBadge } from '../PowerBadge'

export const BrowseActionsSheet = () => {
  const { sheet, closeSheet, openSheet } = useSheet(SheetType.BrowseActions)
  const { updateAction } = useActions()
  const [query, setQuery] = useState('')
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounceValue(query, 500)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery<
      FetchActionsResponse,
      unknown,
      InfiniteData<FetchActionsResponse>,
      string[],
      string | undefined
    >({
      queryKey: ['searchActions', debouncedQuery],
      queryFn: async ({ pageParam }) => {
        const data = await searchActions(debouncedQuery, pageParam)
        return data
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage, pages) => lastPage?.nextCursor || undefined,
    })

  useEffect(() => {
    if (sheet.isOpen) {
      refetch()
    }
  }, [sheet.isOpen])

  const handlePress = async (item: CastActionRequest) => {
    const index = sheet.initialState?.index
    if (index === null || index === undefined) {
      Linking.openURL(
        `https://warpcast.com/~/add-cast-action?name=${encodeURIComponent(
          item.name
        )}&icon=${encodeURIComponent(item.icon)}&actionType=${encodeURIComponent(
          item.actionType
        )}&postUrl=${encodeURIComponent(item.postUrl)}`
      )
    } else {
      await handleAddAction(index, item)
    }
  }

  const handleAddAction = async (index: number, action: CastActionRequest | null) => {
    setLoading(true)
    await updateAction(
      index,
      action
        ? {
            name: action.name,
            icon: action.icon,
            actionType: action.actionType,
            postUrl: action.postUrl,
          }
        : null
    )
    haptics.notificationSuccess()
    closeSheet(SheetType.BrowseActions)
    setLoading(false)
  }

  return (
    <BaseSheet sheet={sheet}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <YStack
          style={{
            paddingBottom: insets.bottom,
          }}
          gap="$4"
          paddingHorizontal="$3"
          flex={1}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text>
              <Text fontWeight="600" fontSize="$8" color="$mauve12">
                {sheet.initialState?.index !== null ? 'Add action' : 'Open in Warpcast'}
              </Text>
            </Text>
            <XStack gap="$2">
              {loading && <Spinner />}
              {sheet.initialState?.index !== null && !loading && (
                <TouchableOpacity
                  onPress={() => {
                    if (
                      sheet.initialState?.index === null ||
                      sheet.initialState?.index === undefined
                    )
                      return
                    handleAddAction(sheet.initialState.index, null)
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <XStack padding="$2" gap="$1" alignItems="center">
                    <X size={16} />
                    <Text color="$mauve12" fontWeight="500">
                      Clear
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )}
              {sheet.initialState?.index !== null && !loading && (
                <TouchableOpacity
                  onPress={() => {
                    openSheet(SheetType.AddAction, {
                      index: sheet.initialState?.index,
                    })
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <XStack padding="$2" gap="$1" alignItems="center">
                    <Plus size={16} />
                    <Text color="$mauve12" fontWeight="500">
                      Import
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )}
            </XStack>
          </XStack>
          <SearchInput query={query} setQuery={setQuery} />
          <View style={{ minHeight: 2 }} flexGrow={1}>
            {!data?.pages ? (
              <View padding="$4">
                <Spinner size="large" />
              </View>
            ) : (
              <BottomSheetFlatList
                data={data?.pages.flatMap((page) => page.data) || []}
                renderItem={({ item }) => (
                  <Item item={item} onPress={() => handlePress(item)} />
                )}
                // @ts-ignore
                onEndReached={hasNextPage ? fetchNextPage : undefined}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() =>
                  isFetchingNextPage ? (
                    <View padding="$2">
                      <Spinner />
                    </View>
                  ) : null
                }
                estimatedItemSize={100}
                onScrollBeginDrag={() => Keyboard.dismiss()}
                keyboardShouldPersistTaps="always"
              />
            )}
          </View>
        </YStack>
      </KeyboardAvoidingView>
    </BaseSheet>
  )
}

const Item = ({ item, onPress }: { item: CastActionRequest; onPress: () => void }) => {
  const { user } = useUser(item.creatorFid || '')
  let host = ''
  try {
    host = new URL(item.postUrl).hostname
  } catch (e) {}

  return (
    <TouchableOpacity onPress={onPress}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$2"
        paddingVertical="$2.5"
      >
        <XStack alignItems="center" gap="$2" flexShrink={1}>
          <View
            width="$5"
            height="$5"
            alignItems="center"
            justifyContent="center"
            borderRadius="$4"
            backgroundColor={stringToColor(item.name)}
          >
            {/* @ts-ignore */}
            <Octicons name={item.icon} size={24} color="white" />
          </View>
          <YStack gap="$1" flexShrink={1}>
            <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
              {item.name}
            </Text>
            <XStack gap="$1.5" alignItems="center">
              {user && (
                <>
                  <Text fontWeight="500" color="$mauve12">
                    by
                  </Text>
                  <UserAvatar pfp={user.pfp} size="$1" />
                  <Text gap="$1.5" alignItems="center" numberOfLines={1}>
                    <Text fontWeight="500" color="$mauve12">
                      {user.username || `!${user.fid}`}{' '}
                    </Text>
                    <PowerBadge fid={user.fid} />
                  </Text>
                </>
              )}
            </XStack>
            <XStack gap="$1.5" alignItems="center">
              {item.users && item.users > 0 && (
                <>
                  <Text numberOfLines={1} color="$mauve11">
                    {`${item.users} user${item.users > 1 ? 's' : ''}`}
                  </Text>
                  <Text>{' ·'}</Text>
                </>
              )}
              <Text numberOfLines={1} color="$mauve11" flexShrink={1}>
                {host}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </XStack>
    </TouchableOpacity>
  )
}
