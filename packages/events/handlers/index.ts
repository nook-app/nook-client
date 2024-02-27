import {
  EventService,
  RawEvent,
  EntityEventData,
  EventType,
  FarcasterCastData,
} from "@nook/common/types";
import { MongoClient } from "@nook/common/mongo";
import { RedisClient } from "@nook/common/cache";
import { getOrCreateContent } from "@nook/common/scraper";
import { Job } from "bullmq";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  const redis = new RedisClient();
  await redis.connect();

  return async (job: Job<RawEvent<EntityEventData>>) => {
    const rawEvent = job.data;

    switch (rawEvent.source.service) {
      case EventService.FARCASTER: {
        switch (rawEvent.source.type) {
          case EventType.CAST_ADD: {
            const typedEvent = rawEvent as RawEvent<FarcasterCastData>;
            await Promise.all(
              typedEvent.data.embeds.map((embed) =>
                getOrCreateContent(client, embed),
              ),
            );
          }
        }
        break;
      }
      default:
        throw new Error(`[${rawEvent.source.service}] no handler found`);
    }

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
