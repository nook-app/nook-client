import { FetchChannelsResponse } from '@/utils/api'
import { memo, useCallback, useState } from 'react'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Spinner, View, XStack, YStack, useTheme } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl, TapGestureHandler } from 'react-native-gesture-handler'
import { LoadingScreen } from '../LoadingScreen'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Text } from 'tamagui'
import { Channel } from '@/types'
import { formatNumber, hasChannelDiff } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { UserAvatar } from '../UserAvatar'

export const FarcasterChannelPanel = ({
  keys,
  fetch,
  asTabs,
  asBottomSheet,
  onPress,
  highlighted,
  keyboardShouldPersistTaps,
}: {
  keys: string[]
  fetch: ({ pageParam }: { pageParam?: string }) => Promise<FetchChannelsResponse>
  asTabs?: boolean
  asBottomSheet?: boolean
  limit?: number
  displayMode?: 'expanded' | 'default'
  onPress?: (channel: Channel) => void
  highlighted?: string[]
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
}) => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery<
      FetchChannelsResponse,
      unknown,
      InfiniteData<FetchChannelsResponse>,
      string[],
      string | undefined
    >({
      queryKey: keys,
      queryFn: async ({ pageParam }) => {
        const data = await fetch({ pageParam })
        if (data?.data) {
          for (const channel of data.data) {
            const existingChannel = queryClient.getQueryData<Channel>([
              'channel',
              channel.channelId,
            ])
            if (!existingChannel || hasChannelDiff(existingChannel, channel)) {
              queryClient.setQueryData(['channel', channel.channelId], channel)
            }
          }
        }
        return data
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
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
      renderItem={({ item }: { item: Channel }) => (
        <FarcasterChannelItem
          channel={item}
          onPress={onPress}
          highlighted={highlighted?.includes(item.channelId)}
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

const FarcasterChannelItem = memo(
  ({
    channel,
    onPress,
    highlighted,
  }: {
    channel: Channel
    onPress?: (channel: Channel) => void
    highlighted?: boolean
  }) => {
    return (
      <TapGestureHandler>
        <XStack
          gap="$2"
          alignItems="center"
          paddingHorizontal="$2"
          paddingVertical="$2.5"
          borderRadius="$6"
          marginVertical="$1"
          justifyContent="space-between"
          backgroundColor={highlighted ? '$color4' : 'transparent'}
          onPress={() =>
            onPress
              ? onPress(channel)
              : router.push({
                  pathname: `/channels/[channelId]`,
                  params: { channelId: channel.channelId },
                })
          }
        >
          <XStack gap="$2" alignItems="center" flexShrink={1}>
            <UserAvatar pfp={channel.imageUrl} size="$4" useCdn={false} />
            <YStack flexShrink={1} gap="$1">
              <Text fontWeight="600">{channel.name}</Text>
              <XStack gap="$1" alignItems="center">
                <Text>{`/${channel.channelId}`}</Text>
                {channel.followerCount ? (
                  <Text color="$mauve11">
                    {formatNumber(channel.followerCount || 0)} followers
                  </Text>
                ) : null}
              </XStack>
              {!!channel.description && (
                <Text numberOfLines={1}>{channel.description}</Text>
              )}
            </YStack>
          </XStack>
        </XStack>
      </TapGestureHandler>
    )
  }
)
