import { DebouncedLink } from '@/components/DebouncedLink'
import { FarcasterChannelPanel } from '@/components/farcaster/FarcasterChannelPanel'
import { searchChannels } from '@/utils/api/channel'
import { Search } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from 'tamagui'
import { View, XStack, YStack } from 'tamagui'

export default function SearchScreen() {
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$color1" paddingHorizontal="$2.5">
      <XStack
        flexDirection="row"
        justifyContent="space-between"
        backgroundColor="$color1"
        height="$9"
        alignItems="center"
        gap="$2"
        style={{
          paddingTop: insets.top,
        }}
      >
        <DebouncedLink
          href={{
            pathname: `/search/[query]`,
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
              <Text color="$color11">Search</Text>
            </View>
          </XStack>
        </DebouncedLink>
      </XStack>
      <FarcasterChannelPanel
        keys={['searchChannels', '']}
        fetch={({ pageParam }) => searchChannels('', pageParam)}
      />
    </YStack>
  )
}
