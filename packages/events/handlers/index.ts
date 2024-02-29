import { EntityEvent, EntityEventData, EventService } from "@nook/common/types";
import { Job } from "bullmq";
import { FarcasterProcessor } from "./farcaster";

export const getEventsHandler = async () => {
  const farcasterProcessor = new FarcasterProcessor();

  return async (job: Job<EntityEvent<EntityEventData>>) => {
    const event = job.data;

    switch (event.source.service) {
      case EventService.FARCASTER: {
        await farcasterProcessor.process(event);
        break;
      }
      default:
        console.error(`Unknown service: ${event.source.service}`);
        return;
    }

    console.log(
      `[${event.source.service}] [${event.source.type}] processed ${event.source.id}}`,
    );
  };
};
