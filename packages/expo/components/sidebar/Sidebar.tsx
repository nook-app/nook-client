import { View, XStack } from 'tamagui'
import { memo, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth'
import { Channel, Nook, User } from '@/types'
import { YStack } from 'tamagui'
import { Text } from 'tamagui'
import { UserAvatar } from '../UserAvatar'
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Settings,
} from '@tamagui/lucide-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDrawer } from '@/context/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from '@tamagui/linear-gradient'
import { CONFIG } from '@/constants'
import * as Updates from 'expo-updates'
import { useUser } from '@/hooks/useUser'
import { SheetType, useSheets } from '@/context/sheet'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { DebouncedLink } from '../DebouncedLink'
import { IconButton } from '../IconButton'
import { SvgUri } from 'react-native-svg'
import { stringToColor } from '@/utils'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { updateOrder } from '@/utils/api'
import { haptics } from '@/utils/haptics'

export const Sidebar = memo(() => {
  const insets = useSafeAreaInsets()
  return (
    <LinearGradient
      flex={1}
      colors={['$color2', '$color2', '$color1']}
      start={[0, 0]}
      end={[1, 1]}
    >
      <NestableScrollContainer>
        <YStack style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <Profile />
          <Nooks />
          <Feeds />
          <FollowedChannels />
        </YStack>
      </NestableScrollContainer>
    </LinearGradient>
  )
})

const Profile = () => {
  const { session } = useAuth()
  const { user } = useUser(session?.fid || '')
  const { onClose } = useDrawer()
  const { openSheet } = useSheets()

  return (
    <YStack borderBottomColor="$color4" borderBottomWidth="$0.25" padding="$3" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <DebouncedLink
          href={{
            pathname: `/users/[fid]`,
            params: { fid: session?.fid },
          }}
          onPress={onClose}
          asChild
        >
          <TouchableOpacity>
            <XStack alignItems="center" justifyContent="space-between">
              <XStack gap="$2.5" alignItems="center">
                <UserAvatar pfp={user?.pfp} size="$3" />
                <YStack>
                  <Text color="$mauve12" fontWeight="600">
                    {user?.displayName || user?.username || `!${session?.fid}`}
                  </Text>
                  <Text color="$mauve11" fontWeight="400">
                    {user?.username ? `@${user?.username}` : `!${session?.fid}`}
                  </Text>
                </YStack>
              </XStack>
            </XStack>
          </TouchableOpacity>
        </DebouncedLink>
        <XStack alignItems="center" gap="$2">
          <IconButton href={{ pathname: '/settings' }} onPress={onClose}>
            <Settings size={16} color="white" />
          </IconButton>
          <IconButton onPress={() => openSheet(SheetType.SwitchAccount)}>
            <MaterialCommunityIcons name="account-convert" size={16} color="white" />
          </IconButton>
        </XStack>
      </XStack>
      <UpdateAppButton />
    </YStack>
  )
}

