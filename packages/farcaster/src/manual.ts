import { QueueName, getQueue } from "@nook/common/queues";
import { FarcasterEventProcessor } from "./processor";

const run = async () => {
  const processor = new FarcasterEventProcessor();

  const queue = getQueue(QueueName.Farcaster);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    await processor.process(job.data);
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
