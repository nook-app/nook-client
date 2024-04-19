import { DebouncedLink } from '@/components/DebouncedLink'
import { Label } from '@/components/Label'
import { UserAvatar } from '@/components/UserAvatar'
import { FarcasterChannelPanel } from '@/components/farcaster/FarcasterChannelPanel'
import { useChannel } from '@/hooks/useChannel'
import { useUser } from '@/hooks/useUser'
import { Channel, FarcasterUser } from '@/types'
import { formatNumber } from '@/utils'
import { makeRequestJson } from '@/utils/api'
import { searchChannels } from '@/utils/api/channel'
import { ArrowLeft, Search, XCircle } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useDebounceValue } from 'tamagui'
import { Input, View, XStack, YStack } from 'tamagui'

export default function SearchScreen() {
  const {
    query: initialQuery,
    fid: initialFid,
    channelId: initialChannelId,
    parentUrl: initialParentUrl,
  } = useLocalSearchParams() as {
    query: string
    fid?: string
    channelId?: string
    parentUrl?: string
  }

  const [query, setQuery] = useState(initialQuery === '[query]' ? '' : initialQuery)
  const [fid, setFid] = useState<string | undefined>(initialFid)
  const [channelId, setChannelId] = useState<string | undefined>(initialChannelId)
  const [parentUrl, setParentUrl] = useState<string | undefined>(initialParentUrl)
  const insets = useSafeAreaInsets()

  const debouncedQuery = useDebounceValue(query, 500)

  return (
    <YStack flex={1} backgroundColor="$color1">
      <XStack
        flexDirection="row"
        justifyContent="space-between"
        backgroundColor="$color1"
        height="$9"
        paddingHorizontal="$2.5"
        alignItems="center"
        style={{
          paddingTop: insets.top,
        }}
        gap="$2"
      >
        <TouchableOpacity
          onPress={() => {
            router.back()
          }}
        >
          <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={24} color="$mauve12" />
          </View>
        </TouchableOpacity>
        <XStack
          alignItems="center"
          backgroundColor="$color3"
          borderRadius="$10"
          flexGrow={1}
          height="$3"
          paddingLeft="$3"
        >
          <Search size={16} color="$color11" strokeWidth={3} />
          {fid && <SearchUserPill fid={fid} />}
          {channelId && <SearchChannelPill channelId={channelId} />}
          <Input
            placeholder={fid || channelId ? 'Search casts...' : 'Search'}
            returnKeyType="search"
            value={query}
            onChangeText={setQuery}
            enablesReturnKeyAutomatically
            borderWidth="$0"
            backgroundColor="$color3"
            placeholderTextColor="$color11"
            borderRadius="$10"
            paddingHorizontal="$2"
            height="$3"
            onSubmitEditing={(e) =>
              router.replace({
                pathname: `/search/[query]/results`,
                params: { query: e.nativeEvent.text, fid, channelId, parentUrl },
              })
            }
            flex={1}
            autoFocus
          />
          <View
            padding="$2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              setQuery('')
              setFid(undefined)
              setChannelId(undefined)
              setParentUrl(undefined)
            }}
          >
            <XCircle size={16} color="$color12" />
          </View>
        </XStack>
      </XStack>
      {!fid && !channelId && <SearchPreview query={debouncedQuery} />}
    </YStack>
  )
}

const SearchPreview = ({ query }: { query: string }) => {
  if (query === '') {
    return (
      <View minHeight={2} flex={1} paddingHorizontal="$2.5">
        <FarcasterChannelPanel
          keys={['searchChannels', '']}
          fetch={({ pageParam }) => searchChannels('', pageParam)}
        />
      </View>
    )
  }

  return <SearchPreviewInput query={query} />
}

