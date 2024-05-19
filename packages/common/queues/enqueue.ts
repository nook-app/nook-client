import { QueueName, getQueue } from ".";
import {
  EntityEvent,
  EntityEventData,
  EventSource,
  Notification,
} from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishEvent = async (
  event: EntityEvent<EntityEventData>,
  priority = false,
) => {
  const jobId = toJobId(event.source);
  const eventData = JSON.parse(
    JSON.stringify(event, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );

  const queue = getQueue(
    priority ? QueueName.EventsPriority : QueueName.Events,
  );
  await queue.add(jobId, eventData, {
    jobId,
    removeOnComplete: {
      count: 10000,
    },
  });
};

export const publishNotification = async (notification: Notification) => {
  const jobId = `${notification.service}-${notification.type}-${notification.sourceId}-${notification.fid}`;
  const notificationData = JSON.parse(
    JSON.stringify(notification, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );

  const queue = getQueue(QueueName.Notifications);
  await queue.add(jobId, notificationData, {
    jobId,
    removeOnComplete: {
      count: 10000,
    },
  });
};

export const publishContent = async (uri: string) => {
  const queue = getQueue(QueueName.Content);
  await queue.add(
    uri,
    {
      uri,
    },
    {
      jobId: uri,
      removeOnComplete: {
        count: 10000,
      },
    },
  );
};
