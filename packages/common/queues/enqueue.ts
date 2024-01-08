import { QueueName, getQueue } from ".";
import { ContentRequest, RawEvent } from "../types";

export const publishRawEvent = async <T>(
  event: RawEvent<T>,
  backfill = false,
) => {
  const eventId = `${event.source.service}-${event.source.id}`;
  const queue = getQueue(
    backfill ? QueueName.EventsBackfill : QueueName.Events,
  );
  await queue.add(eventId, event, {
    jobId: eventId,
  });
};

export const publishRawEvents = async <T>(
  events: RawEvent<T>[],
  backfill = false,
) => {
  if (!events.length) return;
  const queue = getQueue(
    backfill ? QueueName.EventsBackfill : QueueName.Events,
  );
  await queue.addBulk(
    events.map((event) => ({
      name: event.eventId,
      data: event,
      opts: {
        jobId: event.eventId,
      },
    })),
  );
};

export const publishContentRequest = async (
  request: ContentRequest,
  backfill = false,
) => {
  const queue = getQueue(
    backfill ? QueueName.ContentBackfill : QueueName.ContentIngress,
  );
  await queue.add(request.contentId, request, {
    jobId: request.contentId,
  });
};

export const publishContentRequests = async (
  requests: ContentRequest[],
  backfill = false,
) => {
  const queue = getQueue(
    backfill ? QueueName.ContentBackfill : QueueName.ContentIngress,
  );
  await queue.addBulk(
    requests.map((request) => ({
      name: request.contentId,
      data: request,
      opts: { jobId: request.contentId },
    })),
  );
};
