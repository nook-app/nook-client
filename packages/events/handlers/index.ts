import {
  EventService,
  EventType,
  FarcasterCastAddData,
  FarcasterCastReactionData,
  FarcasterUrlReactionData,
  RawEvent,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleCastAdd } from "./farcaster/castAdd";
import { handleCastReactionAddOrRemove } from "./farcaster/castReactionAddOrRemove";
import { handleUrlReactionAddOrRemove } from "./farcaster/urlReactionAddOrRemove";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<RawEvent<T>>) => {
    const rawEvent = job.data;

    switch (rawEvent.source.service) {
      case EventService.FARCASTER:
        switch (rawEvent.source.type) {
          case EventType.CAST_ADD:
            await handleCastAdd(
              client,
              rawEvent as RawEvent<FarcasterCastAddData>,
            );
            break;
          case EventType.CAST_REACTION_ADD || EventType.CAST_REACTION_REMOVE:
            await handleCastReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastReactionData>,
            );
            break;
          case EventType.URL_REACTION_ADD || EventType.URL_REACTION_REMOVE:
            await handleUrlReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterUrlReactionData>,
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

    console.log(
      `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.userId}`,
    );
  };
};
