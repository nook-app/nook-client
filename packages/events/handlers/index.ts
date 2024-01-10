import {
  EventService,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  RawEvent,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleCastAddOrRemove } from "./farcaster/castAddOrRemove";
import { handleCastReactionAddOrRemove } from "./farcaster/castReactionAddOrRemove";
import { handleUrlReactionAddOrRemove } from "./farcaster/urlReactionAddOrRemove";
import { handleLinkAddOrRemove } from "./farcaster/linkAddOrRemove";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<RawEvent<T>>) => {
    const rawEvent = job.data;

    console.time("handleEvent");

    switch (rawEvent.source.service) {
      case EventService.FARCASTER:
        switch (rawEvent.source.type) {
          case EventType.CAST_ADD:
          case EventType.CAST_REMOVE:
            await handleCastAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastData>,
            );
            break;
          case EventType.CAST_REACTION_ADD:
          case EventType.CAST_REACTION_REMOVE:
            await handleCastReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastReactionData>,
            );
            break;
          case EventType.URL_REACTION_ADD:
          case EventType.URL_REACTION_REMOVE:
            await handleUrlReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterUrlReactionData>,
            );
            break;
          case EventType.LINK_ADD:
          case EventType.LINK_REMOVE:
            await handleLinkAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterLinkData>,
            );
            break;
          default:
            throw new Error(
              `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
            );
        }
        break;
      default:
        throw new Error(
          `[events] [${rawEvent.source.service}] no handler found`,
        );
    }

    console.timeEnd("handleEvent");

    console.log(
      `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.userId}`,
    );
  };
};
