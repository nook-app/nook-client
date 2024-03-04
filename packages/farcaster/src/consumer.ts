import { QueueName, getWorker } from "@nook/common/queues";
import { FarcasterEventProcessor } from "./processor";

const run = async () => {
  const processor = new FarcasterEventProcessor();
  const worker = getWorker(QueueName.Farcaster, async (job) => {
    await processor.process(job.data);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
