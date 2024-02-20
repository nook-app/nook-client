import { ContentChannel, Entity } from "@nook/common/types";
import { MongoClient, MongoCollection } from "../mongo";

type WarpcastChannelData = {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  leadFid?: number;
  createdAt: number;
};

export const getChannelDataFromWarpcast = async (
  client: MongoClient,
  contentId: string,
) => {
  const response = await fetch("https://api.warpcast.com/v2/all-channels");
  if (!response.ok) return;

  const data = await response.json();
  const channels: WarpcastChannelData[] = data?.result?.channels;
  if (!channels) return;

  const channelData = channels.find((channel) => channel.url === contentId);
  if (!channelData) return;

  let entity: Entity | undefined;
  if (channelData.leadFid) {
    entity = (await client
      .getCollection<Entity>(MongoCollection.Entity)
      .findOne({
        "farcaster.fid": channelData.leadFid.toString(),
      })) as Entity | undefined;
  }

  const channel: ContentChannel = {
    id: channelData.id,
    name: channelData.name,
    url: channelData.url,
    description: channelData.description,
    imageUrl: channelData.imageUrl,
    creatorId: entity?._id,
    createdAt: new Date(channelData.createdAt),
  };

  return channel;
};
