import { QueueName, getQueue } from ".";
import { EventSource, RawEvent } from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishRawEvent = async <T>(event: RawEvent<T>) => {
  const jobId = toJobId(event.source);
  const queue = getQueue(QueueName.Events);
  await queue.add(jobId, event, {
    jobId,
    removeOnComplete: {
      count: 10000,
    },
  });
};

export const publishRawEvents = async <T>(events: RawEvent<T>[]) => {
  if (!events.length) return;
  const queue = getQueue(QueueName.Events);
  await queue.addBulk(
    events.map((event) => {
      const jobId = toJobId(event.source);
      return {
        name: jobId,
        data: event,
        opts: { jobId },
      };
    }),
  );
};

export const publishContent = async <T>(contentId: string) => {
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

export const publishAction = async (actionId: string) => {
  const queue = getQueue(QueueName.Actions);
  await queue.add(
    actionId,
    { actionId },
    {
      jobId: actionId,
      removeOnComplete: {
        count: 10000,
      },
    },
  );
};
