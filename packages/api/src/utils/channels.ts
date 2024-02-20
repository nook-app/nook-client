import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { getOrCreateContent } from "@nook/common/scraper";
import {
  Content,
  ContentChannel,
  ContentData,
  Entity,
} from "@nook/common/types";

type WarpcastChannelData = {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  leadFid?: number;
  createdAt: number;
};

export const getContentWithChannel = async (
  client: MongoClient,
  contentId: string,
) => {
  let content = (await client.findContent(contentId)) as
    | Content<ContentData>
    | undefined;

  if (!content) {
    content = await getOrCreateContent(client, contentId);
    if (!content) return;
  }

  if (content.channel) return content;

  const channelData = await getChannelDataFromWarpcast(contentId);
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

  await client
    .getCollection<Content<ContentData>>(MongoCollection.Content)
    .updateOne(
      { contentId },
      {
        $set: {
          channel,
        },
      },
    );

  return {
    ...content,
    channel,
  };
};

const getChannelDataFromWarpcast = async (contentId: string) => {
  const response = await fetch("https://api.warpcast.com/v2/all-channels");
  if (!response.ok) return;

  const data = await response.json();
  const channels: WarpcastChannelData[] = data?.result?.channels;
  if (!channels) return;

  return channels.find((channel) => channel.url === contentId);
};
