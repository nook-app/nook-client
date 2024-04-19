import { FarcasterFeedPanel } from '@/components/farcaster/FarcasterFeedPanel'
import { FarcasterUserPanel } from '@/components/farcaster/FarcasterUserPanel'
import { Panels } from '@/components/panels/Panels'
import { fetchCastLikes, fetchCastQuotes, fetchCastRecasts } from '@/utils/api'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

export default function UserScreen() {
  const { hash } = useLocalSearchParams()
  const height = useBottomTabBarHeight()

  return (
    <View flex={1} backgroundColor="$color1" paddingBottom={height}>
      <Panels
        panels={[
          {
            name: 'Likes',
            panel: (
              <FarcasterUserPanel
                keys={['castLikes', hash as string]}
                fetch={({ pageParam }) => fetchCastLikes(hash as string, pageParam)}
                asTabs
              />
            ),
          },
          {
            name: 'Recasts',
            panel: (
              <FarcasterUserPanel
                keys={['castRecasts', hash as string]}
                fetch={({ pageParam }) => fetchCastRecasts(hash as string, pageParam)}
                asTabs
              />
            ),
          },
          {
            name: 'Quotes',
            panel: (
              <FarcasterFeedPanel
                keys={['castQuotes', hash as string]}
                fetch={({ pageParam }) => fetchCastQuotes(hash as string, pageParam)}
                asTabs
              />
            ),
          },
        ]}
        defaultIndex={2}
      />
    </View>
  )
}
