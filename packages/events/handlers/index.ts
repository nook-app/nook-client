import {
  EventAction,
  EventActionData,
  EventService,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterVerificationData,
  RawEvent,
  EntityEvent,
  EntityEventData,
  Content,
  ContentData,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleCastAddOrRemove } from "./farcaster/castAddOrRemove";
import { handleCastReactionAddOrRemove } from "./farcaster/castReactionAddOrRemove";
import { handleUrlReactionAddOrRemove } from "./farcaster/urlReactionAddOrRemove";
import { handleLinkAddOrRemove } from "./farcaster/linkAddOrRemove";
import { handleUserDataAdd } from "./farcaster/userDataAdd";
import { handleVerificationAddOrRemove } from "./farcaster/verificationAddOrRemove";
import { publishAction } from "@flink/common/queues";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<RawEvent<T>>) => {
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
              client,
              rawEvent as RawEvent<FarcasterUrlReactionData>,
            );
            break;
          case EventType.LINK_ADD:
          case EventType.LINK_REMOVE:
            response = await handleLinkAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterLinkData>,
            );
            break;
          case EventType.USER_DATA_ADD:
            response = await handleUserDataAdd(
              client,
              rawEvent as RawEvent<FarcasterUserDataAddData>,
            );
            break;
          case EventType.VERIFICATION_ADD_ETH_ADDRESS:
          case EventType.VERIFICATION_REMOVE:
            response = await handleVerificationAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterVerificationData>,
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

    if (!response) return;

    await Promise.all([
      client.upsertEvent(response.event),
      ...response.actions.map(async (action) => {
        const _id = await client.upsertAction(action);
        await publishAction(_id.toString());
      }),
    ]);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
