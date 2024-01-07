import { EventService, RawEvent } from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { HandlerArgs } from "../types";
import { handleFarcasterEvent } from "./farcaster";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<RawEvent>) => {
    const rawEvent = job.data;

    const args: HandlerArgs = {
      client,
      rawEvent,
    };

    let handler: (args: HandlerArgs) => Promise<void> | undefined;

    if (rawEvent.source.service === EventService.FARCASTER) {
      handler = handleFarcasterEvent;
    }

    if (!handler) {
      throw new Error(
        `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] [${rawEvent.source.id}] no handler found`,
      );
    }

    await handler(args);

    console.log(
      `[events] [${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.userId}`,
    );
  };
};
