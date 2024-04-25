import { Channel } from "@nook/app/types";
import { getServerSession } from "../../server/auth";

interface NeynarChannel {
  id: string;
  url: string;
  name: string;
  description: string;
  follower_count: number;
  object: string;
  image_url: string;
  created_at: number;
  parent_url: string;
  lead: {
    fid: number;
  };
  hosts: {
    fid: number;
  }[];
}

export async function getTrendingChannels() {
  const res = await fetch(
    "https://api.neynar.com/v2/farcaster/channel/trending?time_window=1d&limit=25",
    {
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    },
  );

  const neynarChannels: {
    channels: {
      channel: NeynarChannel;
    }[];
    next: {
      cursor: string;
    };
  } = await res.json();

  return neynarChannels.channels.map((channel) =>
    mapToNookChannel(channel.channel),
  );
}

export async function getRecommendedChannels() {
  const session = await getServerSession();
  if (!session?.fid) {
    return await getTrendingChannels();
  }

  const res = await fetch(
    `https://api.neynar.com/v2/farcaster/channel/user?fid=${session.fid}&limit=20`,
    {
      headers: {
        "Content-Type": "application/json",
        api_key: process.env.NEYNAR_API_KEY as string,
      },
    },
  );

  const neynarChannels: {
    channels: NeynarChannel[];
    next: {
      cursor: string;
    };
  } = await res.json();

  return neynarChannels.channels.map(mapToNookChannel);
}

const mapToNookChannel = (channel: NeynarChannel): Channel => ({
  channelId: channel.id,
  url: channel.url,
  name: channel.name,
  description: channel.description,
  imageUrl: channel.image_url,
  followerCount: channel.follower_count,
  leadFid: channel.lead?.fid.toString(),
  hostFids: channel.hosts.map((host) => host.fid.toString()),
  createdAt: channel.created_at
    ? new Date(channel.created_at * 1000)
    : new Date(),
  updatedAt: channel.created_at
    ? new Date(channel.created_at * 1000)
    : new Date(),
});
