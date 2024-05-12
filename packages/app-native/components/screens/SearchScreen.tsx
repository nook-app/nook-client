import { View, XStack } from "@nook/app-ui";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { BackButton, IconButton } from "../IconButton";
import { SearchBar } from "../SearchBar";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlidersHorizontal } from "@tamagui/lucide-icons";
import { PagerLayout } from "../PagerLayout";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { HEADER_HEIGHT } from "../DisappearingLayout";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { UserSearchFeed } from "@nook/app/features/farcaster/user-feed/user-search-feed";
import { ChannelSearchFeed } from "@nook/app/features/farcaster/channel-feed/channel-search-feed";
import { FarcasterUserBadge } from "@nook/app/components/farcaster/users/user-display";
import { FarcasterChannelBadge } from "@nook/app/components/farcaster/channels/channel-display";
import { ChannelFilterType, UserFilterType } from "@nook/common/types";

export default function SearchScreen() {
  const [drawer, tabs, tab] = useSegments();
  const { q, user, channel } = useLocalSearchParams() as {
    q?: string;
    user?: string;
    channel?: string;
  };
  const [query, setQuery] = useState(q || "");
  const insets = useSafeAreaInsets();
  const paddingBottom = useBottomTabBarHeight();

  const prefix = user ? (
    <FarcasterUserBadge user={JSON.parse(user)} />
  ) : channel ? (
    <FarcasterChannelBadge channel={JSON.parse(channel)} />
  ) : undefined;

  return (
    <PagerLayout
      title={
        <XStack
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
      }
      pages={
        q
          ? [
              {
                name: "Casts",
                component: (
                  <FarcasterFilteredFeed
                    filter={{
                      text: [q],
                      ...(user && {
                        users: {
                          type: UserFilterType.FIDS,
                          data: { fids: [JSON.parse(user).fid] },
                        },
                      }),
                      ...(channel && {
                        channels: {
                          type: ChannelFilterType.CHANNEL_URLS,
                          data: { urls: [JSON.parse(channel).url] },
                        },
                      }),
                    }}
                    paddingTop={HEADER_HEIGHT}
                    paddingBottom={paddingBottom}
                  />
                ),
              },
              {
                name: "Users",
                component: (
                  <UserSearchFeed
                    q={q}
                    paddingTop={HEADER_HEIGHT}
                    paddingBottom={paddingBottom}
                  />
                ),
              },
              {
                name: "Channels",
                component: (
                  <ChannelSearchFeed
                    q={q}
                    paddingTop={HEADER_HEIGHT}
                    paddingBottom={paddingBottom}
                  />
                ),
              },
            ]
          : []
      }
    />
  );
}
