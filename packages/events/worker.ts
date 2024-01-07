import { QueueName, getWorker } from "@flink/common/queues";
import { getEventsHandler } from "./handlers";

const run = async () => {
  const handler = await getEventsHandler();
  const worker = getWorker(QueueName.Events, handler);

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[events] [${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
