import { FetchNotificationsResponse } from '@/utils/api'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Spinner, Text, View, XStack, YStack, useTheme as useTamaguiTheme } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import { RefreshControl, TapGestureHandler } from 'react-native-gesture-handler'
import { LoadingScreen } from '../LoadingScreen'
import { Tabs } from 'react-native-collapsible-tab-view'
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  FarcasterCast as FarcasterCastType,
  FarcasterUser,
  UrlContentResponse,
  NotificationResponse,
} from '@/types'
import { Image } from 'expo-image'
import { useScrollToTop } from '@react-navigation/native'
import { hasCastDiff, hasUserDiff } from '@/utils'
import { FarcasterCast } from './FarcasterCast'
import { useCast } from '@/hooks/useCast'
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons'
import { UserAvatar } from '../UserAvatar'
import { useAuth } from '@/context/auth'
import { FarcasterCastText } from './FarcasterCastText'
import { Href } from 'expo-router/build/link/href'
import { DebouncedLink } from '../DebouncedLink'
import { useScroll } from '@/context/scroll'

const prefetchImages = async (data: FetchNotificationsResponse) => {
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

  for (const notification of data.data) {
    const cast = notification.cast
    if (!cast) continue

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

export const FarcasterNotificationsPanel = memo(
  ({
    keys,
    fetch,
    asTabs,
    keyboardShouldPersistTaps,
    paddingTop,
    paddingBottom,
    ListHeaderComponent,
  }: {
    keys: string[]
    fetch: ({ pageParam }: { pageParam?: string }) => Promise<FetchNotificationsResponse>
    asTabs?: boolean
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
    paddingTop?: number
    paddingBottom?: number
    ListHeaderComponent?: JSX.Element
  }) => {
    const ref = useRef(null)
    useScrollToTop(ref)

    const { setShowNotificationsOverlay } = useScroll()
    const [lastScrollY, setLastScrollY] = useState(0)

    const theme = useTamaguiTheme()
    const [refreshing, setRefreshing] = useState(false)
    const queryClient = useQueryClient()

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y
        const delta = currentScrollY - lastScrollY

        if (delta > 0 && currentScrollY > 100) {
          setShowNotificationsOverlay(false)
        } else if (delta < -100) {
          setShowNotificationsOverlay(true)
        }

        setLastScrollY(currentScrollY)
      },
      [lastScrollY, setShowNotificationsOverlay]
    )

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
      useInfiniteQuery<
        FetchNotificationsResponse,
        unknown,
        InfiniteData<FetchNotificationsResponse>,
        string[],
        string | undefined
      >({
        queryKey: keys,
        queryFn: async ({ pageParam }) => {
          const data = await fetch({ pageParam })
          if (!data?.data) {
            for (const notification of data.data) {
              if (notification.cast) {
                const existingCast = queryClient.getQueryData<FarcasterCastType>([
                  'cast',
                  notification.cast.hash,
                ])
                if (!existingCast || hasCastDiff(existingCast, notification.cast)) {
                  queryClient.setQueryData(
                    ['cast', notification.cast.hash],
                    notification.cast
                  )
                }
                for (const user of notification.users || []) {
                  const existingUser = queryClient.getQueryData<FarcasterUser>([
                    'user',
                    user.fid,
                  ])
                  if (!existingUser || hasUserDiff(existingUser, user)) {
                    queryClient.setQueryData(['user', user.fid], user)
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
        (oldData: InfiniteData<FetchNotificationsResponse> | undefined) => {
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

    if (!data?.pages) {
      return <LoadingScreen />
    }

    if (data.pages.length === 0 || data.pages[0].data.length === 0) {
      return (
        <View
          flex={1}
          backgroundColor="$color1"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$mauve12">No notifications yet.</Text>
        </View>
      )
    }

    const List = asTabs ? Tabs.FlashList : FlashList

    return (
      <List
        ref={ref}
        data={data?.pages.flatMap((page) => page.data) || []}
        renderItem={({ item }) => <NotificationItem notification={item} />}
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
            progressViewOffset={paddingTop}
          />
        }
        estimatedItemSize={300}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps || 'always'}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        contentContainerStyle={{ paddingTop, paddingBottom }}
        onScroll={handleScroll}
        scrollEventThrottle={128}
        ListHeaderComponent={ListHeaderComponent}
      />
    )
  }
)

const NotificationItem = memo(
  ({ notification }: { notification: NotificationResponse }) => {
    switch (notification.type) {
      case 'MENTION':
        return <MentionNotification notification={notification} />
      case 'REPLY':
        return <ReplyNotification notification={notification} />
      case 'LIKE':
        return <LikeNotification notification={notification} />
      case 'RECAST':
        return <RecastNotification notification={notification} />
      case 'QUOTE':
        return <QuoteNotification notification={notification} />
      case 'FOLLOW':
        return <FollowNotification notification={notification} />
      case 'POST':
        return <PostNotification notification={notification} />
      default:
        return null
    }
  }
)

const PostNotification = ({ notification }: { notification: NotificationResponse }) => {
  if (!notification.cast) return null
  return (
    <Notification
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <View flex={1}>
        <FarcasterCast cast={notification.cast} hideSeparator />
      </View>
    </Notification>
  )
}

const MentionNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast) return null
  return (
    <Notification
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <View flex={1}>
        <FarcasterCast cast={notification.cast} hideSeparator />
      </View>
    </Notification>
  )
}

const ReplyNotification = ({ notification }: { notification: NotificationResponse }) => {
  if (!notification.cast) return null
  return (
    <Notification
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <View flex={1}>
        <FarcasterCast cast={notification.cast} hideSeparator />
      </View>
    </Notification>
  )
}

const QuoteNotification = ({ notification }: { notification: NotificationResponse }) => {
  if (!notification.cast) return null
  return (
    <Notification
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <View flex={1}>
        <FarcasterCast cast={notification.cast} hideSeparator />
      </View>
    </Notification>
  )
}

const LikeNotification = ({ notification }: { notification: NotificationResponse }) => {
  const { session } = useAuth()
  const theme = useTamaguiTheme()
  const { cast } = useCast(notification.cast?.hash || '')
  if (!notification.users || notification.users.length === 0 || !cast) return null
  return (
    <Notification
      iconBackgroundColor="$red5"
      icon={<FontAwesome name="heart" size={18} color={theme.red9.val} />}
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <YStack gap="$2" flexShrink={1}>
        <XStack gap="$2">
          {notification.users.slice(0, 7).map((user, i) => (
            <DebouncedLink
              key={i}
              href={{
                pathname: `/users/[fid]`,
                params: { fid: user.fid },
              }}
              asChild
            >
              <View>
                <UserAvatar pfp={user.pfp} size="$2.5">
                  <View
                    position="absolute"
                    backgroundColor="$color3"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="100%"
                  >
                    <FontAwesome name="user" size={20} color={theme.color6.val} />
                  </View>
                </UserAvatar>
              </View>
            </DebouncedLink>
          ))}
        </XStack>
        <Text color="$mauve12">
          <DebouncedLink
            href={{
              pathname: `/users/[fid]`,
              params: { fid: notification.users[0].fid },
            }}
            asChild
          >
            <Text fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </Text>
          </DebouncedLink>
          {notification.users.length > 1 && (
            <>
              <Text color="$mauve12"> and </Text>
              <DebouncedLink
                href={{
                  pathname: `/users/[fid]/followers`,
                  params: { fid: session?.fid },
                }}
                asChild
              >
                <Text fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? 's' : ''}`}</Text>
              </DebouncedLink>
            </>
          )}
          <Text color="$mauve12"> liked your post</Text>
        </Text>
        <DebouncedLink
          href={{
            pathname: '/casts/[hash]',
            params: { hash: notification.cast?.hash },
          }}
          asChild
        >
          <YStack gap="$2">
            <FarcasterCastText cast={cast} color="$mauve11" />
            {cast.embeds.map((embed, i) => {
              return (
                <Text key={i} color="$mauve11">
                  {embed.uri}
                </Text>
              )
            })}
          </YStack>
        </DebouncedLink>
      </YStack>
    </Notification>
  )
}

const RecastNotification = ({ notification }: { notification: NotificationResponse }) => {
  const { session } = useAuth()
  const theme = useTamaguiTheme()
  const { cast } = useCast(notification.cast?.hash || '')
  if (!notification.users || notification.users.length === 0 || !cast) return null

  return (
    <Notification
      iconBackgroundColor="$green5"
      icon={<FontAwesome6 name="retweet" size={16} color={theme.green9.val} />}
      href={{
        pathname: '/casts/[hash]',
        params: { hash: notification.cast?.hash },
      }}
    >
      <YStack gap="$2" flexShrink={1}>
        <XStack gap="$2">
          {notification.users.slice(0, 7).map((user, i) => (
            <DebouncedLink
              key={i}
              href={{
                pathname: `/users/[fid]`,
                params: { fid: user.fid },
              }}
              asChild
            >
              <View>
                <UserAvatar pfp={user.pfp} size="$2.5">
                  <View
                    position="absolute"
                    backgroundColor="$color3"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height="100%"
                  >
                    <FontAwesome name="user" size={20} color={theme.color6.val} />
                  </View>
                </UserAvatar>
              </View>
            </DebouncedLink>
          ))}
        </XStack>
        <Text color="$mauve12">
          <DebouncedLink
            href={{
              pathname: `/users/[fid]`,
              params: { fid: notification.users[0].fid },
            }}
            asChild
          >
            <Text fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </Text>
          </DebouncedLink>
          {notification.users.length > 1 && (
            <>
              <Text color="$mauve12"> and </Text>
              <DebouncedLink
                href={{
                  pathname: `/users/[fid]/followers`,
                  params: { fid: session?.fid },
                }}
                asChild
              >
                <Text fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? 's' : ''}`}</Text>
              </DebouncedLink>
            </>
          )}
          <Text color="$mauve12"> recasted your post</Text>
        </Text>
        <DebouncedLink
          href={{
            pathname: '/casts/[hash]',
            params: { hash: notification.cast?.hash },
          }}
          asChild
        >
          <YStack gap="$2">
            <FarcasterCastText cast={cast} color="$mauve11" />
            {cast.embeds.map((embed, i) => {
              return (
                <Text key={i} color="$mauve11">
                  {embed.uri}
                </Text>
              )
            })}
          </YStack>
        </DebouncedLink>
      </YStack>
    </Notification>
  )
}

const FollowNotification = ({ notification }: { notification: NotificationResponse }) => {
  const { session } = useAuth()
  const theme = useTamaguiTheme()
  if (!notification.users || notification.users.length === 0) return null

  return (
    <Notification
      iconBackgroundColor="$mauve5"
      icon={<FontAwesome name="user" size={18} color={theme.mauve9.val} />}
      href={{
        pathname: `/users/[fid]/followers`,
        params: { fid: session?.fid },
      }}
    >
      <YStack gap="$2" flexShrink={1}>
        <XStack gap="$2">
          {notification.users.slice(0, 7).map((user, i) => (
            <DebouncedLink
              key={i}
              href={{
                pathname: `/users/[fid]`,
                params: { fid: user.fid },
              }}
            >
              <UserAvatar pfp={user.pfp} size="$2.5">
                <View
                  position="absolute"
                  backgroundColor="$color3"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <FontAwesome name="user" size={20} color={theme.color6.val} />
                </View>
              </UserAvatar>
            </DebouncedLink>
          ))}
        </XStack>
        <Text color="$mauve12">
          <DebouncedLink
            asChild
            href={{
              pathname: `/users/[fid]`,
              params: { fid: notification.users[0].fid },
            }}
          >
            <Text fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </Text>
          </DebouncedLink>
          {notification.users.length > 1 && (
            <>
              <Text color="$mauve12"> and </Text>
              <DebouncedLink
                asChild
                href={{
                  pathname: `/users/[fid]/followers`,
                  params: { fid: session?.fid },
                }}
              >
                <Text fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? 's' : ''}`}</Text>
              </DebouncedLink>
            </>
          )}
          <Text color="$mauve12"> followed you</Text>
        </Text>
      </YStack>
    </Notification>
  )
}

const Notification = ({
  icon,
  children,
  iconBackgroundColor,
  href,
}: {
  icon?: JSX.Element
  children: JSX.Element
  iconBackgroundColor?: string
  href: Href
}) => {
  return (
    <XStack borderBottomWidth="$0.25" borderBottomColor="$color4">
      {icon && (
        <DebouncedLink href={href} asChild>
          <View paddingLeft="$5" paddingRight="$3" paddingTop="$3" paddingBottom="$3">
            <View
              marginTop="$1"
              width="$2"
              height="$2"
              borderRadius="$10"
              justifyContent="center"
              alignItems="center"
              backgroundColor={iconBackgroundColor}
            >
              {icon}
            </View>
          </View>
        </DebouncedLink>
      )}
      <View
        paddingRight="$3"
        paddingTop="$3"
        flex={1}
        paddingBottom="$3"
        paddingLeft={!icon ? '$3' : '$0'}
      >
        {children}
      </View>
    </XStack>
  )
}