const Nooks = () => {
  const [open, setOpen] = useState(true)
  const { nooks } = useAuth()
  const { onClose } = useDrawer()
  const [orderedNooks, setOrderedNooks] = useState<Nook[]>()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const { openSheet } = useSheets()

  const { mutate } = useMutation({
    mutationFn: async (newNooks: Nook[]) => {
      const order = newNooks.map(
        (nook) => [nook.id, nook.panels.map((panel) => panel.id)] as [string, string[]]
      )
      await updateOrder(order)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            order,
          },
        }
      })
    },
  })

  useEffect(() => {
    if (nooks && nooks.length > 0) {
      setOrderedNooks(nooks)
    }
  }, [nooks])

  return (
    <YStack borderBottomColor="$color4" borderBottomWidth="$0.25">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        onPress={() => setOpen(!open)}
        paddingVertical="$3"
      >
        <Text color="$mauve12" fontWeight="600" fontSize="$4">
          Nooks
        </Text>
        {open ? (
          <ChevronDown size={20} color="$mauve12" />
        ) : (
          <ChevronRight size={20} color="$mauve12" />
        )}
      </XStack>
      {open && (
        <YStack paddingBottom="$3">
          <NestableDraggableFlatList
            data={orderedNooks || []}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              setOrderedNooks(data)
              mutate(data)
            }}
            onPlaceholderIndexChange={haptics.selection}
            renderItem={({ item, drag }) => (
              <ScaleDecorator>
                <DebouncedLink
                  href={{
                    pathname: `/nooks/[nookId]`,
                    params: { nookId: item.id },
                  }}
                  replace
                  onPress={onClose}
                  onLongPress={drag}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    paddingVertical="$2"
                    paddingHorizontal="$4"
                  >
                    <XStack gap="$2.5" alignItems="center">
                      {item.icon && (
                        <View
                          borderRadius="$10"
                          width="$2"
                          height="$2"
                          backgroundColor="$color8"
                          overflow="hidden"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <SvgUri
                            uri={`https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${item.icon}.svg`}
                            width={16}
                            height={16}
                            color="white"
                          />
                        </View>
                      )}
                      {!item.icon && (
                        <View
                          borderRadius="$10"
                          width="$2"
                          height="$2"
                          backgroundColor={stringToColor(item.name)}
                          overflow="hidden"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="white" fontWeight="600" textTransform="uppercase">
                            {item.name.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <Text color="$mauve12" fontWeight="500">
                        {item.name}
                      </Text>
                    </XStack>
                    <TouchableOpacity
                      onPress={() =>
                        openSheet(SheetType.NookAction, {
                          nookId: item.id,
                        })
                      }
                      hitSlop={{
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10,
                      }}
                    >
                      <MoreHorizontal size={16} color="$mauve12" opacity={0.75} />
                    </TouchableOpacity>
                  </XStack>
                </DebouncedLink>
              </ScaleDecorator>
            )}
          />
          <DebouncedLink href={{ pathname: '/create-nook' }} absolute>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingVertical="$2"
              paddingHorizontal="$4"
            >
              <XStack gap="$2.5" alignItems="center">
                <View backgroundColor="rgba(0,0,0,0.25)" padding="$2" borderRadius="$10">
                  <Plus size={16} color="white" />
                </View>
                <Text color="$mauve12" fontWeight="500">
                  Create a nook
                </Text>
              </XStack>
            </XStack>
          </DebouncedLink>
        </YStack>
      )}
    </YStack>
  )
}

const FollowedChannels = () => {
  const [open, setOpen] = useState(true)
  const { session } = useAuth()
  const { onClose } = useDrawer()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['followedChannels', session?.fid],
    queryFn: async () => {
      let cursor: string | undefined = undefined
      const followedChannels: Channel[] = []
      do {
        const response: Response = await fetch(
          `https://api.warpcast.com/v1/user-following-channels?fid=${session?.fid}${
            cursor ? `&cursor=${cursor}` : ''
          }`
        )
        const data = await response.json()
        followedChannels.push(
          ...data.result.channels.map((d: any) => ({
            ...d,
            creatorId: d.leadFid,
            channelId: d.id,
          }))
        )
        cursor = data.next?.cursor
      } while (cursor)

      for (const channel of followedChannels) {
        queryClient.setQueryData(['channel', channel.channelId], channel)
      }

      return followedChannels.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    },
  })

  return (
    <YStack borderBottomColor="$color4" borderBottomWidth="$0.25">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        onPress={() => setOpen(!open)}
        paddingVertical="$3"
      >
        <Text color="$mauve12" fontWeight="600" fontSize="$4">
          Followed Channels
        </Text>
        {open ? (
          <ChevronDown size={20} color="$mauve12" />
        ) : (
          <ChevronRight size={20} color="$mauve12" />
        )}
      </XStack>
      {open && (
        <YStack paddingBottom="$3">
          {data?.map((item) => (
            <DebouncedLink
              key={item.channelId}
              href={{
                pathname: '/channels/[channelId]',
                params: { channelId: item.channelId },
              }}
              onPress={onClose}
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$2"
                paddingHorizontal="$4"
              >
                <XStack gap="$2.5" alignItems="center">
                  <UserAvatar pfp={item.imageUrl} size="$2" />
                  <Text color="$mauve12" fontWeight="500">
                    {item.channelId}
                  </Text>
                </XStack>
              </XStack>
            </DebouncedLink>
          ))}
        </YStack>
      )}
    </YStack>
  )
}

