import { QueueName, getQueue } from "../queues";
import { EventSource, RawEventData } from "../types";

export const publishEvent = async (
  source: EventSource,
  sourceId: string,
  timestamp: number,
  data: RawEventData,
) => {
  const id = `${source}-${sourceId}`;
  const queue = getQueue(QueueName.Events);
  await queue.add(id, {
    id,
    timestamp,
    source,
    sourceId,
    data,
  });
};
