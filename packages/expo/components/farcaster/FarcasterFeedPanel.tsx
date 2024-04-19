import { FetchCastsResponse } from '@/utils/api'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Spinner, View, useTheme as useTamaguiTheme } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import { LoadingScreen } from '../LoadingScreen'
import { Tabs } from 'react-native-collapsible-tab-view'
import { FarcasterFeedItem } from './FarcasterFeedItem'
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  Channel,
  FarcasterCast,
  FarcasterUser,
  PanelDisplay,
  UrlContentResponse,
} from '@/types'
import { Image } from 'expo-image'
import { useScrollToTop } from '@react-navigation/native'
import { hasCastDiff, hasChannelDiff, hasUserDiff } from '@/utils'
import { useScroll } from '@/context/scroll'

const prefetchImages = async (data: FetchCastsResponse) => {
  const images: string[] = []

  const getEmbedImage = (content: UrlContentResponse) => {
    if (!content.type) {
      return content.uri.includes('imgur.com') ? content.uri : undefined
    }
    if (content.type.startsWith('image')) {
      return content.uri
    }
    if (content.metadata?.image) {
      return content.metadata.image
    }
    if (content.frame?.image) {
      return content.frame.image
    }
  }

  for (const cast of data.data) {
    for (const embed of cast.embeds) {
      const image = getEmbedImage(embed)
      if (image) {
        images.push(image)
      }
    }
    if (cast.parent) {
      for (const embed of cast.parent.embeds) {
        const image = getEmbedImage(embed)
        if (image) {
          images.push(image)
        }
      }
    }

    for (const embedCast of cast.embedCasts) {
      for (const embed of embedCast.embeds) {
        const image = getEmbedImage(embed)
        if (image) {
          images.push(image)
        }
      }
    }
  }

  await Image.prefetch(images)
}

