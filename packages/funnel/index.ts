import { QueueName, getWorker } from "@flink/common/queue";
import { Job } from "bullmq";

const run = async () => {
  const worker = getWorker(QueueName.Funnel, async (job: Job) => {
    console.log(`[funnel] processing event ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[funnel] [${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
