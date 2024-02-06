import { QueueName, getQueue } from "@flink/common/queues";
import { getContentHandler } from "./handlers";

const run = async () => {
  const queue = getQueue(QueueName.Content);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  const handler = await getContentHandler();
  if (job) {
    await handler(job);
  } else {
    // @ts-ignore
    await handler({ data: { contentId: process.argv[2] } });
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