export const FarcasterFeedPanel = memo(
  ({
    keys,
    fetch,
    asTabs,
    display = PanelDisplay.CASTS,
    keyboardShouldPersistTaps,
    paddingTop,
    paddingBottom,
    setOverlay,
    ListHeaderComponent,
  }: {
    keys: string[]
    fetch: ({ pageParam }: { pageParam?: string }) => Promise<FetchCastsResponse>
    asTabs?: boolean
    display?: PanelDisplay
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
    paddingTop?: number
    paddingBottom?: number
    setOverlay?: (show: boolean) => void
    ListHeaderComponent?: JSX.Element
  }) => {
    const { setActiveVideo } = useScroll()
    const ref = useRef(null)
    useScrollToTop(ref)

    const [lastScrollY, setLastScrollY] = useState(0)

    const theme = useTamaguiTheme()
    const [refreshing, setRefreshing] = useState(false)
    const queryClient = useQueryClient()

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!setOverlay) return
        const currentScrollY = event.nativeEvent.contentOffset.y
        const delta = currentScrollY - lastScrollY

        if (delta > 0 && currentScrollY > 100) {
          setOverlay(false)
        } else if (delta < -100) {
          setOverlay(true)
        }

        setLastScrollY(currentScrollY)
      },
      [lastScrollY, setOverlay]
    )

    const { data, fetchNextPage, isFetching, isFetchingNextPage, refetch } =
      useInfiniteQuery<
        FetchCastsResponse,
        unknown,
        InfiniteData<FetchCastsResponse>,
        string[],
        string | undefined
      >({
        queryKey: keys,
        queryFn: async ({ pageParam }) => {
          const data = await fetch({ pageParam })
          if (data?.data) {
            for (const cast of data.data) {
              const existingCast = queryClient.getQueryData<FarcasterCast>([
                'cast',
                cast.hash,
              ])
              if (!existingCast || hasCastDiff(existingCast, cast)) {
                queryClient.setQueryData(['cast', cast.hash], cast)
              }

              const existingUser = queryClient.getQueryData<FarcasterUser>([
                'user',
                cast.user.fid,
              ])
              if (!existingUser || hasUserDiff(existingUser, cast.user)) {
                queryClient.setQueryData(['user', cast.user.fid], cast.user)
              }

              for (const mention of cast.mentions) {
                const existingUser = queryClient.getQueryData<FarcasterUser>([
                  'user',
                  mention.user.fid,
                ])
                if (!existingUser || hasUserDiff(existingUser, mention.user)) {
                  queryClient.setQueryData(['user', mention.user.fid], mention.user)
                }
              }

              if (cast.channel) {
                const existingChannel = queryClient.getQueryData<Channel>([
                  'channel',
                  cast.channel.channelId,
                ])
                if (!existingChannel || hasChannelDiff(existingChannel, cast.channel)) {
                  queryClient.setQueryData(
                    ['channel', cast.channel.channelId],
                    cast.channel
                  )
                }
              }

              for (const embed of cast.embedCasts) {
                const existingCast = queryClient.getQueryData<FarcasterCast>([
                  'cast',
                  embed.hash,
                ])
                if (!existingCast || hasCastDiff(existingCast, embed)) {
                  queryClient.setQueryData(['cast', embed.hash], embed)
                }
              }

              if (cast.parent) {
                const existingCast = queryClient.getQueryData<FarcasterCast>([
                  'cast',
                  cast.parent.hash,
                ])
                if (!existingCast || hasCastDiff(existingCast, cast.parent)) {
                  queryClient.setQueryData(['cast', cast.parent.hash], cast.parent)
                }

                const existingUser = queryClient.getQueryData<FarcasterUser>([
                  'user',
                  cast.parent.user.fid,
                ])
                if (!existingUser || hasUserDiff(existingUser, cast.parent.user)) {
                  queryClient.setQueryData(
                    ['user', cast.parent.user.fid],
                    cast.parent.user
                  )
                }

                for (const mention of cast.parent.mentions) {
                  const existingUser = queryClient.getQueryData<FarcasterUser>([
                    'user',
                    mention.user.fid,
                  ])
                  if (!existingUser || hasUserDiff(existingUser, mention.user)) {
                    queryClient.setQueryData(['user', mention.user.fid], mention.user)
                  }
                }

                if (cast.parent.channel) {
                  const existingChannel = queryClient.getQueryData<Channel>([
                    'channel',
                    cast.parent.channel.channelId,
                  ])
                  if (
                    !existingChannel ||
                    hasChannelDiff(existingChannel, cast.parent.channel)
                  ) {
                    queryClient.setQueryData(
                      ['channel', cast.parent.channel.channelId],
                      cast.parent.channel
                    )
                  }
                }

                for (const embed of cast.parent.embedCasts) {
                  const existingCast = queryClient.getQueryData<FarcasterCast>([
                    'cast',
                    embed.hash,
                  ])
                  if (!existingCast || hasCastDiff(existingCast, embed)) {
                    queryClient.setQueryData(['cast', embed.hash], embed)
                  }
                }
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
      queryClient.setQueryData(
        keys,
        (oldData: InfiniteData<FetchCastsResponse> | undefined) => {
          if (!oldData) {
            return {
              pageParams: [],
              pages: [],
            }
          }
          return {
            pageParams: oldData.pageParams.slice(0, 1),
            pages: oldData.pages.slice(0, 1),
          }
        }
      )
      refetch().then(() => setRefreshing(false))
    }, [refetch])

    useEffect(() => {
      if (data) {
        prefetchImages(data.pages[data.pages.length - 1])
      }
    }, [data])

    const handleViewableItemsChanged = useCallback(
      ({ viewableItems }: { viewableItems: { item: FarcasterCast }[] }) => {
        const videos = viewableItems.flatMap(({ item }) =>
          item.embeds.map(({ type, uri }) =>
            type?.startsWith('video') || type?.startsWith('application/x-mpegURL')
              ? uri
              : null
          )
        )
        setActiveVideo(videos.find((video) => video) || '')
      },
      []
    )
    const List = asTabs ? Tabs.FlashList : FlashList

    return (
      <List
        ref={ref}
        data={data?.pages.flatMap((page) => page.data) || []}
        renderItem={({ item }) => <FarcasterFeedItem cast={item} display={display} />}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={5}
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
            progressViewOffset={paddingTop}
          />
        }
        estimatedItemSize={300}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps || 'always'}
        numColumns={display === PanelDisplay.GRID ? 3 : 1}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        contentContainerStyle={{ paddingTop, paddingBottom }}
        onScroll={handleScroll}
        scrollEventThrottle={128}
        ListEmptyComponent={isFetching ? <LoadingScreen /> : null}
        ListHeaderComponent={ListHeaderComponent}
      />
    )
  }
)
