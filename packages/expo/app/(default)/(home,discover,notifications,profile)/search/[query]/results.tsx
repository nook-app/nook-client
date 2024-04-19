import { FarcasterChannelPanel } from '@/components/farcaster/FarcasterChannelPanel'
import { FarcasterFeedPanel } from '@/components/farcaster/FarcasterFeedPanel'
import { FarcasterUserPanel } from '@/components/farcaster/FarcasterUserPanel'
import { Panels } from '@/components/panels/Panels'
import { searchUsers } from '@/utils/api'
import { searchChannels } from '@/utils/api/channel'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack } from 'tamagui'
import { ArrowLeft, Search } from '@tamagui/lucide-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ChannelFilterType, UserFilterType } from '@/types'
import { SearchChannelPill, SearchUserPill } from '.'
import { useCastFeed } from '@/hooks/useCastFeed'
import { DebouncedLink } from '@/components/DebouncedLink'

export default function SearchQueryScreen() {
  const { query, fid, channelId, parentUrl } = useLocalSearchParams() as {
    query: string
    fid?: string
    channelId?: string
    parentUrl?: string
  }
  const { fetchPage } = useCastFeed({
    text: [query.trim()],
    ...(fid && {
      users: {
        type: UserFilterType.FIDS,
        data: {
          fids: [fid],
        },
      },
    }),
    ...(parentUrl && {
      channels: {
        type: ChannelFilterType.CHANNEL_URLS,
        data: {
          urls: [parentUrl],
        },
      },
    }),
  })

  const insets = useSafeAreaInsets()

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
        <DebouncedLink
          href={{
            pathname: `/search/[query]`,
            params: { query: query, fid },
          }}
          asChild
        >
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
            <View
              justifyContent="center"
              borderWidth="$0"
              backgroundColor="$color3"
              borderRadius="$10"
              paddingHorizontal="$2"
              height="$3"
              flex={1}
              disabled
            >
              <Text>{query}</Text>
            </View>
          </XStack>
        </DebouncedLink>
      </XStack>
      <Panels
        panels={[
          {
            name: 'Casts',
            panel: (
              <FarcasterFeedPanel
                keys={['searchCasts', query]}
                fetch={fetchPage}
                asTabs
                keyboardShouldPersistTaps="never"
              />
            ),
          },
          ...(fid || channelId
            ? []
            : [
                {
                  name: 'Users',
                  panel: (
                    <FarcasterUserPanel
                      keys={['searchUsers', query]}
                      fetch={({ pageParam }) => searchUsers(query, pageParam)}
                      asTabs
                      keyboardShouldPersistTaps="never"
                    />
                  ),
                },
              ]),
          ...(fid || channelId
            ? []
            : [
                {
                  name: 'Channels',
                  panel: (
                    <FarcasterChannelPanel
                      keys={['searchChannels', query]}
                      fetch={({ pageParam }) => searchChannels(query, pageParam)}
                      asTabs
                      keyboardShouldPersistTaps="never"
                    />
                  ),
                },
              ]),
        ]}
      />
    </YStack>
  )
}
