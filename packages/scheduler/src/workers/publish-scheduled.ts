import { QueueName, getWorker } from "@nook/common/queues";
import { ScheduledCastEventProcessor } from "../processors/ScheduledCastProcessor";
const processor = new ScheduledCastEventProcessor();

const run = async () => {
  const worker = getWorker(QueueName.ScheduledCast, async (job) => {
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
