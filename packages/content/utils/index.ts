import { MongoClient } from "@flink/common/mongo";
import { QueueName, getQueue } from "@flink/common/queues";
import { Content, ContentRequest } from "@flink/common/types";

export const publishContentRequest = async (request: ContentRequest) => {
  const queue = getQueue(QueueName.ContentIngress);
  await queue.add(request.contentId, request);
};

export const publishContentRequests = async (requests: ContentRequest[]) => {
  const uniqueRequests = requests.reduce(
    (acc, request) => {
      acc[request.contentId] = request;
      return acc;
    },
    {} as Record<string, ContentRequest>,
  );
  const queue = getQueue(QueueName.ContentIngress);
  await queue.addBulk(
    Object.values(uniqueRequests).map((r) => ({ name: r.contentId, data: r })),
  );
};
