import { fetchChannel } from "@nook/app/api/farcaster";
import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { ChannelSidebar } from "@nook/app/features/farcaster/channel-profile/channel-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { Metadata, ResolvingMetadata } from "next";
import { TabNavigation } from "@nook/app/features/tabs";

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
      <TabNavigation
        tabs={[
          {
            id: "relevant",
            label: "Relevant",
            href: `/channels/${channel.channelId}`,
          },
          {
            id: "all",
            label: "All",
            href: `/channels/${channel.channelId}/all`,
          },
          {
            id: "from-hosts",
            label: "From Hosts",
            href: `/channels/${channel.channelId}/from-hosts`,
          },
          {
            id: "media",
            label: "Media",
            href: `/channels/${channel.channelId}/media`,
          },
        ]}
      >
        {children}
      </TabNavigation>
    </PageNavigation>
  );
}
