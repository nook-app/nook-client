import { FetchTransactionsResponse } from '@/utils/api'
import { memo, useCallback, useState } from 'react'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Spinner, View, useTheme } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl } from 'react-native-gesture-handler'
import { LoadingScreen } from '../LoadingScreen'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Keyboard } from 'react-native'
import { TransactionFeedItem } from './TransactionFeedItem'

export const TransactionFeedPanel = memo(
  ({
    keys,
    fetch,
    asTabs,
    displayMode = 'default',
  }: {
    keys: string[]
    fetch: ({ pageParam }: { pageParam?: string }) => Promise<FetchTransactionsResponse>
    asTabs?: boolean
    displayMode?: 'media' | 'frame' | 'replies' | 'default'
  }) => {
    const theme = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const queryClient = useQueryClient()
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
      useInfiniteQuery<
        FetchTransactionsResponse,
        unknown,
        InfiniteData<FetchTransactionsResponse>,
        string[],
        string | undefined
      >({
        queryKey: keys,
        queryFn: async ({ pageParam }) => {
          const data = await fetch({ pageParam })
          if (data.data.length > 0) {
            data.data.forEach((tx) => {
              if (!queryClient.getQueryData(['tx', tx.hash])) {
                queryClient.setQueryData(['tx', tx.hash], tx)
              }
            })
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
      return <LoadingScreen />
    }

    if (data.pages.length === 0 || data.pages[0].data.length === 0) {
      return null
    }

    const List = asTabs ? Tabs.FlashList : FlashList

    return (
      <List
        data={data?.pages.flatMap((page) => page.data) || []}
        renderItem={({ item }) => <TransactionFeedItem tx={item} />}
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
        estimatedItemSize={200}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />
    )
  }
)
