import { fetchChannel } from "@nook/app/api/farcaster";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { ChannelFilterType, UserFilterType } from "@nook/app/types";

export default async function Channel({
  params,
}: { params: { channelId: string } }) {
  const channel = await fetchChannel(params.channelId);
  return (
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
    />
  );
}
