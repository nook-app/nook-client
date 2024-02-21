import {
  EventAction,
  EventActionData,
  EventService,
  RawEvent,
  EntityEvent,
  EntityEventData,
  Content,
  ContentData,
  ContentType,
  PostData,
} from "@nook/common/types";
import { MongoClient } from "@nook/common/mongo";
import { Job } from "bullmq";
import { publishContent } from "@nook/common/queues";
import { getOrCreateChannel } from "@nook/common/scraper";
import { handleFarcasterEvent } from "./farcaster";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<RawEvent<EntityEventData>>) => {
    const rawEvent = job.data;

    let response:
      | {
          event: EntityEvent<EntityEventData>;
          actions: EventAction<EventActionData>[];
          content: Content<ContentData>[];
        }
      | undefined;

    switch (rawEvent.source.service) {
      case EventService.FARCASTER:
        response = await handleFarcasterEvent(client, rawEvent);
        break;
      default:
        throw new Error(`[${rawEvent.source.service}] no handler found`);
    }

    if (!response) return;

    await Promise.all([
      client.upsertEvent(response.event),
      ...response.actions.map((action) => client.upsertAction(action)),
      ...response.content.map(async (content) => {
        await client.upsertContent(content);

        if (
          content.type === ContentType.POST ||
          content.type === ContentType.REPLY
        ) {
          const postData = content.data as PostData;
          for (const embed of postData.embeds) {
            if (!(await client.findContent(embed))) {
              await publishContent(embed);
            }
          }

          if (postData.channelId) {
            await getOrCreateChannel(client, postData.channelId);
          }
        }
      }),
    ]);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
