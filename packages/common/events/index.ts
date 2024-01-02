import { QueueName, getQueue } from "../queues";
import { EventSource, RawEventData } from "../types";

export const publishRawEvent = async (
  source: EventSource,
  sourceEventId: string,
  timestamp: number,
  data: RawEventData,
) => {
  const queue = getQueue(QueueName.Events);
  await queue.add(`${source}-${sourceEventId}`, {
    timestamp,
    source,
    sourceEventId,
    data,
  });
};
