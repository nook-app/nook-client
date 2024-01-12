import { QueueName, getQueue } from "@flink/common/queues";
import { getActionsHandler } from "./handlers";

const run = async () => {
  const queue = getQueue(QueueName.Actions);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    const handler = await getActionsHandler();
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
