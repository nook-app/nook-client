import { fetchChannel } from "@nook/app/api/farcaster";
import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { ChannelSidebar } from "@nook/app/features/farcaster/channel-profile/channel-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { channelId: string } },
  parent: ResolvingMetadata,
): Promise<Metadata | ResolvingMetadata> {
  const channel = await fetchChannel(params.channelId);
  if (!channel) return parent;

  return {
    title: channel.name,
    description: channel.description,
    openGraph: {
      title: channel.name,
      description: channel.description,
      images: [
        {
          url: channel.imageUrl,
          alt: channel.name,
        },
      ],
    },
    manifest: "/manifest.json",
  };
}

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
