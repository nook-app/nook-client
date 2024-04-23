import { fetchChannel } from "@nook/app/api/farcaster";
import { ChannelTabs } from "@nook/app/features/farcaster/channel-profile/channel-tabs";

export default async function Channel({
  params,
}: { params: { channelId: string } }) {
  const channel = await fetchChannel(params.channelId);
  return <ChannelTabs channel={channel} activeTab="media" />;
}
