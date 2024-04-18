import {
  EntityEvent,
  EntityEventData,
  EventService,
  FarcasterEventType,
} from "@nook/common/types";
import { Job } from "bullmq";
import { FarcasterProcessor } from "./farcaster";
import { QueueName, publishEvent } from "@nook/common/queues";

export const getEventsHandler = async () => {
  const farcasterProcessor = new FarcasterProcessor();

  return async (job: Job<EntityEvent<EntityEventData>>) => {
    const event = job.data;

    const isPriority = job.queueName === QueueName.EventsPriority;

    switch (event.source.service) {
      case EventService.FARCASTER: {
        // Move non-priority events to the priority queue
        if (event.source.type === FarcasterEventType.CAST_ADD && !isPriority) {
          await publishEvent(event, true);
        } else {
          await farcasterProcessor.process(event);
        }
        break;
      }
      default:
        console.error(`Unknown service: ${event.source.service}`);
        return;
    }

    console.log(
      `[${event.source.service}] [${event.source.type}] processed ${event.source.id}`,
    );
  };
};
