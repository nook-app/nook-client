import { QueueName, getQueue } from ".";
import {
  ContentRequest,
  EventAction,
  EventActionData,
  EventSource,
  RawEvent,
} from "../types";

export const toJobId = (source: EventSource) => {
  return `${source.service}-${source.type}-${source.id}`;
};

export const publishRawEvent = async <T>(
  event: RawEvent<T>,
  backfill = false,
) => {
  const jobId = toJobId(event.source);
  const queue = getQueue(
    backfill ? QueueName.EventsBackfill : QueueName.Events,
  );
  await queue.add(jobId, event, { jobId });
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

export const publishContentRequest = async (request: ContentRequest) => {
  const queue = getQueue(QueueName.Content);
  await queue.add(request.contentId, request, {
    jobId: request.contentId,
  });
};

export const publishContentRequests = async (requests: ContentRequest[]) => {
  const queue = getQueue(QueueName.Content);
  await queue.addBulk(
    requests.map((request) => ({
      name: request.contentId,
      data: request,
      opts: { jobId: request.contentId },
    })),
  );
};

export const publishActionRequests = async (
  actions: EventAction<EventActionData>[],
) => {
  const queue = getQueue(QueueName.Actions);
  await queue.addBulk(
    actions.map((action) => ({
      name: `${action.eventId}-${action.type}`,
      data: action,
      opts: { jobId: `${action.eventId}-${action.type}` },
    })),
  );
};
