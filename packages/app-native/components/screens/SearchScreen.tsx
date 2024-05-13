import { ScrollView, View, XStack } from "@nook/app-ui";
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

export default function SearchScreen() {
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
        <BackButton />
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
          autoFocus={!q}
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
      >
        <SearchResults
          value={query}
          user={user ? JSON.parse(user) : undefined}
          channel={channel ? JSON.parse(channel) : undefined}
        />
      </ScrollView>
    </View>
  );
}
