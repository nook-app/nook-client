import { QueueName, getQueue } from ".";
import { EntityEvent, EntityEventData, EventSource } from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishEvents = async (events: EntityEvent<EntityEventData>[]) => {
  if (!events.length) return;
  const queue = getQueue(QueueName.Events);
  await queue.addBulk(
    events.map((event) => {
      const jobId = toJobId(event.source);
      return {
        name: jobId,
        data: event,
        opts: {
          jobId,
          removeOnComplete: {
            count: 10000,
          },
        },
      };
    }),
  );
};

export const publishContent = async (contentId: string) => {
  const queue = getQueue(QueueName.Content);
  await queue.add(
    contentId,
    { contentId },
    {
      jobId: contentId,
      removeOnComplete: {
        count: 10000,
      },
    },
  );
};
