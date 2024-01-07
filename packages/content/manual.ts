import { QueueName, getQueue } from "@flink/common/queues";
import { getContentHandler } from "./handlers";

const run = async () => {
  const queue = getQueue(QueueName.ContentIngress);
  console.log(process.argv[2]);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    const handler = await getContentHandler();
    await handler(job);
  }
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