const Feeds = () => {
  const [open, setOpen] = useState(true)
  const { feeds } = useAuth()
  const { onClose } = useDrawer()
  const { openSheet } = useSheets()

  return (
    <YStack borderBottomColor="$color4" borderBottomWidth="$0.25">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        onPress={() => setOpen(!open)}
        paddingVertical="$3"
      >
        <Text color="$mauve12" fontWeight="600" fontSize="$4">
          Feeds
        </Text>
        {open ? (
          <ChevronDown size={20} color="$mauve12" />
        ) : (
          <ChevronRight size={20} color="$mauve12" />
        )}
      </XStack>
      {open && (
        <YStack paddingBottom="$3">
          {feeds.map((feed) => (
            <DebouncedLink
              key={feed.id}
              href={{
                pathname: `/feeds/[feedId]`,
                params: { feedId: feed.id },
              }}
              replace
              onPress={onClose}
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$2"
                paddingHorizontal="$4"
              >
                <XStack gap="$2.5" alignItems="center" flex={1}>
                  <View
                    borderRadius="$10"
                    width="$2"
                    height="$2"
                    backgroundColor={stringToColor(feed.name)}
                    overflow="hidden"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="600" textTransform="uppercase">
                      {feed.name.charAt(0)}
                    </Text>
                  </View>
                  <Text
                    color="$mauve12"
                    fontWeight="500"
                    numberOfLines={1}
                    flexShrink={1}
                  >
                    {feed.name}
                  </Text>
                </XStack>
                <TouchableOpacity
                  onPress={() =>
                    openSheet(SheetType.FeedAction, {
                      feedId: feed.id,
                    })
                  }
                  hitSlop={{
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10,
                  }}
                >
                  <MoreHorizontal size={16} color="$mauve12" opacity={0.75} />
                </TouchableOpacity>
              </XStack>
            </DebouncedLink>
          ))}
          <DebouncedLink href={{ pathname: '/create-feed' }} absolute>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingVertical="$2"
              paddingHorizontal="$4"
            >
              <XStack gap="$2.5" alignItems="center">
                <View backgroundColor="rgba(0,0,0,0.25)" padding="$2" borderRadius="$10">
                  <Plus size={16} color="white" />
                </View>
                <Text color="$mauve12" fontWeight="500">
                  Create a feed
                </Text>
              </XStack>
            </XStack>
          </DebouncedLink>
        </YStack>
      )}
    </YStack>
  )
}

const UpdateAppButton = memo(() => {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (CONFIG.dev) return

    async function checkForUpdate() {
      const update = await Updates.checkForUpdateAsync()
      setUpdateAvailable(update.isAvailable)
    }

    checkForUpdate()
    const interval = setInterval(checkForUpdate, 300000)

    return () => clearInterval(interval)
  }, [])

  if (!updateAvailable) return null

  const handleUpdate = async () => {
    await Updates.fetchUpdateAsync()
    await Updates.reloadAsync()
  }

  return (
    <TouchableOpacity onPress={handleUpdate}>
      <XStack
        borderRadius="$4"
        backgroundColor="$shadowColor"
        alignItems="center"
        justifyContent="center"
        paddingVertical="$3"
        gap="$2"
      >
        <ArrowUp size={24} color="$mauve12" />
        <Text>Update available. Restart app.</Text>
      </XStack>
    </TouchableOpacity>
  )
})
