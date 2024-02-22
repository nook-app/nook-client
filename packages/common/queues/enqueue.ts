import { QueueName, getQueue } from ".";
import { EntityEventData, EventSource, RawEvent } from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishRawEvent = async (event: RawEvent<EntityEventData>) => {
  const jobId = toJobId(event.source);
  const queue = getQueue(QueueName.Events);
  await queue.add(jobId, event, {
    jobId,
    removeOnComplete: {
      count: 10000,
    },
  });
};

export const publishRawEvents = async (events: RawEvent<EntityEventData>[]) => {
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

export const publishAction = async (actionId: string, created: boolean) => {
  const queue = getQueue(QueueName.Actions);
  await queue.add(
    actionId,
    { actionId, created },
    {
      jobId: actionId,
      removeOnComplete: {
        count: 10000,
      },
    },
  );
};
