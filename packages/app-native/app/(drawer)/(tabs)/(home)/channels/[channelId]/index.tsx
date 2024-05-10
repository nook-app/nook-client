import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { ChannelFilterType, UserFilterType } from "@nook/common/types";
import { CollapsibleLayout } from "../../../../../../components/CollapsibleLayout";
import { NookText, XStack } from "@nook/app-ui";
import { useImageColors } from "../../../../../../hooks/useImageColors";
import { formatToCDN } from "@nook/app/utils";
import { useChannel } from "@nook/app/hooks/useChannel";

export default function ChannelScreen() {
  const { channelId } = useLocalSearchParams();
  const { channel } = useChannel(channelId as string);

  const colors = useImageColors(
    channel.imageUrl
      ? formatToCDN(channel.imageUrl, { width: 168 })
      : undefined,
  );

  if (!channel) return null;

  return (
    <CollapsibleLayout
      title={
        <XStack alignItems="center" gap="$2">
          <NookText fontSize="$5" fontWeight="700">
            {channel.name}
          </NookText>
        </XStack>
      }
      colors={colors}
      header={<ChannelHeader channel={channel} />}
      pages={[
        {
          name: "Relevant",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.POWER_BADGE,
                  data: {
                    badge: true,
                  },
                },
                channels: {
                  type: ChannelFilterType.CHANNEL_URLS,
                  data: {
                    urls: [channel.url],
                  },
                },
              }}
              asTabs
            />
          ),
        },
        {
          name: "Hosts",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: channel.hostFids || [],
                  },
                },
                channels: {
                  type: ChannelFilterType.CHANNEL_URLS,
                  data: {
                    urls: [channel.url],
                  },
                },
              }}
              asTabs
            />
          ),
        },
        {
          name: "Media",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.POWER_BADGE,
                  data: {
                    badge: true,
                  },
                },
                channels: {
                  type: ChannelFilterType.CHANNEL_URLS,
                  data: {
                    urls: [channel.url],
                  },
                },
                contentTypes: ["image", "application/x-mpegURL"],
              }}
              asTabs
            />
          ),
        },
        {
          name: "All",
          component: (
            <FarcasterFilteredFeed
              filter={{
                channels: {
                  type: ChannelFilterType.CHANNEL_URLS,
                  data: {
                    urls: [channel.url],
                  },
                },
              }}
              asTabs
            />
          ),
        },
      ]}
    />
  );
}
