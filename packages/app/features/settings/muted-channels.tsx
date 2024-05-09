"use client";

import {
  NookText,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { Channel, User } from "@nook/common/types";
import { useChannels } from "../../api/farcaster";
import { Link } from "solito/link";
import { VolumeX } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { FarcasterChannelDisplay } from "../../components/farcaster/channels/channel-display";
import { useMuteChannel } from "../../hooks/useMuteChannel";

export const MutedChannels = ({ settings }: { settings: User }) => {
  const { data, isLoading } = useChannels(settings.mutedChannels);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (data) {
      setChannels(data.data);
    }
  }, [data]);

  return (
    <YStack>
      <View padding="$4" gap="$4">
        <NookText muted>
          Posts from muted channels won't show up across the app unless viewing
          the channel page. You can mute channels directly from the page or
          posts.
        </NookText>
      </View>
      <Separator borderColor="$borderColorBg" />
      {isLoading && (
        <View padding="$4" gap="$4">
          <Spinner />
        </View>
      )}
      {channels.map((channel) => (
        <MutedChannel key={channel.channelId} channel={channel} />
      ))}
    </YStack>
  );
};

const MutedChannel = ({ channel }: { channel: Channel }) => {
  const { unmuteChannel } = useMuteChannel(channel);
  return (
    <Link href={`/channels/${channel.channelId}`}>
      <XStack
        alignItems="center"
        padding="$4"
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
