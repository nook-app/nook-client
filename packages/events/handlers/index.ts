import {
  EventService,
  RawEvent,
  EntityEventData,
  ContentType,
  PostData,
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

    await Promise.all([
      ...response.events.flatMap(({ event }) => client.upsertEvent(event)),
      ...response.events.flatMap(({ actions }) =>
        actions.flatMap((action) => client.upsertAction(action)),
      ),
      ...(response.contents?.map(async (content) => {
        await client.upsertContent(content);
        if (
          content.type === ContentType.POST ||
          content.type === ContentType.REPLY
        ) {
          const postData = content.data as PostData;
          for (const embed of postData.embeds) {
            if (embed.startsWith("farcaster://")) continue;
            if (!(await client.findContent(embed))) {
              await publishContent(embed);
            }
          }

          if (postData.channelId) {
            await getOrCreateChannel(client, postData.channelId);
          }
        }
      }) || []),
    ]);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
