import { QueueName, getQueue } from "../queues";
import { EventSource, RawEventData } from "../types";

export const publishRawEvent = async (
  source: EventSource,
  sourceEventId: string,
  timestamp: number,
  data: RawEventData,
) => {
  const eventId = `${source}-${sourceEventId}`;
  const queue = getQueue(QueueName.Events);
  await queue.add(eventId, {
    eventId,
    timestamp,
    source,
    sourceEventId,
    data,
  });
};
