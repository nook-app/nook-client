import { FetchUsersResponse } from '@/utils/api'
import { memo, useCallback, useState } from 'react'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Spinner, View, XStack, YStack, useTheme } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl, TapGestureHandler } from 'react-native-gesture-handler'
import { LoadingScreen } from '../LoadingScreen'
import { Tabs } from 'react-native-collapsible-tab-view'
import { formatNumber, hasUserDiff } from '@/utils'
import { Text } from 'tamagui'
import { useUser } from '@/hooks/useUser'
import { FarcasterUserFollowButton } from './FarcasterUserFollowButton'
import { FarcasterUser } from '@/types'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { PowerBadge } from '../PowerBadge'
import { UserAvatar } from '../UserAvatar'

export const FarcasterUserPanel = ({
  keys,
  fetch,
  asTabs,
  asBottomSheet,
  displayMode = 'default',
  onPress,
  highlighted,
  keyboardShouldPersistTaps,
}: {
  keys: string[]
  fetch: ({ pageParam }: { pageParam?: string }) => Promise<FetchUsersResponse>
  asTabs?: boolean
  asBottomSheet?: boolean
  limit?: number
  displayMode?: 'expanded' | 'default' | 'selector'
  onPress?: (channel: FarcasterUser) => void
  highlighted?: string[]
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
}) => {
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery<
      FetchUsersResponse,
      unknown,
      InfiniteData<FetchUsersResponse>,
      string[],
      string | undefined
    >({
      queryKey: keys,
      queryFn: async ({ pageParam }) => {
        const data = await fetch({ pageParam })
        if (data?.data) {
          for (const user of data.data) {
            const existingUser = queryClient.getQueryData<FarcasterUser>([
              'user',
              user.fid,
            ])
            if (!existingUser || hasUserDiff(existingUser, user)) {
              queryClient.setQueryData(['user', user.fid], user)
            }
          }
        }
        return data
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage, pages) => lastPage?.nextCursor || undefined,
    })

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    refetch().then(() => setRefreshing(false))
  }, [refetch])

  if (!data?.pages) {
    return <LoadingScreen color={asBottomSheet ? '$color1' : '$color1'} />
  }

  const List = asTabs ? Tabs.FlashList : asBottomSheet ? BottomSheetFlatList : FlashList

  return (
    <List
      data={data?.pages.flatMap((page) => page.data) || []}
      renderItem={({ item }: { item: FarcasterUser }) => (
        <FarcasterUserItem
          fid={item.fid}
          displayMode={displayMode}
          onPress={onPress}
          highlighted={highlighted?.includes(item.fid)}
        />
      )}
      onEndReached={hasNextPage ? fetchNextPage : undefined}
      onEndReachedThreshold={0.1}
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View padding="$2">
            <Spinner />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          colors={[theme.mauve12.val]}
          tintColor={theme.mauve12.val}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      }
      estimatedItemSize={150}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps || 'always'}
    />
  )
}

const FarcasterUserItem = memo(
  ({
    fid,
    displayMode,
    onPress,
    highlighted,
  }: {
    fid: string
    displayMode: 'expanded' | 'default' | 'selector'
    onPress?: (user: FarcasterUser) => void
    highlighted?: boolean
  }) => {
    const { user } = useUser(fid)
    if (!user) return null

    return (
      <TapGestureHandler>
        <XStack
          gap="$2"
          onPress={() =>
            onPress
              ? onPress(user)
              : router.push({
                  pathname: `/users/[fid]`,
                  params: { fid: user.fid },
                })
          }
          backgroundColor={highlighted ? '$color3' : 'transparent'}
          paddingHorizontal="$2"
          paddingVertical="$2"
          borderRadius="$6"
          marginVertical="$2"
        >
          <UserAvatar pfp={user.pfp} size="$4" />
          {displayMode === 'default' && (
            <YStack flex={1} gap="$1.5">
              <XStack gap="$1.5" justifyContent="space-between">
                <YStack>
                  <XStack gap="$1.5" alignItems="center">
                    <Text fontWeight="600" color="$mauve12" flexShrink={1}>
                      {`${user.displayName || user.username || `!${user.fid}`}`}
                    </Text>
                    <View>
                      <PowerBadge fid={user.fid} />
                    </View>
                  </XStack>
                  <XStack gap="$1.5" alignItems="center">
                    <Text fontWeight="500" color="$mauve11" flexWrap="wrap">
                      {user.username ? `@${user.username}` : `!${user.fid}`}
                    </Text>
                    {user.context?.followers && (
                      <View
                        paddingVertical="$1"
                        paddingHorizontal="$2"
                        borderRadius="$2"
                        backgroundColor="$color3"
                      >
                        <Text fontSize="$2" fontWeight="500" color="$color11">
                          Follows you
                        </Text>
                      </View>
                    )}
                  </XStack>
                </YStack>
                <View alignItems="flex-end">
                  <FarcasterUserFollowButton fid={user.fid} />
                </View>
              </XStack>
              {user.bio && (
                <Text color="$mauve12" numberOfLines={2}>
                  {user.bio}
                </Text>
              )}
            </YStack>
          )}
          {displayMode === 'selector' && (
            <YStack gap="$1" flex={1}>
              <XStack gap="$1.5" alignItems="center">
                <Text fontWeight="600">{user.displayName}</Text>
                <PowerBadge fid={user.fid} />
                {user.context?.followers && (
                  <View
                    paddingVertical="$1"
                    paddingHorizontal="$2"
                    borderRadius="$2"
                    backgroundColor="$color3"
                  >
                    <Text fontSize="$2" fontWeight="500" color="$color11">
                      Follows you
                    </Text>
                  </View>
                )}
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Text fontWeight="500" color="$mauve11" flexWrap="wrap">
                  {user.username ? `@${user.username}` : `!${user.fid}`}
                </Text>
                <Text color="$mauve11">
                  {formatNumber(user.engagement.followers || 0)} followers
                </Text>
              </XStack>
              {!!user.bio && <Text numberOfLines={2}>{user.bio}</Text>}
            </YStack>
          )}
        </XStack>
      </TapGestureHandler>
    )
  }
)
