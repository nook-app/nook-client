import { QueueName, getQueue } from ".";
import { EntityEvent, EntityEventData, EventSource } from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishEvent = async (event: EntityEvent<EntityEventData>) => {
  const jobId = toJobId(event.source);
  const eventData = JSON.parse(
    JSON.stringify(event, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );

  const queue = getQueue(QueueName.Events);
  await queue.add(jobId, eventData, {
    jobId,
    removeOnComplete: {
      count: 10000,
    },
  });
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
