import {
  EventAction,
  EventActionData,
  EventService,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  RawEvent,
  UserEvent,
  UserEventData,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleCastAddOrRemove } from "./farcaster/castAddOrRemove";
import { handleCastReactionAddOrRemove } from "./farcaster/castReactionAddOrRemove";
import { handleUrlReactionAddOrRemove } from "./farcaster/urlReactionAddOrRemove";
import { handleLinkAddOrRemove } from "./farcaster/linkAddOrRemove";
import { publishActionRequests } from "@flink/common/queues";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<RawEvent<T>>) => {
    const rawEvent = job.data;

    let response: {
      event: UserEvent<UserEventData>;
      actions: EventAction<EventActionData>[];
    };

    switch (rawEvent.source.service) {
      case EventService.FARCASTER:
        switch (rawEvent.source.type) {
          case EventType.CAST_ADD:
          case EventType.CAST_REMOVE:
            response = await handleCastAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastData>,
            );
            break;
          case EventType.CAST_REACTION_ADD:
          case EventType.CAST_REACTION_REMOVE:
            response = await handleCastReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastReactionData>,
            );
            break;
          case EventType.URL_REACTION_ADD:
          case EventType.URL_REACTION_REMOVE:
            response = await handleUrlReactionAddOrRemove(
              rawEvent as RawEvent<FarcasterUrlReactionData>,
            );
            break;
          case EventType.LINK_ADD:
          case EventType.LINK_REMOVE:
            response = await handleLinkAddOrRemove(
              rawEvent as RawEvent<FarcasterLinkData>,
            );
            break;
          default:
            throw new Error(
              `[${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
            );
        }
        break;
      default:
        throw new Error(`[${rawEvent.source.service}] no handler found`);
    }

    await Promise.all([
      client.upsertEvent(response.event),
      client.upsertActions(response.actions),
      publishActionRequests(response.actions),
    ]);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.userId}`,
    );
  };
};
