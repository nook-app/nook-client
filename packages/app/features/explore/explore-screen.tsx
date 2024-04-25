// TODO: Use our own backend for explore / trending

"use client";

import { NookButton, NookText, View, XStack } from "@nook/ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "solito/navigation";
import { SearchBar } from "../search/search-bar";
import { Channel } from "../../types";
import { FarcasterChannelFeedItem } from "../farcaster/channel-feed/channel-feed-item";

export const ExploreScreen = ({ channels }: { channels: Channel[] }) => {
  const router = useRouter();
  return (
    <View>
      <XStack height="$5" paddingHorizontal="$3" alignItems="center">
        <NookButton
          icon={<ArrowLeft />}
          circular
          size="$3"
          scaleIcon={1.5}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
          onPress={router.back}
        />
        <View flexGrow={1}>
          <SearchBar />
        </View>
      </XStack>
      <View padding="$3">
        <NookText variant="label">Trending Channels</NookText>
      </View>
      {channels.map((channel: Channel) => (
        <FarcasterChannelFeedItem key={channel.channelId} channel={channel} />
      ))}
    </View>
  );
};
