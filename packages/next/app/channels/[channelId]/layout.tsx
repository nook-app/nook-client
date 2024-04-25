import { fetchChannel } from "@nook/app/api/farcaster";
import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { ChannelSidebar } from "@nook/app/features/farcaster/channel-profile/channel-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";

export default async function Channel({
  children,
  params,
}: { children: React.ReactNode; params: { channelId: string } }) {
  const channel = await fetchChannel(params.channelId);
  return (
    <PageNavigation sidebar={<ChannelSidebar channel={channel} />}>
      <NavigationHeader title={channel.name} />
      <ChannelHeader channel={channel} />
      {children}
    </PageNavigation>
  );
}
