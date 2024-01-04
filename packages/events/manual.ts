import { QueueName, getQueue } from "@flink/common/queues";
import { getEventsHandler } from "./handler";

const run = async () => {
  const queue = getQueue(QueueName.Events);
  console.log(process.argv[2]);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    const handler = await getEventsHandler();
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
