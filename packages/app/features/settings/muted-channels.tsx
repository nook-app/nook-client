"use client";

import { NookText, Spinner, View, XStack, YStack } from "@nook/app-ui";
import { Channel, User } from "@nook/common/types";
import { VolumeX } from "@tamagui/lucide-icons";
import { FarcasterChannelDisplay } from "../../components/farcaster/channels/channel-display";
import { useMuteChannel } from "../../hooks/useMuteChannel";
import { Link } from "../../components/link";
import { useMuteStore } from "../../store/useMuteStore";
import { useChannelUrls } from "../../api/farcaster";

export const MutedChannels = ({ settings }: { settings: User }) => {
  const channels = useMuteStore((state) => state.channels);
  const { data, isLoading } = useChannelUrls(
    Object.entries(channels)
      .filter(([_, muted]) => muted)
      .map(([url]) => url),
  );

  return (
    <YStack>
      <View padding="$2.5" gap="$4">
        <NookText muted>
          Posts from muted channels won't show up across the app unless viewing
          the channel page. You can mute channels directly from the page or
          posts.
        </NookText>
      </View>
      {isLoading && (
        <View padding="$2.5" gap="$4">
          <Spinner />
        </View>
      )}
      {data?.data.map((channel) => (
        <MutedChannel key={channel.channelId} channel={channel} />
      ))}
    </YStack>
  );
};

const MutedChannel = ({ channel }: { channel: Channel }) => {
  const { unmuteChannel } = useMuteChannel(channel);

  const isMuted = useMuteStore((state) => state.channels[channel.url]);

  if (!isMuted) {
    return null;
  }

  return (
    <Link href={`/channels/${channel.channelId}`}>
      <XStack
        alignItems="center"
        padding="$2.5"
        hoverStyle={{
          backgroundColor: "$color2",
          transform: "all 0.2s ease-in-out",
        }}
      >
        <FarcasterChannelDisplay channel={channel} withBio />
        <View
          cursor="pointer"
          width="$2.5"
          height="$2.5"
          justifyContent="center"
          alignItems="center"
          borderRadius="$10"
          group
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$red3",
          }}
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
            unmuteChannel();
          }}
        >
          <VolumeX
            size={20}
            $group-hover={{
              color: "$red9",
              opacity: 1,
            }}
            color="$red9"
          />
        </View>
      </XStack>
    </Link>
  );
};
