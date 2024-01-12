import { QueueName, getWorker } from "@flink/common/queues";
import { getContentHandler } from "./handlers";

const run = async () => {
  const worker = getWorker(QueueName.Content, await getContentHandler());

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