const SearchPreviewInput = ({ query }: { query: string }) => {
  const { data } = useQuery<{ users: FarcasterUser[]; channels: Channel[] }>({
    queryKey: ['searchPreview', query],
    queryFn: () => makeRequestJson(`/search/preview?query=${query}`),
  })

  return (
    <YStack gap="$4" paddingHorizontal="$3" paddingVertical="$2">
      {data?.users && data.users.length > 0 && (
        <YStack gap="$2">
          <Label>Users</Label>
          <YStack gap="$3">
            {data.users.slice(0, 3).map((user) => (
              <DebouncedLink
                key={user.fid}
                href={{
                  pathname: '/users/[fid]',
                  params: { fid: user.fid },
                }}
              >
                <XStack gap="$2" alignItems="center">
                  <UserAvatar pfp={user.pfp} size="$3" />
                  <YStack gap="$1">
                    <Text fontWeight="600" fontSize="$4" color="$mauve12">
                      {user.displayName || user.username || `!${user.fid}`}
                    </Text>
                    <XStack gap="$1.5">
                      <Text color="$mauve11">
                        {user.username ? `@${user.username}` : `!${user.fid}`}
                      </Text>
                      <Text color="$mauve11">
                        {formatNumber(user.engagement.followers || 0)} followers
                      </Text>
                    </XStack>
                  </YStack>
                </XStack>
              </DebouncedLink>
            ))}
          </YStack>
        </YStack>
      )}
      {data?.channels && data.channels.length > 0 && (
        <YStack gap="$2">
          <Label>Channels</Label>
          <YStack gap="$3">
            {data.channels.slice(0, 3).map((channel) => (
              <DebouncedLink
                key={channel.channelId}
                href={{
                  pathname: '/channels/[channelId]',
                  params: { channelId: channel.channelId },
                }}
              >
                <XStack gap="$2" alignItems="center">
                  <UserAvatar pfp={channel.imageUrl} size="$3" useCdn={false} />
                  <YStack gap="$1">
                    <Text fontWeight="600" fontSize="$4" color="$mauve12">
                      {channel.name || channel.channelId}
                    </Text>
                    <XStack gap="$1.5">
                      <Text color="$mauve11">{`/${channel.channelId}`}</Text>
                      <Text color="$mauve11">
                        {formatNumber(channel.followerCount || 0)} followers
                      </Text>
                    </XStack>
                  </YStack>
                </XStack>
              </DebouncedLink>
            ))}
          </YStack>
        </YStack>
      )}
      <DebouncedLink
        href={{
          pathname: '/search/[query]/results',
          params: { query },
        }}
      >
        <Text fontWeight="600" fontSize="$5" color="$color11">
          {`Search for "${query}"`}
        </Text>
      </DebouncedLink>
    </YStack>
  )
}

export const SearchUserPill = ({ fid }: { fid: string }) => {
  const { user } = useUser(fid)

  if (!user) return null

  return (
    <XStack
      gap="$1.5"
      alignItems="center"
      paddingVertical="$1"
      marginLeft="$2"
      backgroundColor="$color7"
      borderRadius="$6"
      paddingHorizontal="$2"
    >
      <View borderRadius="$10" overflow="hidden">
        <UserAvatar pfp={user.pfp} size="$1" />
      </View>
      <View flexShrink={1}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="600"
          fontSize="$3"
          color="$mauve12"
        >
          {user.username || `!${user.fid}`}
        </Text>
      </View>
    </XStack>
  )
}

export const SearchChannelPill = ({ channelId }: { channelId: string }) => {
  const { channel } = useChannel(channelId)

  if (!channel) return null

  return (
    <XStack
      gap="$1.5"
      alignItems="center"
      paddingVertical="$1"
      marginLeft="$2"
      backgroundColor="$color7"
      borderRadius="$6"
      paddingHorizontal="$2"
    >
      <View borderRadius="$10" overflow="hidden">
        <UserAvatar pfp={channel.imageUrl} size="$1" useCdn={false} />
      </View>
      <View flexShrink={1}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="600"
          fontSize="$3"
          color="$mauve12"
        >
          {channel.channelId}
        </Text>
      </View>
    </XStack>
  )
}
