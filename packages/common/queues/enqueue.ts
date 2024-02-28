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
      const eventData = JSON.parse(
        JSON.stringify(event, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      );
      return {
        name: jobId,
        data: eventData,
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
