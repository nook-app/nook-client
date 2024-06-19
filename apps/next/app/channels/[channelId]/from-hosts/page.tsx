import { fetchChannel } from "@nook/app/api/farcaster";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { ChannelFilterType, UserFilterType } from "@nook/common/types";

export default async function Channel({
  params,
}: { params: { channelId: string } }) {
  const channel = await fetchChannel(params.channelId);
  return (
    <FarcasterFilteredFeedServer
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
    />
  );
}
