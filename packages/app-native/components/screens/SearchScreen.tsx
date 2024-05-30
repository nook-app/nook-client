import { ScrollView, View, XStack, YStack } from "@nook/app-ui";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { BackButton, IconButton } from "../IconButton";
import { SearchBar } from "../SearchBar";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlidersHorizontal } from "@tamagui/lucide-icons";
import { FarcasterUserBadge } from "@nook/app/components/farcaster/users/user-display";
import { FarcasterChannelBadge } from "@nook/app/components/farcaster/channels/channel-display";
import { SearchResults } from "@nook/app/features/search/search-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRecommendedChannels } from "@nook/app/hooks/api/channels";
import { Channel } from "@nook/common/types";
import { FarcasterChannelFeedItem } from "@nook/app/features/farcaster/channel-feed/channel-feed-item";

export default function SearchScreen({ isExplore }: { isExplore?: boolean }) {
  const paddingBottom = useBottomTabBarHeight();
  const [drawer, tabs, tab] = useSegments();
  const { q, user, channel } = useLocalSearchParams() as {
    q?: string;
    user?: string;
    channel?: string;
  };
  const [query, setQuery] = useState(q || "");
  const insets = useSafeAreaInsets();

  const prefix = user ? (
    <FarcasterUserBadge user={JSON.parse(user)} />
  ) : channel ? (
    <FarcasterChannelBadge channel={JSON.parse(channel)} />
  ) : undefined;

  return (
    <View flex={1} backgroundColor="$color1">
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        gap="$2"
        paddingTop={insets.top}
        alignItems="center"
      >
        {!isExplore && <BackButton />}
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSubmitEditing={() => {
            router.push({
              pathname: `/${drawer}/${tabs}/${tab}/search`,
              params: { q: query, user, channel },
            });
          }}
          prefix={prefix}
          autoFocus={!isExplore && !q}
          right={
            q ? (
              <View paddingLeft="$2">
                <IconButton icon={SlidersHorizontal} />
              </View>
            ) : undefined
          }
        />
      </XStack>
      <ScrollView
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom }}
        keyboardShouldPersistTaps="handled"
      >
        {query ? (
          <SearchResults
            value={query}
            user={user ? JSON.parse(user) : undefined}
            channel={channel ? JSON.parse(channel) : undefined}
          />
        ) : (
          <RecommendedChannels />
        )}
      </ScrollView>
    </View>
  );
}

const RecommendedChannels = () => {
  const { data } = useRecommendedChannels();

  return (
    <YStack>
      {data?.data.map((channel: Channel) => (
        <FarcasterChannelFeedItem
          key={channel.channelId}
          channel={channel}
          withBio
        />
      ))}
    </YStack>
  );
};
