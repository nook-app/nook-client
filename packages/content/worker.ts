import { QueueName, getWorker } from "@flink/common/queues";
import { getContentHandler } from "./handlers";

const run = async () => {
  const queueName =
    process.argv[2] === "--backfill"
      ? QueueName.ContentBackfill
      : QueueName.ContentIngress;

  const handler = await getContentHandler();
  const worker = getWorker(queueName, handler);

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[content] [${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
