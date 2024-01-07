import { QueueName, getQueue } from "../queues";
import { RawEvent } from "../types";

export const publishRawEvent = async <T>(event: RawEvent<T>) => {
  const eventId = `${event.source.service}-${event.source.id}`;
  const queue = getQueue(QueueName.Events);
  await queue.add(eventId, event);
};

export const publishRawEvents = async <T>(events: RawEvent<T>[]) => {
  if (!events.length) return;
  const queue = getQueue(QueueName.Events);
  await queue.addBulk(
    events.map((event) => ({
      name: `${event.source.service}-${event.source.id}`,
      data: event,
    })),
  );
};
