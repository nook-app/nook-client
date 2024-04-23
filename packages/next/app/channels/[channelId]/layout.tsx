import { fetchChannel } from "@nook/app/api/farcaster";
import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { ChannelSidebar } from "@nook/app/features/farcaster/channel-profile/channel-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function Channel({
  children,
  params,
}: { children: React.ReactNode; params: { channelId: string } }) {
  const channel = await fetchChannel(params.channelId);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["channel", params.channelId],
    queryFn: () => fetchChannel(params.channelId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageNavigation
        sidebar={<ChannelSidebar channelId={params.channelId} />}
        headerTitle={channel.name}
      >
        <ChannelHeader channelId={params.channelId} />
        {children}
      </PageNavigation>
    </HydrationBoundary>
  );
}
