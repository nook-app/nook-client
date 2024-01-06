import { QueueName, getQueue } from "@flink/common/queues";
import { ContentRequest } from "@flink/common/types";

export const publishContentRequests = async (requests: ContentRequest[]) => {
  const queue = getQueue(QueueName.ContentIngress);
  await queue.addBulk(requests.map((r) => ({ name: r.contentId, data: r })));
};
