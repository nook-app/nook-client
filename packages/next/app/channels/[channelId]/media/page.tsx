import { ChannelTabs } from "@nook/app/features/farcaster/channel-profile/channel-tabs";

export default async function Channel({
  params,
}: { params: { channelId: string } }) {
  return <ChannelTabs channelId={params.channelId} activeIndex={3} />;
}
