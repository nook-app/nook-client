import { Channel } from "@nook/common/types";
import { MongoClient } from "../mongo";
import { RedisClient } from "../redis";

type WarpcastChannelData = {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  leadFid?: number;
  createdAt: number;
};

export const getOrCreateChannel = async (
  client: MongoClient,
  redis: RedisClient,
  contentId: string,
) => {
  const response = await fetch("https://api.warpcast.com/v2/all-channels");
  if (!response.ok) {
    throw new Error("Failed to fetch channels");
  }

  const data = await response.json();
  const channels: WarpcastChannelData[] = data?.result?.channels;
  if (!channels) {
    throw new Error("Channel not found");
  }

  const channelData = channels.find((channel) => channel.url === contentId);
  if (!channelData) {
    throw new Error("Channel not found");
  }

  const channel: Channel = {
    contentId,
    slug: channelData.id,
    name: channelData.name,
    description: channelData.description,
    imageUrl: channelData.imageUrl,
    createdAt: new Date(channelData.createdAt * 1000),
    updatedAt: new Date(),
  };

  await client.upsertChannel(channel);

  return channel;
};
