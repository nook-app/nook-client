import {
  EventService,
  RawEvent,
  EntityEventData,
  ContentType,
  PostData,
  Content,
  ContentData,
} from "@nook/common/types";
import { MongoClient } from "@nook/common/mongo";
import { RedisClient } from "@nook/common/cache";
import { Job } from "bullmq";
import { publishContent } from "@nook/common/queues";
import { getOrCreateChannel } from "@nook/common/scraper";
import { FarcasterProcessor } from "./farcaster/processor";
import { EventHandlerResponse } from "../types";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  const redis = new RedisClient();
  await redis.connect();

  const fetchOrPublishContent = async (contentId: string) => {
    const cachedContent = await redis.getContent(contentId);
    if (cachedContent) return;
    const existingContent = await client.findContent(contentId);
    if (existingContent) {
      await redis.setContent(existingContent);
      return;
    }
    await publishContent(contentId);
  };

  const upsertContentPromises = (content: Content<ContentData>) => {
    const promises = [];
    promises.push(client.upsertContent(content));
    if (![ContentType.POST, ContentType.REPLY].includes(content.type))
      return promises;
    const post = content.data as PostData;
    for (const embed of post.embeds) {
      if (embed.startsWith("farcaster://")) continue;
      promises.push(fetchOrPublishContent(embed));
    }
    if (post.channelId) {
      promises.push(getOrCreateChannel(client, redis, post.channelId));
    }
    return promises;
  };

  return async (job: Job<RawEvent<EntityEventData>>) => {
    const rawEvent = job.data;

    let response: EventHandlerResponse | undefined;

    switch (rawEvent.source.service) {
      case EventService.FARCASTER: {
        response = await new FarcasterProcessor(client, redis).process(
          rawEvent,
        );
        break;
      }
      default:
        throw new Error(`[${rawEvent.source.service}] no handler found`);
    }

    if (!response) return;

    const promises = [];
    for (const event of response.events) {
      promises.push(client.upsertEvent(event.event));
      for (const action of event.actions) {
        promises.push(client.upsertAction(action));
      }
    }

    for (const content of response.contents || []) {
      promises.push(...upsertContentPromises(content));
    }

    console.log(promises);

    await Promise.all(promises);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
